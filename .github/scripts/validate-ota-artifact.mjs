import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const LIMITS = Object.freeze({
  files: 2000,
  entries: 4096,
  depth: 32,
  total: 256 * 1024 * 1024,
  single: 64 * 1024 * 1024,
  metadata: 1024 * 1024,
  assetmap: 16 * 1024 * 1024,
  jsonDepth: 32,
  assetmapEntries: 2000,
  assetmapArray: 2000,
  assetmapText: 1024,
});
const HEX40 = /^[a-f0-9]{40}$/i;
const HEX64 = /^[a-f0-9]{64}$/i;
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const ASSET_NAME = /^[A-Za-z0-9][A-Za-z0-9._@+ -]{0,127}$/;
const ROOT_FIELDS = ['version', 'bundler', 'fileMetadata'];
const MANIFEST_FIELDS = ['schemaVersion', 'sourceSha', 'workflowRef', 'workflowSha', 'runId', 'runAttempt', 'artifactId', 'artifactDigest', 'platform', 'files'];
const FILE_FIELDS = ['path', 'size', 'sha256'];
const EXPECTED_FIELDS = ['sourceSha', 'workflowSha', 'workflowRef', 'runId', 'runAttempt', 'artifactId', 'artifactDigest'];
const ASSETMAP_REQUIRED = ['httpServerLocation', 'name', 'type'];
const ASSETMAP_OPTIONAL = ['__packager_asset', 'fileSystemLocation', 'width', 'height', 'scales', 'files', 'hash', 'fileHashes'];

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

function safePath(value, label, allowExpoBundle = false) {
  if (typeof value !== 'string' || !value || value.length > 1024 || value.includes('\\') || /[\x00-\x1f\x7f]/.test(value) || value.startsWith('/') || /^[a-zA-Z]:/.test(value)) fail(`${label}: unsafe path`);
  const segments = value.split('/');
  if (segments.some(s => !s || s === '.' || s === '..' || s.endsWith('.') || s.endsWith(' ') || s.includes(':'))) fail(`${label}: non-canonical path`);
  if (segments.some((s, i) => !(IDENTIFIER.test(s) || (allowExpoBundle && i === 0 && s === '_expo')) || /^(con|prn|aux|nul|conin\$|conout\$|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(s))) fail(`${label}: unsupported or reserved path segment`);
  return value;
}

function canonicalMetadataAssetPath(value, label) {
  if (typeof value !== 'string') fail(`${label}: unsafe path`);
  if (!value.includes('\\')) return safePath(value, label);
  if (!/^assets\\[a-f0-9]{32}$/i.test(value)) fail(`${label}: unsafe path`);
  return safePath(value.replace('\\', '/'), label);
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
  const whitespace = () => { while (i < text.length && /[\x20\x09\x0a\x0d]/.test(text[i])) i++; };
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
    if (depth > LIMITS.jsonDepth) fail(`${label}: JSON nesting limit`);
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
    const token = /^(true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(i));
    if (!token) fail(`${label}: invalid JSON token`);
    i += token[0].length;
  };
  scan(0);
  whitespace();
  if (i !== text.length) fail(`${label}: trailing JSON data`);
  return JSON.parse(text);
}

function sameFileIdentity(a, b, label) {
  if (!b.isFile() || b.isSymbolicLink() || b.nlink !== 1 || a.size !== b.size || a.dev !== b.dev || a.ino !== b.ino || a.mtimeMs !== b.mtimeMs || a.ctimeMs !== b.ctimeMs) fail(`${label}: file changed or is unsafe`);
}

function readRegularFile(filename, maximum, label) {
  const before = fs.lstatSync(filename);
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1 || before.size > maximum) fail(`${label}: unsafe or oversized file`);
  const noFollow = fs.constants.O_NOFOLLOW ?? 0;
  const fd = fs.openSync(filename, fs.constants.O_RDONLY | noFollow);
  try {
    const opened = fs.fstatSync(fd);
    sameFileIdentity(before, opened, label);
    const chunks = [];
    const chunk = Buffer.allocUnsafe(64 * 1024);
    let bytes = 0;
    while (true) {
      const read = fs.readSync(fd, chunk, 0, chunk.length, null);
      if (!read) break;
      bytes += read;
      if (bytes > maximum) fail(`${label}: oversized file`);
      chunks.push(Buffer.from(chunk.subarray(0, read)));
    }
    sameFileIdentity(opened, fs.fstatSync(fd), label);
    if (bytes !== opened.size) fail(`${label}: file changed while reading`);
    return Buffer.concat(chunks, bytes);
  } finally {
    fs.closeSync(fd);
  }
}

function parseBoundedJson(filename, maximum, label) {
  return parseStrictJson(readRegularFile(filename, maximum, label), label);
}

function assertDirectory(directory, label) {
  if (!path.isAbsolute(directory)) fail(`${label}: must be an absolute path`);
  const resolved = path.resolve(directory);
  const info = fs.lstatSync(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) fail(`${label}: not a regular directory`);
  const real = fs.realpathSync(directory);
  if (real !== resolved) fail(`${label}: symlink in directory path`);
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
  if (android.bundle === '_expo') fail('android bundle: bundle must be a file under _expo/');
  safePath(android.bundle, 'android bundle', true);
  if (!Array.isArray(android.assets) || android.assets.length > LIMITS.files - 3) fail('metadata: invalid assets');
  const paths = ['metadata.json', 'assetmap.json', android.bundle];
  for (const [index, asset] of android.assets.entries()) {
    keysExactly(asset, ['path', 'ext'], `asset ${index}`);
    const canonical = canonicalMetadataAssetPath(asset.path, `asset ${index}`);
    if (typeof asset.ext !== 'string' || !/^[A-Za-z0-9]{1,16}$/.test(asset.ext)) fail(`asset ${index}: invalid extension`);
    paths.push(canonical);
  }
  namesUnique(paths, 'metadata');
  return paths;
}

function boundedText(value, label, max = LIMITS.assetmapText) {
  if (typeof value !== 'string' || value.length === 0 || value.length > max || /[\x00-\x1f\x7f]/.test(value)) fail(`${label}: invalid string`);
}

function validateAssetMap(value) {
  object(value, 'assetmap');
  const entries = Object.entries(value);
  if (entries.length > LIMITS.assetmapEntries) fail('assetmap: too many entries');
  namesUnique(entries.map(([key]) => key), 'assetmap keys');
  for (const [key, entry] of entries) {
    if (!/^[a-z0-9_-]{1,128}$/i.test(key)) fail('assetmap: invalid key');
    object(entry, 'assetmap entry');
    const fields = Object.keys(entry);
    if (ASSETMAP_REQUIRED.some(field => !fields.includes(field)) || fields.some(field => !ASSETMAP_REQUIRED.includes(field) && !ASSETMAP_OPTIONAL.includes(field))) fail('assetmap: missing or unknown field');

    boundedText(entry.name, 'assetmap name', 128);
    if (!ASSET_NAME.test(entry.name) || entry.name === '.' || entry.name === '..' || entry.name.endsWith('.') || entry.name.endsWith(' ')) fail('assetmap: invalid name');
    if (typeof entry.type !== 'string' || !/^[A-Za-z0-9]{1,16}$/.test(entry.type)) fail('assetmap: invalid type');
    boundedText(entry.httpServerLocation, 'assetmap server location');
    if (!entry.httpServerLocation.startsWith('/assets') || entry.httpServerLocation.includes('\\') || entry.httpServerLocation.includes('..')) fail('assetmap: unsafe server location');
    const locationTail = entry.httpServerLocation.slice('/assets'.length);
    if (locationTail && !locationTail.startsWith('/')) fail('assetmap: unsafe server location');
    const locationSegments = locationTail.split('/').filter(Boolean);
    if (locationSegments.some((segment, index) =>
      !(IDENTIFIER.test(segment) || (index > 0 && locationSegments[index - 1] === 'node_modules' && /^@[A-Za-z0-9][A-Za-z0-9._-]{0,126}$/.test(segment))) ||
      segment === '.' || segment === '..')) fail('assetmap: unsafe server location');

    if (Object.hasOwn(entry, '__packager_asset') && entry.__packager_asset !== true) fail('assetmap: invalid __packager_asset');
    if (Object.hasOwn(entry, 'fileSystemLocation')) boundedText(entry.fileSystemLocation, 'assetmap fileSystemLocation');
    for (const field of ['width', 'height']) {
      if (Object.hasOwn(entry, field) && (!Number.isSafeInteger(entry[field]) || entry[field] < 1 || entry[field] > 100000)) fail(`assetmap: invalid ${field}`);
    }
    if (Object.hasOwn(entry, 'scales') && (!Array.isArray(entry.scales) || entry.scales.length < 1 || entry.scales.length > 20 || entry.scales.some(n => !Number.isFinite(n) || n <= 0 || n > 16))) fail('assetmap: invalid scales');
    for (const field of ['files', 'fileHashes']) {
      if (Object.hasOwn(entry, field) && (!Array.isArray(entry[field]) || entry[field].length < 1 || entry[field].length > LIMITS.assetmapArray)) fail(`assetmap: invalid ${field}`);
    }
    if (Object.hasOwn(entry, 'files')) for (const file of entry.files) boundedText(file, 'assetmap file path');
    if (Object.hasOwn(entry, 'hash') && (typeof entry.hash !== 'string' || !/^[a-f0-9]{32}$/i.test(entry.hash))) fail('assetmap: invalid hash');
    if (Object.hasOwn(entry, 'fileHashes') && entry.fileHashes.some(hash => typeof hash !== 'string' || !/^[a-f0-9]{32}$/i.test(hash))) fail('assetmap: invalid fileHashes');
    if (Object.hasOwn(entry, 'files') && Object.hasOwn(entry, 'fileHashes') && entry.files.length !== entry.fileHashes.length) fail('assetmap: files/hash count mismatch');
  }
}

function validateExpected(expected) {
  keysExactly(expected, EXPECTED_FIELDS, 'expected identity');
  if (!HEX40.test(expected.sourceSha) || !HEX40.test(expected.workflowSha)) fail('expected identity: invalid SHA');
  if (typeof expected.workflowRef !== 'string' || !/^SATananov\/USGCorso\/\.github\/workflows\/[A-Za-z0-9._-]+\.ya?ml@refs\/heads\/main$/.test(expected.workflowRef)) fail('expected identity: invalid workflow ref');
  integer(expected.runId, 'expected runId', 1);
  integer(expected.runAttempt, 'expected runAttempt', 1);
  integer(expected.artifactId, 'expected artifactId', 1);
  if (typeof expected.artifactDigest !== 'string' || !/^sha256:[a-f0-9]{64}$/i.test(expected.artifactDigest)) fail('expected identity: invalid artifact digest');
}

function validateManifest(value, expected, expectedPaths) {
  keysExactly(value, MANIFEST_FIELDS, 'manifest');
  if (value.schemaVersion !== 1 || value.platform !== 'android' || !HEX40.test(value.sourceSha) || !HEX40.test(value.workflowSha)) fail('manifest: invalid identity');
  if (typeof value.workflowRef !== 'string' || !/^SATananov\/USGCorso\/\.github\/workflows\/[A-Za-z0-9._-]+\.ya?ml@refs\/heads\/main$/.test(value.workflowRef)) fail('manifest: invalid workflow ref');
  integer(value.runId, 'runId', 1);
  integer(value.runAttempt, 'runAttempt', 1);
  integer(value.artifactId, 'artifactId', 1);
  if (typeof value.artifactDigest !== 'string' || !/^sha256:[a-f0-9]{64}$/i.test(value.artifactDigest)) fail('manifest: invalid artifact digest');

  const equal = (actual, wanted) => typeof actual === 'string' && actual.toLowerCase() === wanted.toLowerCase();
  if (!equal(value.sourceSha, expected.sourceSha) || !equal(value.workflowSha, expected.workflowSha) || value.workflowRef !== expected.workflowRef || value.runId !== expected.runId || value.runAttempt !== expected.runAttempt || value.artifactId !== expected.artifactId || !equal(value.artifactDigest, expected.artifactDigest)) fail('manifest: identity does not match trusted expected values');

  if (!Array.isArray(value.files) || value.files.length !== expectedPaths.length || value.files.length > LIMITS.files) fail('manifest: file count mismatch');
  const manifestPaths = [];
  for (const file of value.files) {
    keysExactly(file, FILE_FIELDS, 'manifest file');
    safePath(file.path, 'manifest path', file.path === expectedPaths.find(item => item.startsWith('_expo/')));
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
  const files = [];
  const directories = [];
  const allPaths = [];
  let entriesSeen = 0;
  let totalBytes = 0;
  const walk = (dir, prefix = '', depth = 0) => {
    if (depth > LIMITS.depth) fail('input: directory depth limit exceeded');
    const handle = fs.opendirSync(dir, { bufferSize: 32 });
    try {
      while (true) {
        const entry = handle.readSync();
        if (entry === null) break;
        entriesSeen++;
        if (entriesSeen > LIMITS.entries) fail('input: entry count limit exceeded');
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
        safePath(relative, 'input entry', relative === '_expo' || relative.startsWith('_expo/'));
        const absolute = path.join(dir, entry.name);
        const info = fs.lstatSync(absolute);
        if (info.isSymbolicLink()) fail('input: symlink detected');
        allPaths.push(relative);
        if (info.isDirectory()) {
          directories.push(relative);
          walk(absolute, relative, depth + 1);
        } else if (info.isFile() && info.nlink === 1) {
          if (info.size > LIMITS.single) fail('input: single-file limit exceeded');
          totalBytes += info.size;
          if (totalBytes > LIMITS.total) fail('input: expanded limit exceeded');
          files.push({ path: relative, stat: info });
          if (files.length > LIMITS.files) fail('input: file count limit exceeded');
        } else fail('input: non-regular or hard-linked file');
      }
    } finally {
      try { handle.closeSync(); } catch (error) { if (error.code !== 'ERR_DIR_CLOSED') throw error; }
    }
  };
  walk(root);
  namesUnique(allPaths, 'input');
  return { files, directories, totalBytes };
}

function expectedDirectories(paths) {
  const result = new Set();
  for (const item of paths) {
    const parts = item.split('/');
    for (let i = 1; i < parts.length; i++) result.add(parts.slice(0, i).join('/'));
  }
  return [...result];
}

function sameScannedFile(scanned, opened, label) {
  if (!opened.isFile() || opened.nlink !== 1 || scanned.size !== opened.size || scanned.dev !== opened.dev || scanned.ino !== opened.ino || scanned.mtimeMs !== opened.mtimeMs || scanned.ctimeMs !== opened.ctimeMs) fail(`${label}: file changed or is unsafe`);
}

function writeBufferAndVerify(output, file, bytes) {
  if (bytes.length !== file.size || bytes.length > LIMITS.single) fail(`file: size mismatch ${file.path}`);
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (digest.toLowerCase() !== file.sha256.toLowerCase()) fail(`file: digest mismatch ${file.path}`);
  const target = path.join(output, ...file.path.split('/'));
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const fd = fs.openSync(target, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0), 0o400);
  try {
    let written = 0;
    while (written < bytes.length) {
      const count = fs.writeSync(fd, bytes, written, bytes.length - written);
      if (count <= 0) fail(`file: write stalled ${file.path}`);
      written += count;
    }
    fs.fchmodSync(fd, 0o400);
  } finally {
    fs.closeSync(fd);
  }
}

function copyAndVerify(root, output, file, scanned) {
  const from = path.join(root, ...file.path.split('/'));
  const target = path.join(output, ...file.path.split('/'));
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const fd = fs.openSync(from, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
  let destination;
  try {
    const opened = fs.fstatSync(fd);
    sameScannedFile(scanned, opened, file.path);
    if (opened.size !== file.size) fail(`file: size mismatch ${file.path}`);
    destination = fs.openSync(target, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0), 0o400);
    const hash = crypto.createHash('sha256');
    const chunk = Buffer.allocUnsafe(128 * 1024);
    let bytes = 0;
    while (true) {
      const read = fs.readSync(fd, chunk, 0, chunk.length, null);
      if (!read) break;
      bytes += read;
      if (bytes > file.size || bytes > LIMITS.single) fail(`file: size changed ${file.path}`);
      const slice = chunk.subarray(0, read);
      hash.update(slice);
      let written = 0;
      while (written < read) {
        const count = fs.writeSync(destination, slice, written, read - written);
        if (count <= 0) fail(`file: write stalled ${file.path}`);
        written += count;
      }
    }
    if (bytes !== file.size || hash.digest('hex').toLowerCase() !== file.sha256.toLowerCase()) fail(`file: digest mismatch ${file.path}`);
    sameScannedFile(scanned, fs.fstatSync(fd), file.path);
    fs.fchmodSync(destination, 0o400);
  } finally {
    if (destination !== undefined) fs.closeSync(destination);
    fs.closeSync(fd);
  }
}

function validateArtifact({ root, manifest, output, expected }) {
  if (!root || !manifest || !output || !expected) fail('required inputs: root, manifest, output, expected identity');
  validateExpected(expected);
  const sourceRoot = assertDirectory(root, 'root');
  const manifestFile = path.resolve(manifest);
  const target = path.resolve(output);
  if (!path.isAbsolute(manifest) || under(sourceRoot, manifestFile) || manifestFile === sourceRoot) fail('manifest: must be outside export root');
  if (!path.isAbsolute(output)) fail('output: must be an absolute path');
  const outputParent = path.dirname(target);
  if (!fs.existsSync(outputParent) || fs.realpathSync(outputParent) !== outputParent) fail('output: parent must exist and contain no symlink');
  if (fs.existsSync(target)) fail('output: target already exists');
  if (target === sourceRoot || under(sourceRoot, target) || under(target, sourceRoot) || target === path.dirname(manifestFile) || under(target, manifestFile)) fail('output: overlaps source or manifest');

  const tree = inspectTree(sourceRoot);
  const metadataBuffer = readRegularFile(path.join(sourceRoot, 'metadata.json'), LIMITS.metadata, 'metadata');
  const metadata = parseStrictJson(metadataBuffer, 'metadata');
  const expectedPaths = metadataPaths(metadata);
  const expectedDirs = expectedDirectories(expectedPaths);
  const filePaths = tree.files.map(file => file.path);
  if (filePaths.length !== expectedPaths.length || filePaths.some(p => !expectedPaths.includes(p))) fail('input: unexpected or missing file');
  if (tree.directories.length !== expectedDirs.length || tree.directories.some(p => !expectedDirs.includes(p))) fail('input: unexpected or missing directory');

  const assetmapBuffer = readRegularFile(path.join(sourceRoot, 'assetmap.json'), LIMITS.assetmap, 'assetmap');
  validateAssetMap(parseStrictJson(assetmapBuffer, 'assetmap'));
  const manifestBuffer = readRegularFile(manifestFile, LIMITS.metadata, 'manifest');
  const manifestData = parseStrictJson(manifestBuffer, 'manifest');
  const total = validateManifest(manifestData, expected, expectedPaths);
  if (total !== tree.totalBytes) fail('manifest: byte total does not match input tree');

  const listed = new Map(manifestData.files.map(file => [file.path, file]));
  for (const [relative, limit] of [['metadata.json', LIMITS.metadata], ['assetmap.json', LIMITS.assetmap]]) {
    if (listed.get(relative).size > limit) fail(`${relative}: size cap exceeded`);
  }
  const scannedByPath = new Map(tree.files.map(file => [file.path, file.stat]));
  const validatedBuffers = new Map([['metadata.json', metadataBuffer], ['assetmap.json', assetmapBuffer]]);
  const staging = fs.mkdtempSync(`${target}.tmp-`);
  try {
    fs.chmodSync(staging, 0o700);
    for (const file of [...listed.values()].sort((a, b) => a.path.localeCompare(b.path))) {
      const buffer = validatedBuffers.get(file.path);
      if (buffer) writeBufferAndVerify(staging, file, buffer);
      else copyAndVerify(sourceRoot, staging, file, scannedByPath.get(file.path));
    }
    const dirs = expectedDirs.sort((a, b) => b.length - a.length);
    for (const relative of dirs) fs.chmodSync(path.join(staging, ...relative.split('/')), 0o500);
    fs.chmodSync(staging, 0o500);
    fs.renameSync(staging, target);
    return { status: 'PASS', sourceSha: manifestData.sourceSha, artifactDigest: manifestData.artifactDigest, fileCount: listed.size, totalBytes: total };
  } catch (error) {
    fs.chmodSync(staging, 0o700);
    fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

function runCli(argv) {
  const values = {};
  const flags = ['--root', '--manifest', '--output', '--expected-source-sha', '--expected-workflow-sha', '--expected-workflow-ref', '--expected-run-id', '--expected-run-attempt', '--expected-artifact-id', '--expected-artifact-digest'];
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    if (!flags.includes(flag) || Object.hasOwn(values, flag) || !argv[index + 1]) fail('usage: --root ABS --manifest ABS --output ABS plus all --expected-* identity values');
    values[flag] = argv[index + 1];
  }
  if (Object.keys(values).length !== flags.length) fail('usage: --root ABS --manifest ABS --output ABS plus all --expected-* identity values');
  const numeric = field => {
    if (!/^[1-9]\d*$/.test(values[field])) fail(`invalid integer argument: ${field}`);
    const number = Number(values[field]);
    integer(number, field, 1);
    return number;
  };
  return validateArtifact({
    root: values['--root'],
    manifest: values['--manifest'],
    output: values['--output'],
    expected: {
      sourceSha: values['--expected-source-sha'],
      workflowSha: values['--expected-workflow-sha'],
      workflowRef: values['--expected-workflow-ref'],
      runId: numeric('--expected-run-id'),
      runAttempt: numeric('--expected-run-attempt'),
      artifactId: numeric('--expected-artifact-id'),
      artifactDigest: values['--expected-artifact-digest'],
    },
  });
}

export { validateArtifact, runCli };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(`${JSON.stringify(runCli(process.argv.slice(2)))}\n`);
  } catch (error) {
    process.stderr.write(`OTA artifact validation failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
