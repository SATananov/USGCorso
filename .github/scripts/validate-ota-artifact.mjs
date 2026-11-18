import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const LIMITS = Object.freeze({
  files: 2000,
  total: 256 * 1024 * 1024,
  single: 64 * 1024 * 1024,
  metadata: 1024 * 1024,
  assetmap: 16 * 1024 * 1024,
});
const HEX40 = /^[a-f0-9]{40}$/i;
const HEX64 = /^[a-f0-9]{64}$/i;
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const ROOT_FIELDS = ['version', 'bundler', 'fileMetadata'];
const MANIFEST_FIELDS = ['schemaVersion', 'sourceSha', 'workflowRef', 'workflowSha', 'runId', 'runAttempt', 'artifactId', 'artifactDigest', 'platform', 'files'];
const FILE_FIELDS = ['path', 'size', 'sha256'];

function fail(message) {
  throw new Error(message);
}
function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label}: expected object`);
  return value;
}
function keysExactly(value, expected, label) {
  object(value, label);
  const actual = Object.keys(value);
  if (actual.length !== expected.length || actual.some(key => !expected.includes(key))) fail(`${label}: unexpected or missing fields`);
}
function integer(value, label, min, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < min || value > max) fail(`${label}: invalid integer`);
}
function safePath(value, label) {
  if (typeof value !== 'string' || !value || value.length > 1024 || value.includes('\\') || /[\x00-\x1f\x7f]/.test(value) || value.startsWith('/') || /^[a-zA-Z]:/.test(value)) fail(`${label}: unsafe path`);
  const segments = value.split('/');
  if (segments.some(s => !s || s === '.' || s === '..' || s.endsWith('.') || s.endsWith(' ') || s.includes(':'))) fail(`${label}: non-canonical path`);
  if (segments.some(s => !IDENTIFIER.test(s))) fail(`${label}: unsupported path characters`);
  return value;
}
function namesUnique(paths, label) {
  const unique = new Set();
  for (const item of paths) {
    const key = item.toLowerCase();
    if (unique.has(key)) fail(`${label}: duplicate or case-colliding path`);
    unique.add(key);
  }
}
function parseStrictJson(buffer, label) {
  const text = buffer.toString('utf8');
  if (text.includes('\uFFFD')) fail(`${label}: invalid UTF-8`);
  let i = 0;
  const whitespace = () => { while (/\s/.test(text[i] ?? '') && i < text.length) i++; };
  const scanString = () => {
    if (text[i] !== '"') fail(`${label}: expected JSON string`);
    const begin = i++;
    while (i < text.length) {
      const c = text[i++];
      if (c === '"') return JSON.parse(text.slice(begin, i));
      if (c === '\\') {
        if (i >= text.length) fail(`${label}: unterminated string`);
        if (text[i] === 'u') {
          i++;
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i, i + 4))) fail(`${label}: invalid escape`);
          i += 4;
        } else if ('"\\/bfnrt'.includes(text[i])) {
          i++;
        } else fail(`${label}: invalid escape`);
      } else if (c.charCodeAt(0) < 32) fail(`${label}: invalid string`);
    }
    fail(`${label}: unterminated string`);
  };
  const scan = depth => {
    if (depth > 32) fail(`${label}: JSON nesting limit`);
    whitespace();
    if (text[i] === '{') {
      i++;
      const seen = new Set();
      whitespace();
      if (text[i] === '}') { i++; return; }
      while (i < text.length) {
        whitespace();
        const key = scanString();
        if (seen.has(key)) fail(`${label}: duplicate JSON key`);
        seen.add(key);
        whitespace();
        if (text[i++] !== ':') fail(`${label}: invalid JSON object`);
        scan(depth + 1);
        whitespace();
        const sep = text[i++];
        if (sep === '}') return;
        if (sep !== ',') fail(`${label}: invalid JSON object`);
      }
      fail(`${label}: unclosed JSON object`);
    }
    if (text[i] === '[') {
      i++;
      whitespace();
      if (text[i] === ']') { i++; return; }
      while (i < text.length) {
        scan(depth + 1);
        whitespace();
        const sep = text[i++];
        if (sep === ']') return;
        if (sep !== ',') fail(`${label}: invalid JSON array`);
      }
      fail(`${label}: unclosed JSON array`);
    }
    if (text[i] === '"') { scanString(); return; }
    const remaining = text.slice(i);
    const token = /^(true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(remaining);
    if (!token) fail(`${label}: invalid JSON token`);
    i += token[0].length;
  };
  scan(0);
  whitespace();
  if (i !== text.length) fail(`${label}: trailing JSON data`);
  return JSON.parse(text);
}
function readBoundedJson(filename, maximum, label) {
  const info = fs.lstatSync(filename);
  if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1 || info.size > maximum) fail(`${label}: unsafe or oversized file`);
  return parseStrictJson(fs.readFileSync(filename), label);
}
function assertDirectory(directory, label) {
  if (!path.isAbsolute(directory)) fail(`${label}: must be an absolute path`);
  const resolved = path.resolve(directory);
  const real = fs.realpathSync(directory);
  if (real !== resolved) fail(`${label}: symlink in directory path`);
  if (!fs.statSync(directory).isDirectory()) fail(`${label}: not a directory`);
  return resolved;
}
function under(base, candidate) {
  const rel = path.relative(base, candidate);
  return rel && rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
}
function metadataPaths(meta) {
  keysExactly(meta, ROOT_FIELDS, 'metadata');
  if (meta.version !== 0 || meta.bundler !== 'metro') fail('metadata: unsupported version or bundler');
  keysExactly(meta.fileMetadata, ['android'], 'fileMetadata');
  const android = meta.fileMetadata.android;
  keysExactly(android, ['bundle', 'assets'], 'android metadata');
  safePath(android.bundle, 'android bundle');
  if (!Array.isArray(android.assets) || android.assets.length > LIMITS.files - 3) fail('metadata: invalid assets');
  const paths = ['metadata.json', 'assetmap.json', android.bundle];
  for (const [index, asset] of android.assets.entries()) {
    keysExactly(asset, ['path', 'ext'], `asset ${index}`);
    safePath(asset.path, `asset ${index}`);
    if (typeof asset.ext !== 'string' || !/^[A-Za-z0-9]{1,16}$/.test(asset.ext)) fail(`asset ${index}: invalid extension`);
    paths.push(asset.path);
  }
  namesUnique(paths, 'metadata');
  return paths;
}
function validateAssetMap(value) {
  object(value, 'assetmap');
  if (Object.keys(value).length > LIMITS.files) fail('assetmap: too many entries');
  for (const [key, entry] of Object.entries(value)) {
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(key)) fail('assetmap: invalid key');
    object(entry, 'assetmap entry');
    for (const [field, v] of Object.entries(entry)) {
      if (!['name', 'type', 'httpServerLocation', 'width', 'height', 'scales', 'hash'].includes(field)) fail('assetmap: unknown field');
      if (typeof v === 'string' && (v.length > 1024 || /[\x00-\x1f\x7f]/.test(v))) fail('assetmap: unsafe string');
      if (['name', 'type'].includes(field) && (typeof v !== 'string' || !IDENTIFIER.test(v))) fail('assetmap: invalid name/type');
      if (field === 'httpServerLocation' && (typeof v !== 'string' || !v.startsWith('/assets') || v.includes('..') || v.includes('\\'))) fail('assetmap: unsafe server location');
      if (['width', 'height'].includes(field) && (!Number.isFinite(v) || v < 0)) fail('assetmap: invalid dimension');
      if (field === 'scales' && (!Array.isArray(v) || v.length > 20 || v.some(n => !Number.isFinite(n) || n <= 0))) fail('assetmap: invalid scales');
    }
  }
}
function validateManifest(value, expectedPaths) {
  keysExactly(value, MANIFEST_FIELDS, 'manifest');
  if (value.schemaVersion !== 1 || value.platform !== 'android' || !HEX40.test(value.sourceSha) || !HEX40.test(value.workflowSha)) fail('manifest: invalid identity');
  if (typeof value.workflowRef !== 'string' || !/^SATananov\/USGCorso\/\.github\/workflows\/[A-Za-z0-9._-]+\.ya?ml@refs\/heads\/main$/.test(value.workflowRef)) fail('manifest: invalid workflow ref');
  integer(value.runId, 'runId', 1);
  integer(value.runAttempt, 'runAttempt', 1);
  integer(value.artifactId, 'artifactId', 1);
  if (typeof value.artifactDigest !== 'string' || !/^sha256:[a-f0-9]{64}$/i.test(value.artifactDigest)) fail('manifest: invalid artifact digest');
  if (!Array.isArray(value.files) || value.files.length !== expectedPaths.length || value.files.length > LIMITS.files) fail('manifest: file count mismatch');
  const manifestPaths = [];
  for (const file of value.files) {
    keysExactly(file, FILE_FIELDS, 'manifest file');
    safePath(file.path, 'manifest path');
    integer(file.size, 'manifest file size', 0, LIMITS.single);
    if (!HEX64.test(file.sha256)) fail('manifest: invalid sha256');
    manifestPaths.push(file.path);
  }
  namesUnique(manifestPaths, 'manifest');
  if (manifestPaths.some(p => !expectedPaths.includes(p))) fail('manifest: unexpected file');
  if (expectedPaths.some(p => !manifestPaths.includes(p))) fail('manifest: missing file');
  const total = value.files.reduce((sum, file) => sum + file.size, 0);
  if (total > LIMITS.total) fail('manifest: expanded limit exceeded');
  return total;
}
function inspectTree(root) {
  const found = [];
  const walk = (dir, prefix = '') => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      safePath(relative, 'input entry');
      const absolute = path.join(dir, entry.name);
      const info = fs.lstatSync(absolute);
      if (info.isSymbolicLink()) fail('input: symlink detected');
      if (info.isDirectory()) walk(absolute, relative);
      else if (info.isFile() && info.nlink === 1) {
        found.push(relative);
        if (found.length > LIMITS.files) fail('input: file count limit exceeded');
      } else fail('input: non-regular or hard-linked file');
    }
  };
  walk(root);
  namesUnique(found, 'input');
  return found;
}
function copyAndVerify(root, output, file) {
  const from = path.join(root, ...file.path.split('/'));
  const to = path.join(output, ...file.path.split('/'));
  const parent = path.dirname(to);
  fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  const source = fs.openSync(from, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
  let destination;
  try {
    const sourceInfo = fs.fstatSync(source);
    if (!sourceInfo.isFile() || sourceInfo.nlink !== 1 || sourceInfo.size !== file.size) fail(`file: unsafe or changed ${file.path}`);
    destination = fs.openSync(to, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0), 0o400);
    const hash = crypto.createHash('sha256');
    const chunk = Buffer.allocUnsafe(128 * 1024);
    let bytes = 0;
    while (true) {
      const read = fs.readSync(source, chunk, 0, chunk.length, null);
      if (!read) break;
      bytes += read;
      if (bytes > file.size || bytes > LIMITS.single) fail(`file: size changed ${file.path}`);
      hash.update(chunk.subarray(0, read));
      let written = 0;
      while (written < read) written += fs.writeSync(destination, chunk, written, read - written);
    }
    if (bytes !== file.size || hash.digest('hex').toLowerCase() !== file.sha256.toLowerCase()) fail(`file: digest mismatch ${file.path}`);
    const end = fs.fstatSync(source);
    if (end.size !== sourceInfo.size || end.mtimeMs !== sourceInfo.mtimeMs || end.ino !== sourceInfo.ino) fail(`file: changed during read ${file.path}`);
    fs.fchmodSync(destination, 0o400);
  } finally {
    if (destination !== undefined) fs.closeSync(destination);
    fs.closeSync(source);
  }
}
export function validateArtifact({ root, manifest, output }) {
  if (!root || !manifest || !output) fail('required paths: root, manifest, output');
  const sourceRoot = assertDirectory(root, 'root');
  const manifestFile = path.resolve(manifest);
  const target = path.resolve(output);
  if (!path.isAbsolute(output) || !path.isAbsolute(manifest) || under(sourceRoot, manifestFile) || manifestFile === sourceRoot) fail('manifest: must be outside export root');
  if (fs.existsSync(target) || fs.existsSync(path.dirname(target)) && fs.realpathSync(path.dirname(target)) !== path.dirname(target)) fail('output: existing or symlinked parent');
  if (target === sourceRoot || under(sourceRoot, target) || under(target, sourceRoot) || target === path.dirname(manifestFile)) fail('output: overlaps source or manifest');
  const sourceFiles = inspectTree(sourceRoot);
  const meta = readBoundedJson(path.join(sourceRoot, 'metadata.json'), LIMITS.metadata, 'metadata');
  const expected = metadataPaths(meta);
  if (sourceFiles.length !== expected.length || sourceFiles.some(p => !expected.includes(p))) fail('input: unexpected or missing file');
  validateAssetMap(readBoundedJson(path.join(sourceRoot, 'assetmap.json'), LIMITS.assetmap, 'assetmap'));
  const manifestData = readBoundedJson(manifestFile, LIMITS.metadata, 'manifest');
  const total = validateManifest(manifestData, expected);
  const listed = new Map(manifestData.files.map(file => [file.path, file]));
  for (const [relative, limit] of [['metadata.json', LIMITS.metadata], ['assetmap.json', LIMITS.assetmap]]) {
    if (listed.get(relative).size > limit) fail(`${relative}: size cap exceeded`);
  }
  fs.mkdirSync(target, { mode: 0o700 });
  try {
    for (const entry of [...listed.values()].sort((a, b) => a.path.localeCompare(b.path))) copyAndVerify(sourceRoot, target, entry);
    return { status: 'PASS', sourceSha: manifestData.sourceSha, artifactDigest: manifestData.artifactDigest, fileCount: listed.size, totalBytes: total };
  } catch (error) {
    fs.rmSync(target, { recursive: true, force: true });
    throw error;
  }
}
export function runCli(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    if (!['--root', '--manifest', '--output'].includes(flag) || Object.hasOwn(values, flag) || !argv[index + 1]) fail('usage: --root ABS --manifest ABS --output ABS');
    values[flag] = argv[index + 1];
  }
  if (Object.keys(values).length !== 3) fail('usage: --root ABS --manifest ABS --output ABS');
  return validateArtifact({ root: values['--root'], manifest: values['--manifest'], output: values['--output'] });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(`${JSON.stringify(runCli(process.argv.slice(2)))}\n`);
  } catch (error) {
    process.stderr.write(`OTA artifact validation failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
