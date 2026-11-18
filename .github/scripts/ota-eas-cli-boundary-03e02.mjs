import { closeSync, fstatSync, openSync, readSync } from 'node:fs';
import { TextDecoder } from 'node:util';

export const PIN = Object.freeze({
  upstream: 'expo/eas-cli',
  ref: 'v27.9.0',
  path: 'packages/eas-cli/src/commands/update/index.ts',
  gitBlobSha1: '7ca5a5d910e0abe62dcc7119dafd17933c1ba7e6',
});

export const MAX_SOURCE_BYTES = 2_000_000;

const REQUIRED = Object.freeze([
  ['dynamic context requested', 'this.ContextOptions.DynamicProjectConfig'],
  ['dynamic public config call', 'await getDynamicPublicProjectConfigAsync()'],
  ['dynamic private config call', 'await getDynamicPrivateProjectConfigAsync()'],
  ['skip-bundler condition', 'if (!skipBundler)'],
  ['bundle construction', 'await buildBundlesAsync({'],
  ['input directory resolution', 'await resolveInputDirectoryAsync(inputDir, {'],
]);

export function inspectEasUpdateSource(text) {
  if (typeof text !== 'string' || text.length === 0 || Buffer.byteLength(text, 'utf8') > MAX_SOURCE_BYTES) {
    throw new Error('Source must be nonempty bounded UTF-8 text');
  }
  const offsets = {};
  for (const [label, token] of REQUIRED) {
    const first = text.indexOf(token);
    if (first < 0 || text.indexOf(token, first + token.length) >= 0) {
      throw new Error(`Missing or ambiguous text marker: ${label}`);
    }
    offsets[label] = first;
  }
  const publicCall = offsets['dynamic public config call'];
  const privateCall = offsets['dynamic private config call'];
  const skip = offsets['skip-bundler condition'];
  const build = offsets['bundle construction'];
  const input = offsets['input directory resolution'];
  if (!(offsets['dynamic context requested'] < publicCall && publicCall < privateCall && privateCall < skip && skip < build && build < input)) {
    throw new Error('Unexpected text marker ordering; manual re-audit required');
  }
  return Object.freeze({
    evidenceType: 'UNAUTHENTICATED_TEXT_MARKERS_ONLY',
    textMarkerOrderObserved: true,
    sourceAuthenticityProven: false,
    semanticControlFlowProven: false,
    skipBundlerControlFlowProven: false,
    dynamicConfigExecutionOrderProven: false,
    codeExecutionIsolationProven: false,
    publishAuthorized: false,
    offsets: Object.freeze(offsets),
  });
}

export function readBoundedSource(path) {
  const fd = openSync(path, 'r');
  try {
    const size = fstatSync(fd);
    if (!size.isFile() || size.size <= 0 || size.size > MAX_SOURCE_BYTES) {
      throw new Error('Source file size outside allowed range');
    }
    const chunks = [];
    let total = 0;
    while (true) {
      const chunk = Buffer.allocUnsafe(Math.min(64 * 1024, MAX_SOURCE_BYTES + 1 - total));
      const bytesRead = readSync(fd, chunk, 0, chunk.length, null);
      if (bytesRead === 0) break;
      total += bytesRead;
      if (total > MAX_SOURCE_BYTES) throw new Error('Source grew beyond allowed byte limit');
      chunks.push(chunk.subarray(0, bytesRead));
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks, total));
  } finally {
    closeSync(fd);
  }
}

export function inspectFile(path) {
  return inspectEasUpdateSource(readBoundedSource(path));
}

if (process.argv[1]?.endsWith('ota-eas-cli-boundary-03e02.mjs')) {
  if (process.argv.length !== 3) {
    process.stderr.write('Usage: node ota-eas-cli-boundary-03e02.mjs <local-eas-cli-source.ts>\n');
    process.exitCode = 2;
  } else {
    try {
      process.stdout.write(`${JSON.stringify(inspectFile(process.argv[2]), null, 2)}\n`);
    } catch (error) {
      process.stderr.write(`DENY: ${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
