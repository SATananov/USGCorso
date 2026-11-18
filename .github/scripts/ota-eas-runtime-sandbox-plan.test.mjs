import test from 'node:test';
import assert from 'node:assert/strict';
import { assessPrerequisites, buildReviewedCommandPlan } from './ota-eas-runtime-sandbox-plan.mjs';

const valid = () => ({
  approvedImageId: 'sha256:' + 'a'.repeat(64),
  sourceAuthenticityVerified: true,
  fixtureReviewed: true,
  runnerReviewed: true,
  networkIsolationAssessed: true,
  hostIsolationAssessed: true,
});

test('default empty input denies', () => assert.equal(assessPrerequisites(null).status, 'BLOCKED'));
test('array input denies', () => assert.equal(assessPrerequisites([]).status, 'BLOCKED'));
test('boolean input denies', () => assert.equal(assessPrerequisites(true).status, 'BLOCKED'));
test('missing fields deny', () => assert.equal(assessPrerequisites({ approvedImageId: valid().approvedImageId }).status, 'BLOCKED'));
test('unknown fields deny', () => assert.equal(assessPrerequisites({ ...valid(), publish: true }).status, 'BLOCKED'));
test('image tag denies', () => assert.equal(assessPrerequisites({ ...valid(), approvedImageId: 'node:22' }).status, 'BLOCKED'));
test('uppercase image id denies', () => assert.equal(assessPrerequisites({ ...valid(), approvedImageId: 'sha256:' + 'A'.repeat(64) }).status, 'BLOCKED'));
test('short image id denies', () => assert.equal(assessPrerequisites({ ...valid(), approvedImageId: 'sha256:abc' }).status, 'BLOCKED'));
test('verified source required', () => assert.equal(assessPrerequisites({ ...valid(), sourceAuthenticityVerified: false }).status, 'BLOCKED'));
test('reviewed fixture required', () => assert.equal(assessPrerequisites({ ...valid(), fixtureReviewed: false }).status, 'BLOCKED'));
test('reviewed runner required', () => assert.equal(assessPrerequisites({ ...valid(), runnerReviewed: false }).status, 'BLOCKED'));
test('assessed network required', () => assert.equal(assessPrerequisites({ ...valid(), networkIsolationAssessed: false }).status, 'BLOCKED'));
test('assessed host required', () => assert.equal(assessPrerequisites({ ...valid(), hostIsolationAssessed: false }).status, 'BLOCKED'));
test('string true denies', () => assert.equal(assessPrerequisites({ ...valid(), runnerReviewed: 'true' }).status, 'BLOCKED'));
test('blocked plan has no argv', () => assert.equal(buildReviewedCommandPlan({}).argv, null));
test('reviewed plan never authorizes execution', () => {
  const p = buildReviewedCommandPlan(valid());
  assert.equal(p.status, 'PLAN_ONLY_NOT_EXECUTABLE');
  assert.equal(p.executionAuthorized, false);
  assert.equal(p.publicationAuthorized, false);
  assert.equal(p.runtimeBehaviorProven, false);
  assert.equal(p.credentialIsolationProven, false);
});
test('plan has no host mounts or Docker socket', () => {
  const args = buildReviewedCommandPlan(valid()).argv;
  assert.equal(args.some(x => /--mount|--volume|^-v$|--volumes-from|docker\.sock|--use-api-socket/.test(x)), false);
});
test('plan disables container networking and image pulls', () => {
  const a = buildReviewedCommandPlan(valid()).argv;
  assert.ok(a.includes('--network=none'));
  assert.ok(a.includes('--pull=never'));
});
test('plan prevents privilege escalation and root writable filesystem', () => {
  const a = buildReviewedCommandPlan(valid()).argv;
  for (const f of ['--read-only', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--user=65534:65534', '--pids-limit=64', '--memory=512m']) assert.ok(a.includes(f));
  assert.ok(!a.includes('--privileged'));
});
test('plan passes no token, auth, or arbitrary environment', () => {
  const a = buildReviewedCommandPlan(valid()).argv;
  assert.equal(a.some(x => /TOKEN|PASSWORD|SECRET|CREDENTIAL|--env-file|GITHUB|EXPO_TOKEN/.test(x)), false);
});
test('plan uses fixed entrypoint and image ID', () => {
  const a = buildReviewedCommandPlan(valid()).argv;
  assert.deepEqual(a.slice(-3), ['--entrypoint=node',valid().approvedImageId,'/opt/probe/entry.mjs']);
});
test('plan does not spawn tools or access environment', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('./ota-eas-runtime-sandbox-plan.mjs', import.meta.url), 'utf8');
  for (const token of ['child_process','execSync','spawnSync','fetch(', 'process.env', 'EXPO_TOKEN']) assert.equal(src.includes(token), false);
});
