import { createHash } from 'node:crypto';
import { constants, closeSync, fstatSync, lstatSync, mkdirSync, openSync, readSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const MAX_FILE = 8 * 1024 * 1024;
const MAX_TOTAL = 32 * 1024 * 1024;
const MAX_FILES = 16;
const MAX_ENTRIES = 64;
const MAX_DEPTH = 6;
const SAFE_PATH = /^(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+$/;
const TEST_EXPORT_PATH = /^(?:bundle\.hbc|assets\/(?:[A-Za-z0-9_-]+\/){0,3}[A-Za-z0-9_-]+\.(?:png|jpg|jpeg|webp|gif|ttf|otf|woff2?))$/i;
const trustedShell = Object.freeze({ kind: 'non-publishing-test-shell', projectConfigSource: 'independent-trusted-data', publishEnabled: false });

function canonical(path) {
  const value = process.platform === 'win32' ? path.toLowerCase() : path;
  return value.endsWith(sep) ? value.slice(0, -1) : value;
}

function within(parent, child) {
  const p = canonical(parent), c = canonical(child);
  return p === c || c.startsWith(p + sep);
}

function safeName(name) {
  if (typeof name !== 'string' || !SAFE_PATH.test(name) || isAbsolute(name) || name.includes('\\') || name.split('/').some(x => x === '.' || x === '..' || x.startsWith('.')) || !TEST_EXPORT_PATH.test(name)) throw Error('Unsafe or executable export path');
  return name;
}

function verifyPathDirectories(root, name) {
  let current = root;
  for (const segment of name.split('/').slice(0, -1)) {
    current = join(current, segment);
    const st = lstatSync(current);
    if (!st.isDirectory() || st.isSymbolicLink()) throw Error('Unsafe source directory');
  }
}

function exactTree(root, names) {
  const found = [];
  let entries = 0;
  function walk(folder, prefix, depth) {
    if (depth > MAX_DEPTH) throw Error('Source tree too deep');
    for (const ent of readdirSync(folder, { withFileTypes: true })) {
      if (++entries > MAX_ENTRIES) throw Error('Source has too many entries');
      if (ent.isSymbolicLink()) throw Error('Symlink in source tree');
      const name = prefix ? `${prefix}/${ent.name}` : ent.name;
      if (ent.isDirectory()) walk(join(folder, ent.name), name, depth + 1);
      else if (ent.isFile()) found.push(name);
      else throw Error('Non-regular source entry');
    }
  }
  walk(root, '', 0);
  if (found.sort().join('\0') !== [...names].sort().join('\0')) throw Error('Unexpected source files');
}

function readVerifiedFile(path, expectedHash) {
  const before = lstatSync(path);
  if (!before.isFile() || before.nlink !== 1 || before.size < 0 || before.size > MAX_FILE) throw Error('Unsafe file');
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const opened = fstatSync(fd);
    if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== before.dev || opened.ino !== before.ino || opened.size !== before.size) throw Error('File changed at open');
    const buffers = [];
    let count = 0;
    const hash = createHash('sha256');
    while (count < opened.size) {
      const buf = Buffer.alloc(Math.min(65536, opened.size - count));
      const got = readSync(fd, buf, 0, buf.length, null);
      if (got <= 0) throw Error('File shortened');
      count += got;
      const chunk = buf.subarray(0, got);
      hash.update(chunk);
      buffers.push(chunk);
    }
    const after = lstatSync(path);
    if (!after.isFile() || after.nlink !== 1 || after.dev !== before.dev || after.ino !== before.ino || after.size !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs) throw Error('File changed during read');
    if (hash.digest('hex') !== expectedHash.toLowerCase()) throw Error('Artifact digest mismatch');
    return Buffer.concat(buffers);
  } finally { closeSync(fd); }
}

export function stageForOfflineProof({ sourceRoot, destinationRoot, manifest, environment = {} }) {
  if (typeof sourceRoot !== 'string' || typeof destinationRoot !== 'string' || !manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw Error('Invalid inputs');
  if (Object.keys(manifest).sort().join(',') !== 'files' || !Array.isArray(manifest.files) || manifest.files.length < 1 || manifest.files.length > MAX_FILES) throw Error('Invalid manifest');
  if (!environment || typeof environment !== 'object' || Array.isArray(environment)) throw Error('Invalid environment');
  if (Object.keys({ ...process.env, ...environment }).some(k => /^(EXPO_TOKEN|GITHUB_TOKEN|GH_TOKEN)$/i.test(k))) throw Error('Credential-bearing execution forbidden');
  const root = resolve(sourceRoot);
  const dest = resolve(destinationRoot);
  const source = lstatSync(root);
  if (!source.isDirectory() || source.isSymbolicLink()) throw Error('Unsafe source root');
  const realRoot = realpathSync.native(root);
  const parent = dirname(dest);
  const parentStat = lstatSync(parent);
  if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) throw Error('Unsafe destination parent');
  const realParent = realpathSync.native(parent);
  const realDest = join(realParent, basename(dest));
  if (within(realRoot, realDest) || within(realDest, realRoot)) throw Error('Overlapping source and destination');
  const names = [];
  let totalBytes = 0;
  for (const file of manifest.files) {
    if (!file || typeof file !== 'object' || Array.isArray(file) || Object.keys(file).sort().join(',') !== 'path,sha256' || typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(file.sha256)) throw Error('Invalid digest entry');
    names.push(safeName(file.path));
    verifyPathDirectories(root, file.path);
    const st = lstatSync(join(root, ...file.path.split('/')));
    if (!st.isFile() || st.nlink !== 1 || st.size > MAX_FILE) throw Error('Unsafe file');
    totalBytes += st.size;
    if (totalBytes > MAX_TOTAL) throw Error('Export exceeds total byte budget');
  }
  if (new Set(names.map(x => process.platform === 'win32' ? x.toLowerCase() : x)).size !== names.length) throw Error('Duplicate file');
  exactTree(root, names);
  try { lstatSync(dest); throw Error('Destination already exists'); } catch (err) { if (err.code !== 'ENOENT') throw err; }
  const safeParent = statSync(parent);
  if (safeParent.dev !== parentStat.dev || safeParent.ino !== parentStat.ino) throw Error('Destination parent changed');
  mkdirSync(dest);
  const created = lstatSync(dest);
  try {
    mkdirSync(join(dest, 'dist'));
    for (const file of manifest.files) {
      const bytes = readVerifiedFile(join(root, ...file.path.split('/')), file.sha256);
      const target = join(dest, 'dist', ...file.path.split('/'));
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, bytes, { flag: 'wx' });
    }
    writeFileSync(join(dest, 'trusted-shell.json'), JSON.stringify(trustedShell, null, 2) + '\n', { flag: 'wx' });
  } catch (error) {
    try {
      const now = lstatSync(dest);
      if (now.isDirectory() && !now.isSymbolicLink() && now.dev === created.dev && now.ino === created.ino) rmSync(dest, { recursive: true, force: true });
    } catch { }
    throw Error(`Proof stage failed: ${error.message}`);
  }
  return { stagedFiles: names.length, publishes: false, executesCandidate: false, trustsMetadata: false, root: dest };
}

export const PROOF_BOUNDARY = trustedShell;
