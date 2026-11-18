import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { validateArtifact, runCli } from './validate-ota-artifact.mjs';

const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const SOURCE_SHA = 'a'.repeat(40);
const WORKFLOW_SHA = 'b'.repeat(40);
const ARTIFACT_DIGEST = `sha256:${'c'.repeat(64)}`;
function setup(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ota-validator-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const root = path.join(temp, 'export');
  const output = path.join(temp, 'validated');
  const manifest = path.join(temp, 'manifest.json');
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  const metadata = { version: 0, bundler: 'metro', fileMetadata: { android: { bundle: 'index.android.bundle', assets: [{ path: 'assets/icon.png', ext: 'png' }] } } };
  fs.writeFileSync(path.join(root, 'metadata.json'), JSON.stringify(metadata));
  fs.writeFileSync(path.join(root, 'assetmap.json'), JSON.stringify({ abc123: { name: 'icon', type: 'png', httpServerLocation: '/assets' } }));
  fs.writeFileSync(path.join(root, 'index.android.bundle'), 'android bundle');
  fs.writeFileSync(path.join(root, 'assets/icon.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const names = ['metadata.json', 'assetmap.json', 'index.android.bundle', 'assets/icon.png'];
  const expected = {
    schemaVersion: 1,
    sourceSha: SOURCE_SHA,
    workflowRef: 'SATananov/USGCorso/.github/workflows/ota-trusted-release.yml@refs/heads/main',
    workflowSha: WORKFLOW_SHA,
    runId: 12345,
    runAttempt: 1,
    artifactId: 123,
    artifactDigest: ARTIFACT_DIGEST,
    platform: 'android',
    files: names.map(name => {
      const bytes = fs.readFileSync(path.join(root, name));
      return { path: name, size: bytes.length, sha256: sha(bytes) };
    }),
  };
  const writeManifest = () => fs.writeFileSync(manifest, JSON.stringify(expected));
  const writeMetadata = () => fs.writeFileSync(path.join(root, 'metadata.json'), JSON.stringify(metadata));
  writeManifest();
  return { temp, root, manifest, output, metadata, expected, writeManifest, writeMetadata };
}
function reject(t, mutate, pattern) {
  const f = setup(t);
  mutate(f);
  assert.throws(() => validateArtifact(f), pattern);
  assert.equal(fs.existsSync(f.output), false);
}
function updateInventory(f) {
  const paths = ['metadata.json', 'assetmap.json', 'index.android.bundle', 'assets/icon.png'];
  f.expected.files = paths.map(name => {
    const bytes = fs.readFileSync(path.join(f.root, name));
    return { path: name, size: bytes.length, sha256: sha(bytes) };
  });
  f.writeManifest();
}
test('valid Android export generates byte-identical, read-only staged copy', t => {
  const f = setup(t);
  const summary = validateArtifact(f);
  assert.deepEqual(summary, { status: 'PASS', sourceSha: SOURCE_SHA, artifactDigest: ARTIFACT_DIGEST, fileCount: 4, totalBytes: f.expected.files.reduce((a, b) => a + b.size, 0) });
  for (const file of f.expected.files) {
    assert.deepEqual(fs.readFileSync(path.join(f.root, file.path)), fs.readFileSync(path.join(f.output, file.path)));
    if (process.platform !== 'win32') assert.equal(fs.statSync(path.join(f.output, file.path)).mode & 0o222, 0);
  }
});
test('CLI accepts explicit absolute arguments', t => { const f = setup(t); assert.equal(runCli(['--root', f.root, '--manifest', f.manifest, '--output', f.output]).status, 'PASS'); });
test('wrong metadata version', t => reject(t, f => { f.metadata.version = 1; f.writeMetadata(); }, /version or bundler/));
test('wrong bundler', t => reject(t, f => { f.metadata.bundler = 'webpack'; f.writeMetadata(); }, /version or bundler/));
test('iOS platform alongside android', t => reject(t, f => { f.metadata.fileMetadata.ios = f.metadata.fileMetadata.android; f.writeMetadata(); }, /unexpected or missing fields/));
test('web-only metadata', t => reject(t, f => { f.metadata.fileMetadata = { web: f.metadata.fileMetadata.android }; f.writeMetadata(); }, /unexpected or missing fields/));
test('missing bundle', t => reject(t, f => fs.rmSync(path.join(f.root, 'index.android.bundle')), /unexpected or missing file/));
test('missing asset', t => reject(t, f => fs.rmSync(path.join(f.root, 'assets/icon.png')), /unexpected or missing file/));
test('directory referenced as asset', t => reject(t, f => { fs.rmSync(path.join(f.root, 'assets/icon.png')); fs.mkdirSync(path.join(f.root, 'assets/icon.png')); }, /unexpected or missing file/));
for (const [title, bad] of [['traversal', '../escape.js'], ['absolute', '/tmp/escape.js'], ['drive letter', 'C:/escape.js'], ['backslash', 'assets\\icon.png'], ['dot segment', 'assets/./icon.png'], ['empty segment', 'assets//icon.png']]) {
  test(`reject ${title} metadata path`, t => reject(t, f => { f.metadata.fileMetadata.android.bundle = bad; f.writeMetadata(); }, /unsafe path|non-canonical path/));
}
test('reject duplicate bundle and asset path', t => reject(t, f => { f.metadata.fileMetadata.android.bundle = 'assets/icon.png'; f.writeMetadata(); }, /duplicate/));
test('reject case-colliding bundle and asset', t => reject(t, f => { f.metadata.fileMetadata.android.bundle = 'assets/ICON.PNG'; f.writeMetadata(); }, /duplicate/));
test('reject symlink in export', t => { const f = setup(t); try { fs.symlinkSync(path.join(f.root, 'index.android.bundle'), path.join(f.root, 'assets/link.txt')); } catch (e) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) return t.skip('symlinks unavailable'); throw e; } assert.throws(() => validateArtifact(f), /symlink/); });
test('reject hardlink in export', t => reject(t, f => { fs.linkSync(path.join(f.root, 'index.android.bundle'), path.join(f.root, 'assets/copy.txt')); }, /hard-linked/));
test('reject FIFO or non-regular file', { skip: process.platform === 'win32' }, t => {
  const f = setup(t);
  const result = spawnSync('mkfifo', [path.join(f.root, 'assets/pipe')]);
  if (result.status !== 0) t.skip('mkfifo unavailable');
  assert.throws(() => validateArtifact(f), /non-regular/);
});

test('reject extra file', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'app.config.js'), 'throw new Error("EXECUTED")'), /unexpected or missing file/));
test('reject malformed metadata JSON', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'metadata.json'), '{not-json'), /JSON/));
test('reject duplicate keys in metadata', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'metadata.json'), '{"version":0,"version":0,"bundler":"metro","fileMetadata":{"android":{"bundle":"index.android.bundle","assets":[]}}}'), /duplicate JSON key/));
test('reject oversized metadata', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'metadata.json'), ' '.repeat(1024 * 1024 + 1)), /oversized/));
test('reject oversized assetmap', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'assetmap.json'), ' '.repeat(16 * 1024 * 1024 + 1)), /oversized/));
test('reject duplicate keys in manifest', t => reject(t, f => fs.writeFileSync(f.manifest, '{"schemaVersion":1,"schemaVersion":1}'), /duplicate JSON key/));
test('reject manifest missing file', t => reject(t, f => { f.expected.files.pop(); f.writeManifest(); }, /file count mismatch/));
test('reject manifest extra entry', t => reject(t, f => { f.expected.files.push({ path: 'extra', size: 0, sha256: sha('') }); f.writeManifest(); }, /file count mismatch/));
test('reject manifest size mismatch', t => reject(t, f => { f.expected.files[0].size++; f.writeManifest(); }, /unsafe or changed/));
test('reject wrong SHA-256 and clean partial output', t => reject(t, f => { f.expected.files.find(x => x.path === 'index.android.bundle').sha256 = sha('incorrect'); f.writeManifest(); }, /digest mismatch/));
test('reject output equal root', t => { const f = setup(t); assert.throws(() => validateArtifact({ ...f, output: f.root }), /existing or symlinked parent|overlaps/); });
test('reject output under root', t => { const f = setup(t); assert.throws(() => validateArtifact({ ...f, output: path.join(f.root, 'validated') }), /overlaps/); });
test('reject existing output', t => { const f = setup(t); fs.mkdirSync(f.output); assert.throws(() => validateArtifact(f), /existing/); });
test('reject input root symlink', t => { const f = setup(t); const link = path.join(f.temp, 'linked-root'); try { fs.symlinkSync(f.root, link, 'dir'); } catch (e) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) return t.skip('symlinks unavailable'); throw e; } assert.throws(() => validateArtifact({ ...f, root: link }), /symlink/); });
test('reject config source without executing it', t => { const f = setup(t); const marker = path.join(f.temp, 'executed'); fs.writeFileSync(path.join(f.root, 'app.config.js'), `require('node:fs').writeFileSync(${JSON.stringify(marker)},'yes')`); assert.throws(() => validateArtifact(f), /unexpected or missing file/); assert.equal(fs.existsSync(marker), false); });
test('reject unsafe assetmap paths', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'assetmap.json'), JSON.stringify({abc: {name:'ok',type:'png',httpServerLocation:'/assets/../secret'}})), /unsafe server location/));
test('reject manifest fields not in approved schema', t => reject(t, f => { f.expected.token = 'bad'; f.writeManifest(); }, /unexpected or missing fields/));
test('reject invalid file count cap', t => reject(t, f => { f.metadata.fileMetadata.android.assets = Array.from({length:2000}, (_,i)=>({path:`assets/a${i}.png`, ext:'png'})); f.writeMetadata(); }, /invalid assets/));
test('reject total expanded cap before copying', t => reject(t, f => { fs.writeFileSync(path.join(f.root,'assets/extra.png'), 'x'); f.metadata.fileMetadata.android.assets.push({path:'assets/extra.png', ext:'png'}); f.writeMetadata(); updateInventory(f); f.expected.files.push({path:'assets/extra.png',size:1,sha256:sha('x')}); f.expected.files.forEach(x => x.size = 64*1024*1024); f.writeManifest(); }, /expanded limit exceeded/));
test('reject per file cap', t => reject(t, f => { f.expected.files[0].size = 64*1024*1024+1; f.writeManifest(); }, /invalid integer/));
