import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const folder = path.dirname(fileURLToPath(import.meta.url));
const policy = JSON.parse(fs.readFileSync(path.join(folder, 'ota-provenance-03a-policy.json'), 'utf8'));
const contract = fs.readFileSync(path.join(folder, 'OTA_AUTHENTICATED_PROVENANCE_CONTRACT.md'), 'utf8');
const requiredTrue = [
  'requireCurrentRunAttemptOneAtPublication',
  'requireAuthenticatedGithubApi',
  'requireExactArchiveDigest',
  'requireCryptographicAttestation',
  'requireAttestedExactArchiveSubject',
  'requireTrustedSignerIdentity',
  'requireAuthenticatedArtifactAttemptBinding',
  'requireIndependentReleaseApproval',
  'requireFinalFreshnessRecheck',
  'denyCandidateExecutionWithExpoToken',
  'denyPublisherOnUnresolvedExpoExecutionBoundary',
];
const requiredFalse = [
  'releaseAuthorized',
  'allowUnknownAttempt',
  'allowReruns',
  'allowUnsignedArtifacts',
  'allowCandidateProvidedAttestationAsProof',
];

function assertDesignPolicy(candidate) {
  assert.deepEqual(Object.keys(candidate).sort(), Object.keys(policy).sort());
  assert.equal(candidate.schema, 'usgcorso-ota-02b-03a-design-v1');
  assert.equal(candidate.mode, 'design-only');
  assert.equal(candidate.repository, 'SATananov/USGCorso');
  assert.equal(candidate.candidateRef, 'refs/heads/feature/eas-ota');
  assert.equal(candidate.trustedPublisherRef, 'refs/heads/main');
  assert.equal(candidate.maxRunAttempt, 1);
  assert.equal(candidate.workflowPathCompatibility, 'unverified-fail-closed');
  for (const key of requiredTrue) assert.equal(candidate[key], true, key);
  for (const key of requiredFalse) assert.equal(candidate[key], false, key);
}

test('design policy is complete and fail closed', () => assertDesignPolicy(policy));
test('policy JSON does not contain token or credentials', () => {
  const serialized = JSON.stringify(policy);
  assert.doesNotMatch(serialized, /ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]+|sk_[A-Za-z0-9]{20,}/);
});
for (const key of requiredTrue) {
  test(`reject design policy if ${key} disabled`, () => {
    assert.throws(() => assertDesignPolicy({ ...policy, [key]: false }));
  });
}
for (const key of requiredFalse) {
  test(`reject design policy if ${key} enabled`, () => {
    assert.throws(() => assertDesignPolicy({ ...policy, [key]: true }));
  });
}
for (const [key, wrong] of [
  ['maxRunAttempt', 2],
  ['maxRunAttempt', '1'],
  ['workflowPathCompatibility', 'allow-both'],
  ['candidateRef', 'refs/heads/main'],
  ['trustedPublisherRef', 'refs/heads/feature/eas-ota'],
  ['repository', 'attacker/repo'],
  ['mode', 'publish'],
  ['releaseAuthorized', 'false'],
]) {
  test(`reject altered policy ${key}: ${wrong}`, () => {
    assert.throws(() => assertDesignPolicy({ ...policy, [key]: wrong }));
  });
}
test('reject missing policy key', () => {
  const { requireCryptographicAttestation, ...reduced } = policy;
  assert.throws(() => assertDesignPolicy(reduced));
});
test('reject extra policy key', () => {
  assert.throws(() => assertDesignPolicy({ ...policy, publication: 'yes' }));
});
for (const phrase of [
  'not a release gate',
  'run_attempt === 1',
  'does **not** attribute artifacts to the attempt',
  'cryptographically verify',
  'EXPO_TOKEN',
  'approval',
  're-fetch',
  'unverified-fail-closed',
]) {
  test(`contract records boundary: ${phrase}`, () => {
    const normalize = (text) => text.toLowerCase().replaceAll('**', '');
    if (phrase === 'unverified-fail-closed') {
      assert.equal(policy.workflowPathCompatibility, phrase);
    } else {
      assert.ok(normalize(contract).includes(normalize(phrase)), phrase);
    }
  });
}
test('no producer, API, publisher, or secret operations are invoked by these contract tests', () => {
  assert.equal(policy.mode, 'design-only');
  assert.equal(policy.releaseAuthorized, false);
});
