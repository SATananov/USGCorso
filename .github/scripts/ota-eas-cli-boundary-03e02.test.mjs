import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectEasUpdateSource, inspectFile, readBoundedSource, MAX_SOURCE_BYTES, PIN } from './ota-eas-cli-boundary-03e02.mjs';

const sample = [
  'static override contextDefinition = { ...this.ContextOptions.DynamicProjectConfig };',
  'const { exp } = await getDynamicPublicProjectConfigAsync();',
  'const { exp: expPrivate } = await getDynamicPrivateProjectConfigAsync();',
  'if (!skipBundler) {',
  '  await buildBundlesAsync({ projectDir });',
  '}',
  'const distRoot = await resolveInputDirectoryAsync(inputDir, { skipBundler });',
].join('\n');

const replace = (before, after) => sample.replace(before, after);
const denied = result => {
  assert.equal(result.publishAuthorized, false);
  assert.equal(result.codeExecutionIsolationProven, false);
  assert.equal(result.sourceAuthenticityProven, false);
  assert.equal(result.semanticControlFlowProven, false);
  assert.equal(result.skipBundlerControlFlowProven, false);
  assert.equal(result.dynamicConfigExecutionOrderProven, false);
  assert.equal(result.evidenceType, 'UNAUTHENTICATED_TEXT_MARKERS_ONLY');
  assert.equal(Object.hasOwn(result, 'skipBundlerSkipsBuildBundlesAsync'), false);
  assert.equal(Object.hasOwn(result, 'dynamicProjectConfigAccessBeforeSkipBundler'), false);
};

test('source marker order is only untrusted textual observation', () => {
  const result = inspectEasUpdateSource(sample);
  denied(result);
  assert.equal(result.textMarkerOrderObserved, true);
});
test('pin identifies upstream locator but not authenticated source', () => {
  assert.equal(PIN.upstream, 'expo/eas-cli');
  assert.equal(PIN.ref, 'v27.9.0');
  assert.equal(PIN.path, 'packages/eas-cli/src/commands/update/index.ts');
  assert.match(PIN.gitBlobSha1, /^[0-9a-f]{40}$/);
});
test('empty source denied', () => assert.throws(() => inspectEasUpdateSource('')));
test('non-string source denied', () => assert.throws(() => inspectEasUpdateSource(null)));
test('oversized source denied', () => assert.throws(() => inspectEasUpdateSource('x'.repeat(MAX_SOURCE_BYTES + 1))));
test('missing dynamic context denied', () => assert.throws(() => inspectEasUpdateSource(replace('this.ContextOptions.DynamicProjectConfig', 'NOT_DYNAMIC'))));
test('missing public config denied', () => assert.throws(() => inspectEasUpdateSource(replace('getDynamicPublicProjectConfigAsync()', 'unknown()'))));
test('missing private config denied', () => assert.throws(() => inspectEasUpdateSource(replace('getDynamicPrivateProjectConfigAsync()', 'unknown()'))));
test('missing skip branch denied', () => assert.throws(() => inspectEasUpdateSource(replace('if (!skipBundler)', 'if (somethingElse)'))));
test('missing export step denied', () => assert.throws(() => inspectEasUpdateSource(replace('await buildBundlesAsync({', 'await anotherStep({'))));
test('missing input resolver denied', () => assert.throws(() => inspectEasUpdateSource(replace('await resolveInputDirectoryAsync(inputDir, {', 'await anotherResolver({'))));
test('duplicated public marker denied', () => assert.throws(() => inspectEasUpdateSource(sample + '\nawait getDynamicPublicProjectConfigAsync();')));
test('config after skip marker denied for text drift', () => {
  const s = sample.replace('const { exp: expPrivate } = await getDynamicPrivateProjectConfigAsync();', '').replace('if (!skipBundler) {', 'if (!skipBundler) {\nawait getDynamicPrivateProjectConfigAsync();');
  assert.throws(() => inspectEasUpdateSource(s));
});
test('input marker before bundle denied for text drift', () => {
  const s = sample.replace('const distRoot = await resolveInputDirectoryAsync(inputDir, { skipBundler });', '').replace('if (!skipBundler) {', 'const distRoot = await resolveInputDirectoryAsync(inputDir, { skipBundler });\nif (!skipBundler) {');
  assert.throws(() => inspectEasUpdateSource(s));
});
test('comment-only markers do not claim semantic proof', () => {
  const result = inspectEasUpdateSource(sample.split('\n').map(line => '// ' + line).join('\n'));
  denied(result);
});
test('string-only markers do not claim semantic proof', () => {
  const result = inspectEasUpdateSource(JSON.stringify(sample));
  denied(result);
});
test('build outside skip condition does not claim control-flow proof', () => {
  const s = sample.replace('  await buildBundlesAsync({ projectDir });\n}', '}\nawait buildBundlesAsync({ projectDir });');
  denied(inspectEasUpdateSource(s));
});
test('readBoundedSource rejects oversized file before buffering', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ota-03e02-'));
  try {
    const path = join(dir, 'large.ts');
    writeFileSync(path, Buffer.alloc(MAX_SOURCE_BYTES + 1, 0x41));
    assert.throws(() => readBoundedSource(path), /size outside allowed range/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
test('inspectFile checks bounded local fixture and still denies authorization', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ota-03e02-'));
  try {
    const path = join(dir, 'sample.ts');
    writeFileSync(path, sample);
    denied(inspectFile(path));
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
test('invalid UTF-8 is rejected', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ota-03e02-'));
  try {
    const path = join(dir, 'sample.ts');
    writeFileSync(path, Buffer.from([0xff, 0xfe]));
    assert.throws(() => readBoundedSource(path));
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
test('inspector never invokes commands, network, or secrets', async () => {
  const fs = await import('node:fs');
  const code = fs.readFileSync(new URL('./ota-eas-cli-boundary-03e02.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(code, /(?:child_process|fetch\(|https\.request|execFile\(|spawn\(|process\.env\.|EXPO_TOKEN\s*=)/);
});
