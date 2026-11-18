import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { verifyProvenance, runCli } from './verify-ota-provenance.mjs';

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'usg-ota-provenance-'));
  const archive = path.join(dir, 'artifact.zip');
  const contents = Buffer.from('fixture-only-archive-bytes');
  fs.writeFileSync(archive, contents);
  const digest = `sha256:${crypto.createHash('sha256').update(contents).digest('hex')}`;
  const policy = { repository: 'SATananov/USGCorso', repositoryId: 12345, workflowId: 42, workflowRunPath: '.github/workflows/ota-artifact-export.yml', sourceSha: 'a'.repeat(40), runId: 910, runAttempt: 2, artifactId: 650, artifactName: 'usgcorso-android-ota', event: 'workflow_dispatch', branch: 'main' };
  const run = { id: policy.runId, run_attempt: policy.runAttempt, workflow_id: policy.workflowId, path: policy.workflowRunPath, head_sha: policy.sourceSha, head_branch: policy.branch, event: policy.event, status: 'completed', conclusion: 'success', repository: { id: policy.repositoryId, full_name: policy.repository }, head_repository: { id: policy.repositoryId, full_name: policy.repository }, url: `https://api.github.com/repos/${policy.repository}/actions/runs/${policy.runId}` };
  const artifact = { id: policy.artifactId, name: policy.artifactName, expired: false, size_in_bytes: contents.length, digest, url: `https://api.github.com/repos/${policy.repository}/actions/artifacts/${policy.artifactId}`, workflow_run: { id: policy.runId, repository_id: policy.repositoryId, head_repository_id: policy.repositoryId, head_branch: policy.branch, head_sha: policy.sourceSha } };
  return { dir, archive, policy, run, artifact };
}
function checked(fn) {
  const f = fixture();
  try { fn(f); } finally { fs.rmSync(f.dir, { recursive: true, force: true }); }
}
test('accept matching offline fixtures and local digest', () => checked(f => {
  assert.equal(verifyProvenance(f).status, 'PASS');
  assert.equal(verifyProvenance(f).scope, 'offline-consistency-only');
}));
const cases = [
  ['reject repository substitution', f => { f.run.repository.full_name = 'other/repo'; }],
  ['reject repository ID mismatch', f => { f.run.repository.id = 42; }],
  ['reject head fork', f => { f.run.head_repository.id = 17; }],
  ['reject source SHA mismatch', f => { f.run.head_sha = 'b'.repeat(40); }],
  ['reject workflow path mismatch', f => { f.run.path = '.github/workflows/evil.yml'; }],
  ['reject ref-qualified workflow path', f => { f.policy.workflowRunPath = '.github/workflows/ota-artifact-export.yml@feature/eas-ota'; }],
  ['reject workflow ID mismatch', f => { f.run.workflow_id = 8; }],
  ['reject run ID mismatch', f => { f.run.id = 8; }],
  ['reject run attempt mismatch', f => { f.run.run_attempt = 1; }],
  ['reject run event mismatch', f => { f.run.event = 'pull_request'; }],
  ['reject unsuccessful run', f => { f.run.conclusion = 'failure'; }],
  ['reject incomplete run', f => { f.run.status = 'in_progress'; }],
  ['reject wrong branch', f => { f.run.head_branch = 'feature/eas-ota'; }],
  ['reject wrong API run URL', f => { f.run.url = 'https://example.invalid/other'; }],
  ['reject artifact ID mismatch', f => { f.artifact.id = 12; }],
  ['reject artifact name mismatch', f => { f.artifact.name = 'other'; }],
  ['reject expired artifact', f => { f.artifact.expired = true; }],
  ['reject missing digest', f => { f.artifact.digest = null; }],
  ['reject malformed digest', f => { f.artifact.digest = 'sha256:xyz'; }],
  ['reject artifact size mismatch', f => { f.artifact.size_in_bytes += 1; }],
  ['reject artifact origin run mismatch', f => { f.artifact.workflow_run.id = 1; }],
  ['reject artifact origin repository mismatch', f => { f.artifact.workflow_run.repository_id = 1; }],
  ['reject artifact origin branch mismatch', f => { f.artifact.workflow_run.head_branch = 'other'; }],
  ['reject artifact origin sha mismatch', f => { f.artifact.workflow_run.head_sha = 'b'.repeat(40); }],
  ['reject artifact API URL mismatch', f => { f.artifact.url = 'https://example.invalid'; }],
  ['reject modified archive digest', f => { fs.writeFileSync(f.archive, Buffer.from('tampered-archive-fixture-byte')); f.artifact.size_in_bytes = fs.statSync(f.archive).size; }],
  ['reject extra policy field', f => { f.policy.extra = true; }],
  ['reject invalid repository policy', f => { f.policy.repository = 'elsewhere/repo'; }],
  ['reject missing artifact workflow_run', f => { delete f.artifact.workflow_run; }],
];
for (const [name, change] of cases) {
  test(name, () => checked(f => { change(f); assert.throws(() => verifyProvenance(f)); }));
}
test('CLI accepts explicit independent local file paths', () => checked(f => {
  for (const [key, value] of [['policy', f.policy], ['run', f.run], ['artifact', f.artifact]]) fs.writeFileSync(path.join(f.dir, `${key}.json`), JSON.stringify(value));
  const result = runCli(['--policy', path.join(f.dir, 'policy.json'), '--run', path.join(f.dir, 'run.json'), '--artifact', path.join(f.dir, 'artifact.json'), '--archive', f.archive]);
  assert.equal(result.status, 'PASS');
}));
test('CLI rejects missing and duplicate arguments', () => {
  assert.throws(() => runCli(['--policy', 'x']));
  assert.throws(() => runCli(['--policy', 'x', '--policy', 'y', '--artifact', 'z', '--archive', 'a']));
});

function jsonFiles(f) {
  for (const [key, value] of [['policy', f.policy], ['run', f.run], ['artifact', f.artifact]]) {
    fs.writeFileSync(path.join(f.dir, `${key}.json`), JSON.stringify(value));
  }
}
function invokeCli(f) {
  return runCli(['--policy', path.join(f.dir, 'policy.json'), '--run', path.join(f.dir, 'run.json'), '--artifact', path.join(f.dir, 'artifact.json'), '--archive', f.archive]);
}
for (const input of ['policy', 'run', 'artifact']) {
  test(`reject ${input} JSON hardlink`, () => checked(f => {
    jsonFiles(f);
    const filename = path.join(f.dir, `${input}.json`);
    fs.linkSync(filename, path.join(f.dir, `${input}.hardlink`));
    assert.throws(() => invokeCli(f), /invalid file|unsafe/);
  }));
  test(`reject ${input} JSON oversized`, () => checked(f => {
    jsonFiles(f);
    const filename = path.join(f.dir, `${input}.json`);
    fs.truncateSync(filename, 512 * 1024 + 1);
    assert.throws(() => invokeCli(f), /invalid file|size cap/);
  }));
  test(`reject ${input} JSON symlink`, t => checked(f => {
    jsonFiles(f);
    const filename = path.join(f.dir, `${input}.json`);
    const original = `${filename}.original`;
    fs.renameSync(filename, original);
    try { fs.symlinkSync(original, filename, 'file'); }
    catch (error) {
      if (['EPERM', 'EACCES', 'ENOTSUP', 'ENOSYS'].includes(error.code)) { t.skip('symlinks unavailable'); return; }
      throw error;
    }
    assert.throws(() => invokeCli(f), /invalid file|unsafe/);
  }));
}
test('reject JSON replacement between open and completion', () => checked(f => {
  jsonFiles(f);
  const filename = path.join(f.dir, 'policy.json');
  const originalRead = fs.readSync;
  let swapped = false;
  try {
    fs.readSync = (...args) => {
      const result = originalRead(...args);
      if (!swapped) {
        swapped = true;
        fs.renameSync(filename, `${filename}.old`);
        fs.writeFileSync(filename, JSON.stringify(f.policy));
      }
      return result;
    };
    assert.throws(() => invokeCli(f), /changed or unsafe file/);
  } finally { fs.readSync = originalRead; }
  assert.equal(swapped, true);
}));
test('reject JSON mutation during reading', () => checked(f => {
  jsonFiles(f);
  const filename = path.join(f.dir, 'policy.json');
  const originalRead = fs.readSync;
  let changed = false;
  try {
    fs.readSync = (...args) => {
      const result = originalRead(...args);
      if (!changed) {
        changed = true;
        fs.appendFileSync(filename, ' ');
      }
      return result;
    };
    assert.throws(() => invokeCli(f), /changed or unsafe file|changed while reading/);
  } finally { fs.readSync = originalRead; }
  assert.equal(changed, true);
}));
test('reject archive hardlink', () => checked(f => {
  fs.linkSync(f.archive, path.join(f.dir, 'archive-linked.zip'));
  assert.throws(() => verifyProvenance(f), /archive: invalid file/);
}));
test('reject oversized archive without reading it', () => checked(f => {
  fs.truncateSync(f.archive, 512 * 1024 * 1024 + 1);
  f.artifact.size_in_bytes = fs.statSync(f.archive).size;
  assert.throws(() => verifyProvenance(f), /artifact: size cap exceeded|archive: size cap exceeded/);
}));
test('reject archive symlink', t => checked(f => {
  const original = path.join(f.dir, 'original.zip');
  fs.renameSync(f.archive, original);
  try { fs.symlinkSync(original, f.archive, 'file'); }
  catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP', 'ENOSYS'].includes(error.code)) { t.skip('symlinks unavailable'); return; }
    throw error;
  }
  assert.throws(() => verifyProvenance(f), /archive: invalid file/);
}));
test('reject archive change during read', () => checked(f => {
  const originalRead = fs.readSync;
  let changed = false;
  try {
    fs.readSync = (...args) => {
      const result = originalRead(...args);
      if (!changed) {
        changed = true;
        fs.appendFileSync(f.archive, Buffer.from('changed'));
      }
      return result;
    };
    assert.throws(() => verifyProvenance(f), /archive: (changed during read|grew during read)/);
  } finally { fs.readSync = originalRead; }
  assert.equal(changed, true);
}));

for (const input of ['policy', 'run', 'artifact']) {
  test(`reject duplicate top-level JSON keys in ${input}`, () => checked(f => {
    jsonFiles(f);
    const filename = path.join(f.dir, `${input}.json`);
    const original = fs.readFileSync(filename, 'utf8');
    fs.writeFileSync(filename, original.replace(/^\{/, '{"id":17,"id":18,'));
    assert.throws(() => invokeCli(f), /duplicate JSON key/);
  }));
}
test('reject duplicate nested JSON key', () => checked(f => {
  jsonFiles(f);
  const filename = path.join(f.dir, 'run.json');
  const raw = fs.readFileSync(filename, 'utf8');
  fs.writeFileSync(filename, raw.replace('"repository":{', '"repository":{"id":5,'));
  assert.throws(() => invokeCli(f), /duplicate JSON key/);
}));
test('reject duplicate JSON key encoded using Unicode escape', () => checked(f => {
  jsonFiles(f);
  const filename = path.join(f.dir, 'policy.json');
  const raw = fs.readFileSync(filename, 'utf8');
  fs.writeFileSync(filename, raw.replace('"repositoryId":', '"repository\\u0049d":12345,"repositoryId":'));
  assert.throws(() => invokeCli(f), /duplicate JSON key/);
}));
test('allow same JSON key name in independent nested objects', () => checked(f => {
  jsonFiles(f);
  assert.equal(invokeCli(f).status, 'PASS');
}));
test('reject malformed JSON nesting', () => checked(f => {
  jsonFiles(f);
  const filename = path.join(f.dir, 'policy.json');
  fs.writeFileSync(filename, `${'{'.repeat(70)}0${'}'.repeat(70)}`);
  assert.throws(() => invokeCli(f), /JSON depth limit|invalid JSON/);
}));
for (const [name, adjust] of [
  ['zero repository ID', f => { f.policy.repositoryId = 0; }],
  ['negative workflow ID', f => { f.policy.workflowId = -1; }],
  ['fractional run ID', f => { f.policy.runId = 1.2; }],
  ['unsafe run attempt integer', f => { f.policy.runAttempt = Number.MAX_SAFE_INTEGER + 1; }],
  ['zero artifact ID', f => { f.policy.artifactId = 0; }],
  ['fractional artifact size', f => { f.artifact.size_in_bytes = 1.5; }],
  ['unsafe artifact size integer', f => { f.artifact.size_in_bytes = Number.MAX_SAFE_INTEGER + 1; }],
  ['full refs heads workflow path in policy', f => { f.policy.workflowRunPath = '.github/workflows/ota-artifact-export.yml@refs/heads/main'; }],
  ['full refs heads workflow path in API run', f => { f.run.path = '.github/workflows/ota-artifact-export.yml@refs/heads/main'; }],
]) {
  test(`reject ${name}`, () => checked(f => {
    adjust(f);
    assert.throws(() => verifyProvenance(f));
  }));
}
test('demonstrate artifact workflow_run cannot independently establish run attempt', () => checked(f => {
  const original = structuredClone(f.artifact);
  f.policy.runAttempt = 3;
  f.run.run_attempt = 3;
  assert.deepEqual(f.artifact, original);
  assert.equal(verifyProvenance(f).scope, 'offline-consistency-only');
}));


for (const [name, adjust] of [
  ['old @main path in policy', f => { f.policy.workflowRunPath += '@main'; }],
  ['old @main path in run', f => { f.run.path += '@main'; }],
  ['other path in policy without matching run', f => { f.policy.workflowRunPath = '.github/workflows/evil.yml'; }],
  ['other path in run', f => { f.run.path = '.github/workflows/evil.yml'; }],
  ['traversal workflow path', f => { f.policy.workflowRunPath = '.github/workflows/../evil.yml'; }],
  ['absolute workflow path', f => { f.policy.workflowRunPath = '/.github/workflows/ota-artifact-export.yml'; }],
  ['workflow path with query string', f => { f.policy.workflowRunPath += '?ref=main'; }],
  ['workflow path with full ref', f => { f.policy.workflowRunPath += '@refs/heads/main'; }],
  ['run branch inconsistent with trusted main policy', f => { f.run.head_branch = 'feature/eas-ota'; }],
]) {
  test(`reject ${name}`, () => checked(f => {
    adjust(f);
    assert.throws(() => verifyProvenance(f));
  }));
}
test('accept exact canonical unqualified workflow API path with main-only policy', () => checked(f => {
  assert.equal(f.policy.workflowRunPath, '.github/workflows/ota-artifact-export.yml');
  assert.equal(f.run.path, f.policy.workflowRunPath);
  assert.equal(f.policy.branch, 'main');
  assert.equal(f.run.head_branch, 'main');
  assert.equal(verifyProvenance(f).scope, 'offline-consistency-only');
}));
test('offline data cannot independently authenticate a substituted file path', () => checked(f => {
  f.policy.workflowRunPath = '.github/workflows/another-trusted-looking.yml';
  f.run.path = f.policy.workflowRunPath;
  assert.equal(verifyProvenance(f).scope, 'offline-consistency-only');
}));
