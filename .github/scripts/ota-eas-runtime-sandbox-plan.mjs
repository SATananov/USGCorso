import { pathToFileURL } from 'node:url';

const IMAGE_ID = /^sha256:[a-f0-9]{64}$/;
const REQUIRED = [
  'approvedImageId',
  'sourceAuthenticityVerified',
  'fixtureReviewed',
  'runnerReviewed',
  'networkIsolationAssessed',
  'hostIsolationAssessed',
];

export function assessPrerequisites(input) {
  const blockers = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return Object.freeze({ status: 'BLOCKED', blockers: ['INVALID_INPUT'], executionAuthorized: false, publicationAuthorized: false });
  }
  if (Object.keys(input).some(key => !REQUIRED.includes(key))) blockers.push('UNKNOWN_KEYS');
  if (REQUIRED.some(key => !Object.hasOwn(input, key))) blockers.push('MISSING_KEYS');
  if (typeof input.approvedImageId !== 'string' || !IMAGE_ID.test(input.approvedImageId)) blockers.push('UNPINNED_IMAGE');
  for (const key of REQUIRED.slice(1)) {
    if (input[key] !== true) blockers.push(`UNVERIFIED_${key.toUpperCase()}`);
  }
  return Object.freeze({
    status: blockers.length === 0 ? 'PLAN_READY_FOR_INDEPENDENT_REVIEW' : 'BLOCKED',
    blockers: Object.freeze(blockers),
    executionAuthorized: false,
    publicationAuthorized: false,
  });
}

export function buildReviewedCommandPlan(input) {
  const assessed = assessPrerequisites(input);
  if (assessed.status !== 'PLAN_READY_FOR_INDEPENDENT_REVIEW') {
    return Object.freeze({ ...assessed, argv: null });
  }
  const argv = [
    'run', '--rm', '--pull=never',
    '--network=none', '--read-only', '--cap-drop=ALL',
    '--security-opt=no-new-privileges',
    '--pids-limit=64', '--memory=512m', '--cpus=1',
    '--user=65534:65534', '--workdir=/opt/probe',
    '--tmpfs=/tmp:rw,noexec,nosuid,size=32m',
    '--env=HOME=/tmp', '--env=CI=1', '--env=EXPO_NO_DOTENV=1',
    '--entrypoint=node',
    input.approvedImageId,
    '/opt/probe/entry.mjs',
  ];
  return Object.freeze({
    ...assessed,
    status: 'PLAN_ONLY_NOT_EXECUTABLE',
    argv: Object.freeze(argv),
    runtimeBehaviorProven: false,
    credentialIsolationProven: false,
    sourceAuthenticityProvenByThisTool: false,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = assessPrerequisites({
    approvedImageId: null,
    sourceAuthenticityVerified: false,
    fixtureReviewed: false,
    runnerReviewed: false,
    networkIsolationAssessed: false,
    hostIsolationAssessed: false,
  });
  process.stdout.write(JSON.stringify({ phase: 'SAFETY_02B_03E_03A', ...result }, null, 2) + '\n');
}
