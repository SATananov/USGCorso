import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const fixture = JSON.parse(readFileSync(new URL('./ota-provenance-03b-real-api-observation.json', import.meta.url), 'utf8'));
const contract = readFileSync(new URL('./OTA_PROVENANCE_03B_API_OBSERVATIONS.md', import.meta.url), 'utf8');
const expectedPath = '.github/workflows/ota-preview-publish.yml';

function isPathCompatible(path) {
  return path === expectedPath;
}

function releaseEligible(evidence) {
  return evidence?.has_uploaded_candidate_artifact === true
    && evidence?.has_artifact_attempt_binding === true
    && evidence?.has_verified_cryptographic_attestation === true
    && evidence?.has_release_authorization === true
    && evidence?.can_publish === true;
}

test('fixture is explicitly an observation, not authenticated release evidence', () => {
  assert.equal(fixture.fixture_kind, 'read_only_observation_not_authenticated_release_evidence');
});

test('fixture has recorded GitHub API endpoints', () => {
  for (const key of ['source_endpoint', 'attempt_endpoint', 'artifacts_endpoint']) {
    assert.match(fixture[key], /^https:\/\/api\.github\.com\/repos\/SATananov\/USGCorso\/actions\/runs\/44241063989(?:\/|$)/);
  }
});

test('actual API path is the workflow file without a ref suffix', () => {
  assert.equal(fixture.run.path, expectedPath);
  assert.equal(isPathCompatible(fixture.run.path), true);
});

test('old @main assumption does not match this observed API response', () => {
  assert.equal(fixture.run.path.endsWith('@main'), false);
  assert.equal(isPathCompatible(`${expectedPath}@main`), false);
});

test('full-ref form is not observed and is not silently accepted', () => {
  assert.equal(isPathCompatible(`${expectedPath}@refs/heads/main`), false);
});

test('different workflow path is denied', () => {
  assert.equal(isPathCompatible('.github/workflows/ota-checks.yml'), false);
});

test('run and attempt endpoint agree on selected run identity', () => {
  assert.equal(fixture.run.id, fixture.attempt.id);
  assert.equal(fixture.run.workflow_id, fixture.attempt.workflow_id);
  assert.equal(fixture.run.head_sha, fixture.attempt.head_sha);
});

test('run and attempt endpoint agree on attempt one', () => {
  assert.equal(fixture.run.run_attempt, 1);
  assert.equal(fixture.attempt.run_attempt, 1);
});

test('observed repository identity matches the expected repository ID', () => {
  assert.equal(fixture.run.repository_id, 1436603966);
  assert.equal(fixture.run.head_repository_id, 1436603966);
});

test('observed run uses the isolated candidate branch', () => {
  assert.equal(fixture.run.head_branch, 'feature/eas-ota');
  assert.equal(fixture.run.event, 'workflow_dispatch');
});

test('observed run completed successfully', () => {
  assert.equal(fixture.run.status, 'completed');
  assert.equal(fixture.run.conclusion, 'success');
});

test('observed run has no artifacts', () => {
  assert.equal(fixture.artifacts.total_count, 0);
  assert.deepEqual(fixture.artifacts.items, []);
});

test('artifact-to-attempt binding is not established', () => {
  assert.equal(fixture.evidence_limits.has_artifact_attempt_binding, false);
});

test('signed attestation has not been verified', () => {
  assert.equal(fixture.evidence_limits.has_verified_cryptographic_attestation, false);
});

test('the fixture cannot authorize release', () => {
  assert.equal(releaseEligible(fixture.evidence_limits), false);
});

test('inventing artifact presence alone cannot authorize release', () => {
  assert.equal(releaseEligible({ ...fixture.evidence_limits, has_uploaded_candidate_artifact: true }), false);
});

test('claiming attempt one alone cannot authorize release', () => {
  assert.equal(releaseEligible({ ...fixture.evidence_limits, has_artifact_attempt_binding: true }), false);
});

test('only a complete abstract evidence set would satisfy illustrative predicate', () => {
  const evidence = Object.fromEntries(Object.keys(fixture.evidence_limits).map(key => [key, true]));
  assert.equal(releaseEligible(evidence), true);
});

test('contract explicitly labels examples as untrusted and non-authoritative', () => {
  assert.match(contract, /NOT authenticated evidence/);
  assert.match(contract, /not a release gate/);
});

test('contract requires separately pinned trusted workflow identity', () => {
  assert.match(contract, /trusted workflow commit/);
  assert.match(contract, /SHA-256/);
});

test('contract requires denial for unresolved attempt attribution', () => {
  assert.match(contract, /artifact-to-attempt binding/);
  assert.match(contract, /fail closed/);
});

test('contract protects Expo credential isolation', () => {
  assert.match(contract, /EXPO_TOKEN/);
  assert.match(contract, /candidate-controlled code/);
});

test('fixture contains no secret or token values', () => {
  assert.doesNotMatch(JSON.stringify(fixture), /EXPO_TOKEN|ghp_[A-Za-z0-9]+|github_pat_/);
});
