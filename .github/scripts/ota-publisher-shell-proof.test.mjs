import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, linkSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { stageForOfflineProof, PROOF_BOUNDARY } from './ota-publisher-shell-proof.mjs';

function setup() {
  const temp = mkdtempSync(join(tmpdir(),'ota-shell-proof-'));
  const sourceRoot=join(temp,'candidate'); mkdirSync(sourceRoot);
  const bytes=Buffer.from('demo bundle bytes, not executable');
  writeFileSync(join(sourceRoot,'bundle.hbc'),bytes);
  const manifest={files:[{path:'bundle.hbc',sha256:createHash('sha256').update(bytes).digest('hex')}]};
  return {sourceRoot,destinationRoot:join(temp,'trusted'),manifest,temp};
}

test('stages exact manifest bytes under independent shell without invoking them',()=>{
  const args=setup(); const result=stageForOfflineProof(args);
  assert.equal(result.publishes,false);assert.equal(result.executesCandidate,false);assert.equal(result.trustsMetadata,false);
  assert.equal(readFileSync(join(args.destinationRoot,'dist','bundle.hbc'),'utf8'),'demo bundle bytes, not executable');
  assert.deepEqual(JSON.parse(readFileSync(join(args.destinationRoot,'trusted-shell.json'),'utf8')),PROOF_BOUNDARY);
});
test('rejects mismatch digest',()=>{const a=setup();a.manifest.files[0].sha256='0'.repeat(64);assert.throws(()=>stageForOfflineProof(a),/digest/);});
test('rejects extra candidate file',()=>{const a=setup();writeFileSync(join(a.sourceRoot,'app.config.js'),'throw Error("never run")');assert.throws(()=>stageForOfflineProof(a),/Unexpected source/);});
test('rejects unexpected candidate executable script',()=>{const a=setup();writeFileSync(join(a.sourceRoot,'package.json'),'{}');assert.throws(()=>stageForOfflineProof(a),/Unexpected source/);});
test('rejects direct path traversal',()=>{const a=setup();a.manifest.files[0].path='../evil';assert.throws(()=>stageForOfflineProof(a),/Unsafe/);});
test('rejects Windows separators',()=>{const a=setup();a.manifest.files[0].path='foo\\bar';assert.throws(()=>stageForOfflineProof(a),/Unsafe/);});
test('rejects path with dot component',()=>{const a=setup();a.manifest.files[0].path='./bundle.hbc';assert.throws(()=>stageForOfflineProof(a),/Unsafe/);});
test('rejects duplicate file entries',()=>{const a=setup();a.manifest.files.push({...a.manifest.files[0]});assert.throws(()=>stageForOfflineProof(a),/Duplicate/);});
test('rejects environment EXPO_TOKEN presence',()=>{const a=setup();a.environment={EXPO_TOKEN:'dummy'};assert.throws(()=>stageForOfflineProof(a),/Credential/);});
test('rejects environment GH_TOKEN presence',()=>{const a=setup();a.environment={GH_TOKEN:'dummy'};assert.throws(()=>stageForOfflineProof(a),/Credential/);});
test('rejects nested destination inside candidate',()=>{const a=setup();a.destinationRoot=join(a.sourceRoot,'trusted');assert.throws(()=>stageForOfflineProof(a),/Overlapping/);});
test('rejects already existing destination',()=>{const a=setup();mkdirSync(a.destinationRoot);assert.throws(()=>stageForOfflineProof(a),/exists/);});
test('rejects extra manifest entry keys',()=>{const a=setup();a.manifest.files[0].allowExecute=true;assert.throws(()=>stageForOfflineProof(a),/Invalid digest entry/);});
test('rejects extra manifest keys',()=>{const a=setup();a.manifest.allowPublish=true;assert.throws(()=>stageForOfflineProof(a),/Invalid manifest/);});
test('rejects hardlinked source file',()=>{const a=setup();linkSync(join(a.sourceRoot,'bundle.hbc'),join(a.temp,'hardlink'));assert.throws(()=>stageForOfflineProof(a),/Unsafe file/);});
test('rejects symlinked candidate file when filesystem supports links',(t)=>{const a=setup();try{symlinkSync(join(a.sourceRoot,'bundle.hbc'),join(a.sourceRoot,'second'));}catch{t.skip('symlinks unavailable');return;}assert.throws(()=>stageForOfflineProof(a),/Symlink/);});
test('does not expose candidate config in shell',()=>{const a=setup();stageForOfflineProof(a);const shell=readFileSync(join(a.destinationRoot,'trusted-shell.json'),'utf8');assert.doesNotMatch(shell,/app\.config\.js|EXPO_TOKEN/);});
test('proof expressly disables publishing',()=>{assert.equal(PROOF_BOUNDARY.publishEnabled,false);});
test('rejects executable app config even when manifest explicitly hashes it',()=>{const a=setup();const bytes=Buffer.from('throw Error("not allowed")');writeFileSync(join(a.sourceRoot,'app.config.js'),bytes);a.manifest.files.push({path:'app.config.js',sha256:createHash('sha256').update(bytes).digest('hex')});assert.throws(()=>stageForOfflineProof(a),/executable export/);});
test('rejects package manifest even when it is hash approved',()=>{const a=setup();const bytes=Buffer.from('{}');writeFileSync(join(a.sourceRoot,'package.json'),bytes);a.manifest.files.push({path:'package.json',sha256:createHash('sha256').update(bytes).digest('hex')});assert.throws(()=>stageForOfflineProof(a),/executable export/);});
test('rejects candidate JS even with correct hash',()=>{const a=setup();const bytes=Buffer.from('console.log(1)');writeFileSync(join(a.sourceRoot,'bundle.js'),bytes);a.manifest.files.push({path:'bundle.js',sha256:createHash('sha256').update(bytes).digest('hex')});assert.throws(()=>stageForOfflineProof(a),/executable export/);});
test('rejects aggregate number of files',()=>{const a=setup();a.manifest.files=Array.from({length:17},()=>({...a.manifest.files[0]}));assert.throws(()=>stageForOfflineProof(a),/Invalid manifest/);});
test('rejects total byte budget',()=>{const a=setup();const names=[];for(let i=0;i<5;i++){const bytes=Buffer.alloc(7*1024*1024, i);const p=`assets/asset${i}.png`;mkdirSync(join(a.sourceRoot,'assets'),{recursive:true});writeFileSync(join(a.sourceRoot,p),bytes);names.push({path:p,sha256:createHash('sha256').update(bytes).digest('hex')});}a.manifest.files=names;assert.throws(()=>stageForOfflineProof(a),/byte budget/);});
test('rejects deep or excessive directory tree',()=>{const a=setup();for(let i=0;i<70;i++)writeFileSync(join(a.sourceRoot,`junk${i}`),'x');assert.throws(()=>stageForOfflineProof(a),/too many entries/);});
test('rejects environment credentials inherited from process',()=>{const a=setup();const old=process.env.EXPO_TOKEN;try{process.env.EXPO_TOKEN='offline-test-placeholder';assert.throws(()=>stageForOfflineProof(a),/Credential/);}finally{if(old===undefined)delete process.env.EXPO_TOKEN;else process.env.EXPO_TOKEN=old;}});
test('rejects source-destination containing path from alternate spelling',()=>{const a=setup();a.destinationRoot=join(a.sourceRoot,'subfolder');assert.throws(()=>stageForOfflineProof(a),/Overlapping/);});
test('cleanup removes partial destination on digest mismatch',()=>{const a=setup();a.manifest.files[0].sha256='1'.repeat(64);assert.throws(()=>stageForOfflineProof(a),/digest/);assert.throws(()=>readFileSync(join(a.destinationRoot,'trusted-shell.json')));});
test('rejects Windows case-variant destination nested in source', {skip:process.platform!=='win32'},()=>{const a=setup();a.destinationRoot=join(a.sourceRoot.toUpperCase(),'NESTED');assert.throws(()=>stageForOfflineProof(a),/Overlapping/);});
test('removes partial output after later file digest failure',()=>{const a=setup();mkdirSync(join(a.sourceRoot,'assets'));const bytes=Buffer.from('second');writeFileSync(join(a.sourceRoot,'assets/second.png'),bytes);a.manifest.files.push({path:'assets/second.png',sha256:'0'.repeat(64)});assert.throws(()=>stageForOfflineProof(a),/digest/);assert.throws(()=>readFileSync(join(a.destinationRoot,'dist','bundle.hbc')));});
