#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=resolve(root,'dist/yeeflow-app-builder-plugin');
const text=p=>readFileSync(p,'utf8');
const entries=JSON.parse(text(resolve(root,'docs/standards/document-workflow-distribution.json'))).mirrors;
const specialists=['yeeflow-workflow-stage-ui','yeeflow-attachment-ocr-orchestrator','yeeflow-document-archive-lifecycle'];
const enhanced=['yeeflow-approval-form-generator','yeeflow-expression-generator','yeeflow-data-list-generator','yeeflow-dashboard-generator','yeeflow-custom-code-generator','yeeflow-runtime-test-orchestrator'];
assert.equal(new Set(entries.map(e=>e.destination)).size,entries.length);
for(const entry of entries){
  assert.ok(!entry.source.startsWith('/')&&!entry.source.split('/').includes('..'));
  assert.ok(!entry.destination.startsWith('/')&&!entry.destination.split('/').includes('..'));
  let source=text(resolve(root,entry.source));
  const destination=text(resolve(dist,entry.destination));
  if(entry.destination.endsWith('/SKILL.md')){
    // Host guidance is appended by the canonical host-profile builder.
    source=source.split('<!-- plugin-resource-access -->')[0].trimEnd();
    if(entry.source==='skills/installed/yeeflow-custom-code-generator/SKILL.md') source=source.replaceAll('../../../docs/','../../docs/');
    assert.ok(destination.startsWith(source),entry.destination);
    assert.match(destination,/Portable access to bundled resources/);
    assert.match(destination,/## Unified Yeeflow MCP connection/);
  }else assert.equal(destination,source,entry.destination);
}
for(const name of specialists){
  for(const file of ['SKILL.md','agents/openai.yaml']) assert.ok(existsSync(resolve(dist,'skills',name,file)));
  assert.match(text(resolve(dist,'skills',name,'agents/openai.yaml')),new RegExp('\\$'+name));
}
for(const name of enhanced){
  const body=text(resolve(dist,'skills',name,'SKILL.md'));
  assert.equal(body.split('<!-- document-workflow-project-patterns:start -->').length,2,name);
  const source=text(resolve(root,'skills/installed',name,'SKILL.md'));
  const block=s=>s.match(/<!-- document-workflow-project-patterns:start -->[\s\S]*?<!-- document-workflow-project-patterns:end -->/)[0];
  assert.equal(block(body),block(source),name);
}
assert.ok(existsSync(resolve(dist,'skills/yeeflow-feature-configuration-guide/scripts/knowledge.mjs')),'preserve 1.18.1 feature guide');
assert.equal(readdirSync(resolve(dist,'skills')).filter(n=>existsSync(resolve(dist,'skills',n,'SKILL.md'))).length,31);
console.log('DOCUMENT_WORKFLOW_DISTRIBUTION_PASS: 3 specialists; 6 enhancements; explicit resource mirrors; 31 skills; feature guide retained');
