import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SHA40 = /^[0-9a-f]{40}$/i;
const DIGEST = /^sha256:[0-9a-f]{64}$/i;
const MAX_JSON = 512 * 1024;
const MAX_ARCHIVE = 512 * 1024 * 1024;

function reject(message) { throw new Error(message); }
function obj(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) reject(`${name}: expected object`);
  return value;
}
function exact(value, names, label) {
  obj(value, label);
  const keys = Object.keys(value);
  if (keys.length !== names.length || keys.some(key => !names.includes(key))) reject(`${label}: missing or unexpected key`);
}
function positive(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) reject(`${name}: invalid positive integer`);
}
function same(actual, expected, name) {
  if (actual !== expected) reject(`${name}: mismatch`);
}
function sha(actual, expected, name) {
  if (typeof actual !== 'string' || actual.toLowerCase() !== expected.toLowerCase()) reject(`${name}: mismatch`);
}
function policyCheck(policy) {
  const names = ['repository', 'repositoryId', 'workflowId', 'workflowRunPath', 'sourceSha', 'runId', 'runAttempt', 'artifactId', 'artifactName', 'event', 'branch'];
  exact(policy, names, 'policy');
  same(policy.repository, 'SATananov/USGCorso', 'repository policy');
  positive(policy.repositoryId, 'repositoryId');
  positive(policy.workflowId, 'workflowId');
  positive(policy.runId, 'runId');
  positive(policy.runAttempt, 'runAttempt');
  positive(policy.artifactId, 'artifactId');
  if (typeof policy.sourceSha !== 'string' || !SHA40.test(policy.sourceSha)) reject('policy: invalid source SHA');
  if (typeof policy.workflowRunPath !== 'string' || !/^\.github\/workflows\/[a-zA-Z0-9._-]+\.ya?ml@main$/.test(policy.workflowRunPath)) reject('policy: workflow must resolve to main');
  if (typeof policy.artifactName !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(policy.artifactName)) reject('policy: invalid artifact name');
  if (!['push', 'workflow_dispatch'].includes(policy.event)) reject('policy: unsupported event');
  same(policy.branch, 'main', 'policy branch');
}
function runCheck(run, policy) {
  obj(run, 'run');
  same(run.id, policy.runId, 'run id');
  same(run.run_attempt, policy.runAttempt, 'run attempt');
  same(run.workflow_id, policy.workflowId, 'workflow id');
  same(run.path, policy.workflowRunPath, 'workflow path');
  same(run.head_branch, policy.branch, 'run branch');
  same(run.event, policy.event, 'run event');
  sha(run.head_sha, policy.sourceSha, 'run head sha');
  same(run.status, 'completed', 'run status');
  same(run.conclusion, 'success', 'run conclusion');
  const repository = obj(run.repository, 'run repository');
  same(repository.full_name, policy.repository, 'run repository name');
  same(repository.id, policy.repositoryId, 'run repository id');
  const headRepository = obj(run.head_repository, 'run head repository');
  same(headRepository.full_name, policy.repository, 'run head repository name');
  same(headRepository.id, policy.repositoryId, 'run head repository id');
  same(run.url, `https://api.github.com/repos/${policy.repository}/actions/runs/${policy.runId}`, 'run API URL');
}
function artifactCheck(artifact, policy) {
  obj(artifact, 'artifact');
  same(artifact.id, policy.artifactId, 'artifact id');
  same(artifact.name, policy.artifactName, 'artifact name');
  if (artifact.expired !== false) reject('artifact: expired or unknown expiration');
  positive(artifact.size_in_bytes, 'artifact size');
  if (artifact.size_in_bytes > MAX_ARCHIVE) reject('artifact: size cap exceeded');
  if (typeof artifact.digest !== 'string' || !DIGEST.test(artifact.digest)) reject('artifact: invalid digest');
  same(artifact.url, `https://api.github.com/repos/${policy.repository}/actions/artifacts/${policy.artifactId}`, 'artifact API URL');
  const origin = obj(artifact.workflow_run, 'artifact workflow_run');
  same(origin.id, policy.runId, 'artifact run id');
  same(origin.repository_id, policy.repositoryId, 'artifact repository id');
  same(origin.head_repository_id, policy.repositoryId, 'artifact head repository id');
  same(origin.head_branch, policy.branch, 'artifact head branch');
  sha(origin.head_sha, policy.sourceSha, 'artifact head sha');
}
function sameFileSnapshot(first, next, label) {
  if (!next.isFile() || next.isSymbolicLink() || next.nlink !== 1 ||
      next.dev !== first.dev || next.ino !== first.ino ||
      next.size !== first.size || next.mtimeMs !== first.mtimeMs ||
      next.ctimeMs !== first.ctimeMs) reject(`${label}: changed or unsafe file`);
}
function parseStrictJson(buffer, label) {
  const content = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  let index = 0;
  const whitespace = () => { while (index < content.length && /[\x20\x09\x0a\x0d]/.test(content[index])) index++; };
  const string = () => {
    if (content[index] !== '"') reject(`${label}: invalid JSON string`);
    const start = index++;
    while (index < content.length) {
      const character = content[index++];
      if (character === '"') return JSON.parse(content.slice(start, index));
      if (character === '\\') {
        const escaped = content[index++];
        if (escaped === 'u') {
          if (!/^[a-fA-F0-9]{4}$/.test(content.slice(index, index + 4))) reject(`${label}: invalid JSON escape`);
          index += 4;
        } else if (!'"\\/bfnrt'.includes(escaped ?? '')) reject(`${label}: invalid JSON escape`);
      } else if (character.charCodeAt(0) < 32) reject(`${label}: invalid JSON string`);
    }
    reject(`${label}: unterminated JSON string`);
  };
  const scan = depth => {
    if (depth > 64) reject(`${label}: JSON depth limit`);
    whitespace();
    if (content[index] === '{') {
      index++;
      const keys = new Set();
      whitespace();
      if (content[index] === '}') { index++; return; }
      while (true) {
        whitespace();
        const key = string();
        if (keys.has(key)) reject(`${label}: duplicate JSON key`);
        keys.add(key);
        whitespace();
        if (content[index++] !== ':') reject(`${label}: invalid JSON object`);
        scan(depth + 1);
        whitespace();
        const separator = content[index++];
        if (separator === '}') return;
        if (separator !== ',') reject(`${label}: invalid JSON object`);
      }
    }
    if (content[index] === '[') {
      index++;
      whitespace();
      if (content[index] === ']') { index++; return; }
      while (true) {
        scan(depth + 1);
        whitespace();
        const separator = content[index++];
        if (separator === ']') return;
        if (separator !== ',') reject(`${label}: invalid JSON array`);
      }
    }
    if (content[index] === '"') { string(); return; }
    const token = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(content.slice(index));
    if (!token) reject(`${label}: invalid JSON token`);
    index += token[0].length;
  };
  scan(0);
  whitespace();
  if (index !== content.length) reject(`${label}: invalid trailing JSON data`);
  return obj(JSON.parse(content), label);
}
function readJson(filename, label) {
  if (!path.isAbsolute(filename)) reject(`${label}: absolute path required`);
  const before = fs.lstatSync(filename);
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.size > MAX_JSON) reject(`${label}: invalid file`);
  const fd = fs.openSync(filename, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
  try {
    const opened = fs.fstatSync(fd);
    sameFileSnapshot(before, opened, label);
    const chunks = [];
    const chunk = Buffer.allocUnsafe(64 * 1024);
    let bytes = 0;
    while (true) {
      const count = fs.readSync(fd, chunk, 0, chunk.length, null);
      if (count === 0) break;
      bytes += count;
      if (bytes > MAX_JSON) reject(`${label}: size cap exceeded`);
      chunks.push(Buffer.from(chunk.subarray(0, count)));
    }
    sameFileSnapshot(opened, fs.fstatSync(fd), label);
    sameFileSnapshot(opened, fs.lstatSync(filename), label);
    if (bytes !== opened.size) reject(`${label}: changed while reading`);
    const buffer = Buffer.concat(chunks, bytes);
    if (buffer.includes(0)) reject(`${label}: invalid content`);
    return parseStrictJson(buffer, label);
  } finally { fs.closeSync(fd); }
}
function archiveDigest(filename, expectedSize) {
  if (!path.isAbsolute(filename)) reject('archive: absolute path required');
  const before = fs.lstatSync(filename);
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.size !== expectedSize || before.size > MAX_ARCHIVE) reject('archive: invalid file or size');
  const fd = fs.openSync(filename, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
  try {
    const opened = fs.fstatSync(fd);
    if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== before.dev || opened.ino !== before.ino || opened.size !== before.size || opened.mtimeMs !== before.mtimeMs || opened.ctimeMs !== before.ctimeMs) reject('archive: changed before read');
    const hash = crypto.createHash('sha256');
    const buffer = Buffer.allocUnsafe(128 * 1024);
    let count = 0;
    while (true) {
      const read = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (!read) break;
      count += read;
      if (count > expectedSize) reject('archive: grew during read');
      hash.update(buffer.subarray(0, read));
    }
    const after = fs.fstatSync(fd);
    if (count !== expectedSize || opened.size !== after.size || opened.mtimeMs !== after.mtimeMs || opened.ctimeMs !== after.ctimeMs || opened.ino !== after.ino) reject('archive: changed during read');
    return `sha256:${hash.digest('hex')}`;
  } finally { fs.closeSync(fd); }
}
export function verifyProvenance({ policy, run, artifact, archive }) {
  policyCheck(policy);
  runCheck(run, policy);
  artifactCheck(artifact, policy);
  const actual = archiveDigest(archive, artifact.size_in_bytes);
  sha(actual, artifact.digest, 'archive digest');
  return Object.freeze({ status: 'PASS', scope: 'offline-consistency-only', repository: policy.repository, sourceSha: policy.sourceSha, runId: policy.runId, runAttempt: policy.runAttempt, artifactId: policy.artifactId, artifactDigest: artifact.digest });
}
export function runCli(args) {
  const flags = ['--policy', '--run', '--artifact', '--archive'];
  const options = {};
  if (args.length !== flags.length * 2) reject('usage: --policy ABS --run ABS --artifact ABS --archive ABS');
  for (let i = 0; i < args.length; i += 2) {
    if (!flags.includes(args[i]) || Object.hasOwn(options, args[i]) || !args[i + 1]) reject('usage: --policy ABS --run ABS --artifact ABS --archive ABS');
    options[args[i]] = args[i + 1];
  }
  return verifyProvenance({ policy: readJson(options['--policy'], 'policy'), run: readJson(options['--run'], 'run'), artifact: readJson(options['--artifact'], 'artifact'), archive: options['--archive'] });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.stdout.write(`${JSON.stringify(runCli(process.argv.slice(2)))}\n`); }
  catch (error) { process.stderr.write(`FAIL: ${error.message}\n`); process.exitCode = 1; }
}
