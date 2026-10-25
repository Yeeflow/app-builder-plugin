#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,readdirSync,existsSync,rmSync,mkdirSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
import {validateApps,profileOptions,services} from './plugin-host-profile.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const temp=mkdtempSync(resolve(tmpdir(),'yeeflow-host-profiles-'));
const apps={apps:Object.fromEntries(services.map((key,i)=>[key,{id:`asdk_app_fixture${i}`}]))};
assert.deepEqual(validateApps(apps),apps);
for(const id of ['plugin_asdk_app_bad','asdk_app_','asdk_app_/bad','asdk_app_bad.value']) {
 const bad=structuredClone(apps);bad.apps.yeeflow.id=id;assert.throws(()=>validateApps(bad),/PLUGIN_APP_ID_INVALID/);
}
const missing=structuredClone(apps);delete missing.apps.yeeflow;assert.throws(()=>validateApps(missing),/SERVICE_SET/);
const legacy={apps:Object.fromEntries(['app-builder','operations','admin','service-portal'].map((k,i)=>[k,{id:`asdk_app_old${i}`}]))};assert.throws(()=>validateApps(legacy),/SERVICE_SET/);
const extra=structuredClone(apps);extra.apps.admin={id:'asdk_app_extra'};assert.throws(()=>validateApps(extra),/SERVICE_SET/);
assert.throws(()=>profileOptions(['--profile','other']),/PROFILE_INVALID/);
assert.throws(()=>profileOptions(['--profile','chatgpt-web']),/APPS_REQUIRED/);
assert.throws(()=>profileOptions(['--profile','chatgpt-web','--apps','x','--name','../escape']),/NAME_INVALID/);
assert.throws(()=>profileOptions(['--name','review']),/WEB_OPTIONS/);
for (const args of [['--apps','x'],['--name','private-app'],['--display-name','Private App']]) {
 assert.throws(()=>profileOptions(['--profile','directory',...args]),/DIRECTORY_APP_OPTIONS_FORBIDDEN/);
}
for (const version of ['next','1.2','01.2.3','1.2.3/escape']) {
 assert.throws(()=>profileOptions(['--profile','directory','--version',version]),/VERSION_INVALID/);
}
assert.equal(profileOptions(['--profile','directory','--version','1.20.0-local.1']).version,'1.20.0-local.1');
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(resolve(dir,e.name)):[resolve(dir,e.name)]);}
try {
 const mapping=resolve(temp,'apps.json');writeFileSync(mapping,JSON.stringify(apps));
 const folders={};
 const originalManifest=readFileSync(resolve(root,'dist/yeeflow-app-builder-plugin/.codex-plugin/plugin.json'),'utf8');
 for(const profile of ['codex','chatgpt-web','directory']) {
  const archive=resolve(temp,`${profile}.zip`),out=resolve(temp,profile);mkdirSync(out);
  execFileSync(process.execPath,[resolve(root,'scripts/build-plugin-archive.mjs'),'--tracked-only','--profile',profile,'--version','1.20.0-local.1','--output',archive,...(profile==='chatgpt-web'?['--apps',mapping,'--name','yeeflow-app-builder-web-review','--display-name','Yeeflow App Builder — Web Review']:[])],{cwd:temp,stdio:'pipe'});
  execFileSync('unzip',['-q',archive,'-d',out]);
  const dir=resolve(out,profile==='chatgpt-web'?'yeeflow-app-builder-web-review':'yeeflow-app-builder-plugin');folders[profile]=dir;
  const manifest=JSON.parse(readFileSync(resolve(dir,'.codex-plugin/plugin.json')));
  assert.equal(manifest.version,'1.20.0-local.1');
  const skills=readdirSync(resolve(dir,'skills')).filter(x=>existsSync(resolve(dir,'skills',x,'SKILL.md')));
  assert.equal(skills.length,31);
  assert.ok(existsSync(resolve(dir,'docs/standards/multi-account-oauth.md')),'include the local validation and server contract guide');
  for(const skill of skills) {
   const body=readFileSync(resolve(dir,'skills',skill,'SKILL.md'),'utf8');
   assert.match(body,/Portable access to bundled resources/);
   assert.doesNotMatch(body,/YEEFLOW_PROFILE|legacy\/deprecated fallback/,'live identities must use host OAuth connections');
   assert.equal(body.split('<!-- plugin-resource-access -->').length,2,'shared guidance must appear exactly once');
   assert.equal(body.split('<!-- plugin-resource-access -->')[1].trim(),readFileSync(resolve(root,'docs/standards/plugin-resource-access.md'),'utf8').trim());
  }
  if(profile==='codex') {assert.equal(manifest.mcpServers,'./.mcp.json');assert.ok(existsSync(resolve(dir,'.mcp.json')));}
  else if(profile==='chatgpt-web') {assert.equal(manifest.name,'yeeflow-app-builder-web-review');assert.equal(manifest.apps,'./.app.json');assert.equal(manifest.mcpServers,undefined);assert.ok(!existsSync(resolve(dir,'.mcp.json')));assert.ok(!existsSync(resolve(dir,'mcp.json')));assert.deepEqual(JSON.parse(readFileSync(resolve(dir,'.app.json'))),apps);}
  else {
   assert.equal(manifest.name,'yeeflow-app-builder');
   assert.equal(manifest.apps,undefined);
   assert.equal(manifest.hooks,undefined);
   assert.equal(manifest.extensions?.['com.openai']?.apps,undefined);
   assert.equal(manifest.extensions?.['com.openai']?.hooks,undefined);
   assert.equal(manifest.interface.defaultPrompt.length,3);
   assert.equal(manifest.interface.supportURL,'https://support.yeeflow.com/');
   assert.equal(manifest.mcpServers,'./.mcp.json');
   assert.ok(existsSync(resolve(dir,'.codex-plugin/plugin.json')));
   for(const file of ['plugin.json','mcp.json','.app.json','hooks']) assert.ok(!existsSync(resolve(dir,file)),file);
   const mcp=JSON.parse(readFileSync(resolve(dir,'.mcp.json'),'utf8'));
   assert.deepEqual(mcp,{
    mcpServers:{yeeflow_mcp:{type:'http',url:'https://api.yeeflow.com/v1/mcp',extensions:{'com.openai':{auth:{type:'oauth',client:{mode:'dcr'}}}}}}
   });
   assert.doesNotMatch(JSON.stringify({manifest,mcp}),/asdk_app_|clientSecret|accessToken|refreshToken|"headers"|"tenantId"|"accountId"/);
  }
  const result=spawnSync(process.execPath,[resolve(dir,'scripts/test-skill-entrypoint-compat.mjs')],{cwd:temp,encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/guardrail tests passed/);
 }
 assert.equal(readFileSync(resolve(root,'dist/yeeflow-app-builder-plugin/.codex-plugin/plugin.json'),'utf8'),originalManifest,'staged version override must not modify the released source manifest');
 // Shared payload must survive host projection byte-for-byte, apart from explicit transport metadata.
 const codex=folders.codex,web=folders['chatgpt-web'];
 for(const file of files(codex)) {
  const rel=relative(codex,file);if(['.codex-plugin/plugin.json','plugin.json','.mcp.json','mcp.json','.app.json'].includes(rel))continue;
  assert.deepEqual(readFileSync(resolve(web,rel)),readFileSync(file),`host payload drift: ${rel}`);
  assert.deepEqual(readFileSync(resolve(folders.directory,rel)),readFileSync(file),`directory payload drift: ${rel}`);
 }
 console.log('PLUGIN_HOST_PROFILES_PASS: 3 archives; 31 skills each; shared payload parity; archived entrypoint regressions; OAuth/DCR; invalid mappings rejected; source version preserved');
}finally{rmSync(temp,{recursive:true,force:true});}
