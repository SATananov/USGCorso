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
  const identity = Object.fromEntries(['sourceSha', 'workflowSha', 'workflowRef', 'runId', 'runAttempt', 'artifactId', 'artifactDigest'].map(key => [key, expected[key]]));
  return { temp, root, manifest, output, metadata, expected, identity, writeManifest, writeMetadata };
}
function reject(t, mutate, pattern) {
  const f = setup(t);
  mutate(f);
  assert.throws(() => validateArtifact({ ...f, expected: f.identity }), pattern);
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
  const summary = validateArtifact({ ...f, expected: f.identity });
  assert.deepEqual(summary, { status: 'PASS', sourceSha: SOURCE_SHA, artifactDigest: ARTIFACT_DIGEST, fileCount: 4, totalBytes: f.expected.files.reduce((a, b) => a + b.size, 0) });
  for (const file of f.expected.files) {
    assert.deepEqual(fs.readFileSync(path.join(f.root, file.path)), fs.readFileSync(path.join(f.output, file.path)));
    if (process.platform !== 'win32') assert.equal(fs.statSync(path.join(f.output, file.path)).mode & 0o222, 0);
  }
});
test('CLI accepts explicit absolute arguments', t => { const f = setup(t); assert.equal(runCli(['--root', f.root, '--manifest', f.manifest, '--output', f.output, '--expected-source-sha', f.identity.sourceSha, '--expected-workflow-sha', f.identity.workflowSha, '--expected-workflow-ref', f.identity.workflowRef, '--expected-run-id', String(f.identity.runId), '--expected-run-attempt', String(f.identity.runAttempt), '--expected-artifact-id', String(f.identity.artifactId), '--expected-artifact-digest', f.identity.artifactDigest]).status, 'PASS'); });
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
test('reject symlink in export', t => { const f = setup(t); try { fs.symlinkSync(path.join(f.root, 'index.android.bundle'), path.join(f.root, 'assets/link.txt')); } catch (e) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) return t.skip('symlinks unavailable'); throw e; } assert.throws(() => validateArtifact({ ...f, expected: f.identity }), /symlink/); });
test('reject hardlink in export', t => reject(t, f => { fs.linkSync(path.join(f.root, 'index.android.bundle'), path.join(f.root, 'assets/copy.txt')); }, /hard-linked/));
test('reject FIFO or non-regular file', { skip: process.platform === 'win32' }, t => {
  const f = setup(t);
  const result = spawnSync('mkfifo', [path.join(f.root, 'assets/pipe')]);
  if (result.status !== 0) t.skip('mkfifo unavailable');
  assert.throws(() => validateArtifact({ ...f, expected: f.identity }), /non-regular/);
});

test('reject extra file', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'app.config.js'), 'throw new Error("EXECUTED")'), /unexpected or missing file/));
test('reject malformed metadata JSON', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'metadata.json'), '{not-json'), /JSON/));
test('reject duplicate keys in metadata', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'metadata.json'), '{"version":0,"version":0,"bundler":"metro","fileMetadata":{"android":{"bundle":"index.android.bundle","assets":[]}}}'), /duplicate JSON key/));
test('reject oversized metadata', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'metadata.json'), ' '.repeat(1024 * 1024 + 1)), /oversized/));
test('reject oversized assetmap', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'assetmap.json'), ' '.repeat(16 * 1024 * 1024 + 1)), /oversized/));
test('reject duplicate keys in manifest', t => reject(t, f => fs.writeFileSync(f.manifest, '{"schemaVersion":1,"schemaVersion":1}'), /duplicate JSON key/));
test('reject manifest missing file', t => reject(t, f => { f.expected.files.pop(); f.writeManifest(); }, /file count mismatch/));
test('reject manifest extra entry', t => reject(t, f => { f.expected.files.push({ path: 'extra', size: 0, sha256: sha('') }); f.writeManifest(); }, /file count mismatch/));
test('reject manifest size mismatch', t => reject(t, f => { f.expected.files[0].size++; f.writeManifest(); }, /byte total|size mismatch/));
test('reject wrong SHA-256 and clean partial output', t => reject(t, f => { f.expected.files.find(x => x.path === 'index.android.bundle').sha256 = sha('incorrect'); f.writeManifest(); }, /digest mismatch/));
test('reject output equal root', t => { const f = setup(t); assert.throws(() => validateArtifact({ ...f, expected: f.identity, output: f.root }), /target already exists|overlaps/); });
test('reject output under root', t => { const f = setup(t); assert.throws(() => validateArtifact({ ...f, expected: f.identity, output: path.join(f.root, 'validated') }), /overlaps/); });
test('reject existing output', t => { const f = setup(t); fs.mkdirSync(f.output); assert.throws(() => validateArtifact({ ...f, expected: f.identity }), /exists|existing/); });
test('reject input root symlink', t => { const f = setup(t); const link = path.join(f.temp, 'linked-root'); try { fs.symlinkSync(f.root, link, 'dir'); } catch (e) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) return t.skip('symlinks unavailable'); throw e; } assert.throws(() => validateArtifact({ ...f, expected: f.identity, root: link }), /symlink|not a regular directory/); });
test('reject config source without executing it', t => { const f = setup(t); const marker = path.join(f.temp, 'executed'); fs.writeFileSync(path.join(f.root, 'app.config.js'), `require('node:fs').writeFileSync(${JSON.stringify(marker)},'yes')`); assert.throws(() => validateArtifact({ ...f, expected: f.identity }), /unexpected or missing file/); assert.equal(fs.existsSync(marker), false); });
test('reject unsafe assetmap paths', t => reject(t, f => fs.writeFileSync(path.join(f.root, 'assetmap.json'), JSON.stringify({abc: {name:'ok',type:'png',httpServerLocation:'/assets/../secret'}})), /unsafe server location/));
test('reject manifest fields not in approved schema', t => reject(t, f => { f.expected.token = 'bad'; f.writeManifest(); }, /unexpected or missing fields/));
test('reject invalid file count cap', t => reject(t, f => { f.metadata.fileMetadata.android.assets = Array.from({length:2000}, (_,i)=>({path:`assets/a${i}.png`, ext:'png'})); f.writeMetadata(); }, /invalid assets/));
test('reject total expanded cap before copying', t => reject(t, f => { fs.writeFileSync(path.join(f.root,'assets/extra.png'), 'x'); f.metadata.fileMetadata.android.assets.push({path:'assets/extra.png', ext:'png'}); f.writeMetadata(); updateInventory(f); f.expected.files.push({path:'assets/extra.png',size:1,sha256:sha('x')}); f.expected.files.forEach(x => x.size = 64*1024*1024); f.writeManifest(); }, /expanded limit exceeded/));
test('reject per file cap', t => reject(t, f => { f.expected.files[0].size = 64*1024*1024+1; f.writeManifest(); }, /invalid integer/));

for (const field of ['sourceSha', 'workflowSha', 'workflowRef', 'runId', 'runAttempt', 'artifactId', 'artifactDigest']) {
  test(`reject mismatch with trusted ${field}`, t => reject(t, f => {
    f.identity[field] = typeof f.identity[field] === 'number' ? f.identity[field] + 1 : field === 'workflowRef' ? 'SATananov/USGCorso/.github/workflows/alternate.yml@refs/heads/main' : field === 'artifactDigest' ? `sha256:${'d'.repeat(64)}` : 'd'.repeat(40);
  }, /identity does not match/));
}

test('reject missing expected identity', t => {
  const f = setup(t);
  assert.throws(() => validateArtifact({ ...f, expected: undefined }), /expected identity/);
});
test('reject missing expected identity field', t => reject(t, f => { delete f.identity.runId; }, /unexpected or missing fields/));
test('reject expected identity with malformed digest', t => reject(t, f => { f.identity.artifactDigest = 'sha256:bad'; }, /invalid artifact digest/));
for (const filename of ['CON', 'NUL.txt', 'COM1.bin', 'LPT9', 'AUX.doc']) {
  test(`reject Windows device-name segment ${filename}`, t => reject(t, f => { f.metadata.fileMetadata.android.bundle = `assets/${filename}`; f.writeMetadata(); }, /reserved path segment/));
}
test('reject missing assetmap required field', t => reject(t, f => { fs.writeFileSync(path.join(f.root, 'assetmap.json'), JSON.stringify({ abc123: { name: 'icon', type: 'png' } })); }, /missing or unknown field/));
test('reject assetmap hash of wrong type', t => reject(t, f => { fs.writeFileSync(path.join(f.root, 'assetmap.json'), JSON.stringify({ abc123: { name: 'icon', type: 'png', httpServerLocation: '/assets', hash: 42 } })); }, /invalid hash/));
test('reject assetmap non-string name', t => reject(t, f => { fs.writeFileSync(path.join(f.root, 'assetmap.json'), JSON.stringify({ abc123: { name: 123, type: 'png', httpServerLocation: '/assets' } })); }, /invalid string/));
test('reject assetmap invalid scales', t => reject(t, f => { fs.writeFileSync(path.join(f.root, 'assetmap.json'), JSON.stringify({ abc123: { name: 'icon', type: 'png', httpServerLocation: '/assets', scales: ['1'] } })); }, /invalid scales/));
test('reject malformed expected workflow ref', t => reject(t, f => { f.identity.workflowRef = 'evil/repo/workflow@refs/heads/main'; }, /invalid workflow ref/));
test('reject invalid CLI argument count', t => { const f = setup(t); assert.throws(() => runCli(['--root', f.root, '--manifest', f.manifest, '--output', f.output]), /expected/); });
test('reject symlinked metadata file', t => {
  const f = setup(t); const original = path.join(f.root, 'metadata.json'); const elsewhere = path.join(f.temp, 'elsewhere.json');
  fs.renameSync(original, elsewhere);
  try { fs.symlinkSync(elsewhere, original); } catch (e) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) return t.skip('symlinks unavailable'); throw e; }
  assert.throws(() => validateArtifact({ ...f, expected: f.identity }), /symlink/);
});
test('reject symlinked manifest file', t => {
  const f = setup(t); const elsewhere = path.join(f.temp, 'elsewhere-manifest.json');
  fs.renameSync(f.manifest, elsewhere);
  try { fs.symlinkSync(elsewhere, f.manifest); } catch (e) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) return t.skip('symlinks unavailable'); throw e; }
  assert.throws(() => validateArtifact({ ...f, expected: f.identity }), /unsafe|symlink/);
});
test('reject extra nested empty directory', t => reject(t, f => { fs.mkdirSync(path.join(f.root, 'assets', 'unused')); }, /unexpected or missing directory/));


for (const [label, location] of [
  ['scoped npm asset location', '/assets/node_modules/@react-navigation/elements/lib/module/assets'],
  ['ordinary local assets', '/assets/assets/profile/avatars'],
]) {
  test(`accept legitimate Metro ${label}`, t => {
    const f = setup(t);
    fs.writeFileSync(path.join(f.root, 'assetmap.json'), JSON.stringify({ abc123: { name: 'back-icon', type: 'png', httpServerLocation: location } }));
    updateInventory(f);
    assert.equal(validateArtifact({ ...f, expected: f.identity }).status, 'PASS');
  });
}
for (const [label, location] of [
  ['scoped segment outside node_modules', '/assets/assets/@react-navigation/icons'],
  ['parent traversal', '/assets/node_modules/../secret'],
  ['encoded traversal segment', '/assets/node_modules/%2e%2e/secret'],
  ['backslash', '/assets/node_modules/\\evil'],
  ['invalid nested scoped segment', '/assets/node_modules/@react-navigation/@evil'],
]) {
  test(`reject unsafe Metro ${label}`, t => reject(t, f => {
    fs.writeFileSync(path.join(f.root, 'assetmap.json'), JSON.stringify({ abc123: { name: 'icon', type: 'png', httpServerLocation: location } }));
  }, /unsafe server location/));
}


test('accept real Expo _expo Android bundle path', t => {
  const f = setup(t);
  const bundle = '_expo/static/js/android/index-6032d155476c58dcd21a183e4b7833b4.hbc';
  fs.mkdirSync(path.join(f.root, '_expo/static/js/android'), { recursive: true });
  fs.renameSync(path.join(f.root, 'index.android.bundle'), path.join(f.root, bundle));
  f.metadata.fileMetadata.android.bundle = bundle;
  f.writeMetadata();
  f.expected.files.find(file => file.path === 'index.android.bundle').path = bundle;
  const metaFile = f.expected.files.find(file => file.path === 'metadata.json');
  metaFile.size = fs.statSync(path.join(f.root, 'metadata.json')).size;
  metaFile.sha256 = sha(fs.readFileSync(path.join(f.root, 'metadata.json')));
  f.writeManifest();
  assert.equal(validateArtifact({ ...f, expected: f.identity }).status, 'PASS');
});
test('accept real Windows Metro hash asset reference without rewriting signed metadata', t => {
  const f = setup(t);
  const hash = '778ffc9fe8773a878e9c30a6304784de';
  fs.renameSync(path.join(f.root, 'assets/icon.png'), path.join(f.root, `assets/${hash}`));
  f.metadata.fileMetadata.android.assets[0].path = `assets\\${hash}`;
  f.writeMetadata();
  f.expected.files.find(file => file.path === 'assets/icon.png').path = `assets/${hash}`;
  const metaFile = f.expected.files.find(file => file.path === 'metadata.json');
  metaFile.size = fs.statSync(path.join(f.root, 'metadata.json')).size;
  metaFile.sha256 = sha(fs.readFileSync(path.join(f.root, 'metadata.json')));
  f.writeManifest();
  assert.equal(validateArtifact({ ...f, expected: f.identity }).status, 'PASS');
  assert.deepEqual(fs.readFileSync(path.join(f.root, 'metadata.json')), fs.readFileSync(path.join(f.output, 'metadata.json')));
});
for (const [label, assetPath] of [
  ['parent traversal', String.raw`assets\\..\\secret`],
  ['mixed separators', String.raw`assets\\aabbccddeeff00112233445566778899/other`],
  ['nested path', String.raw`assets\\nested\\aabbccddeeff00112233445566778899`],
  ['drive prefix', String.raw`C:\\assets\\aabbccddeeff00112233445566778899`],
  ['UNC prefix', String.raw`\\\\server\\share`],
  ['nonhash asset', String.raw`assets\\icon.png`],
]) {
  test(`reject unsafe Windows metadata ${label}`, t => reject(t, f => {
    f.metadata.fileMetadata.android.assets[0].path = assetPath;
    f.writeMetadata();
  }, /unsafe path/));
}
test('reject bare _expo Android bundle path', t => reject(t, f => {
  f.metadata.fileMetadata.android.bundle = '_expo';
  f.writeMetadata();
}, /bundle must be a file under _expo/));
test('reject _expo directory in asset path', t => reject(t, f => {
  f.metadata.fileMetadata.android.assets[0].path = '_expo/secret';
  f.writeMetadata();
}, /unsupported or reserved/));
test('reject wrong underscore bundle directory', t => reject(t, f => {
  f.metadata.fileMetadata.android.bundle = '_hidden/static/index.hbc';
  f.writeMetadata();
}, /unsupported or reserved/));
test('reject nested underscore bundle directory', t => reject(t, f => {
  f.metadata.fileMetadata.android.bundle = 'assets/_expo/index.hbc';
  f.writeMetadata();
}, /unsupported or reserved/));
test('reject case-colliding Windows Metro asset references after normalization', t => reject(t, f => {
  const hash = 'a'.repeat(32);
  f.metadata.fileMetadata.android.assets = [
    { path: `assets\\${hash}`, ext: 'png' },
    { path: `assets/${hash.toUpperCase()}`, ext: 'png' },
  ];
  f.writeMetadata();
}, /duplicate/));
