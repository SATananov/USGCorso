import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const policy = JSON.parse(readFileSync(new URL('./ota-trusted-identity-03c-policy.json', import.meta.url), 'utf8'));
const contract = readFileSync(new URL('./OTA_TRUSTED_IDENTITY_03C_CONTRACT.md', import.meta.url), 'utf8');

const fixed = {
  kind: 'usgcorso-ota-trusted-identity-03c-design',
  mode: 'design-only',
  repository: 'SATananov/USGCorso',
  repositoryId: 1436603966,
  candidateRef: 'refs/heads/feature/eas-ota',
  trustedPublisherRef: 'refs/heads/main',
  trustedWorkflowCommit: null,
  trustedWorkflowFileSha256: null,
  trustedWorkflowPath: null,
  artifactAttemptBindingEvidence: null,
  verifiedAttestationEvidence: null,
  credentialImplementation: null,
  expoExecutionIsolationProof: null,
  requireFirstAttemptOnly: true,
  requireAuthenticatedGitHubResponses: true,
  requirePinnedImmutableWorkflow: true,
  requirePinnedWorkflowFileDigest: true,
  requireVerifiedSignatureAndTrustedSigner: true,
  requireExactArchiveSubjectDigest: true,
  requireAuthenticatedArtifactAttemptBinding: true,
  requireIndependentReleaseApproval: true,
  requireFreshnessRecheck: true,
  denyCandidateCodeWithExpoToken: true,
  allowReruns: false,
  allowUnauthenticatedInputs: false,
  allowPublisherExecution: false,
  releaseAuthorized: false,
};

function validateDesign(p) {
  if (p === null || typeof p !== 'object' || Array.isArray(p)) return false;
  if (Object.keys(p).length !== Object.keys(fixed).length) return false;
  return Object.entries(fixed).every(([key, value]) => Object.hasOwn(p, key) && p[key] === value);
}

test('design policy is fully specified and fail-closed', () => assert.equal(validateDesign(policy), true));

test('policy does not embed credentials', () => assert.doesNotMatch(JSON.stringify(policy), /EXPO_TOKEN|github_pat_|ghp_/));

for (const [key, value] of Object.entries(fixed)) {
  test(`reject changing required policy value: ${key}`, () => {
    const altered = { ...policy, [key]: value === null ? 'attacker supplied value' : (typeof value === 'boolean' ? !value : `${value}-altered`) };
    assert.equal(validateDesign(altered), false);
  });
}

test('reject missing key', () => { const p = { ...policy }; delete p.trustedWorkflowFileSha256; assert.equal(validateDesign(p), false); });
test('reject extra key', () => assert.equal(validateDesign({ ...policy, allowPublishAnyway: true }), false));
test('reject non-object policy', () => assert.equal(validateDesign([]), false));
for (const text of [
  'NOT A RELEASE GATE', 'full immutable Git commit SHA', 'SHA-256',
  'least-privilege', 'run_attempt === 1', 'artifact-to-attempt',
  'cryptographic', 'trusted roots', 'EXPO_TOKEN', 'fail',
  'independent release authorization', 're-fetch', 'Open blocker',
]) {
  test(`contract documents required boundary: ${text}`, () => assert.ok(contract.toLowerCase().includes(text.toLowerCase())));
}
test('fixtures are not release evidence', () => assert.equal(policy.releaseAuthorized, false));
test('publisher is disabled', () => assert.equal(policy.allowPublisherExecution, false));
