import {readFileSync, writeFileSync, readdirSync, rmSync} from 'node:fs';
import {join, relative, dirname, posix} from 'node:path';
import {createHash} from 'node:crypto';
const hash = b => createHash('sha256').update(b).digest('hex');
const walk = dir => readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
// Only identical, reviewed data mirrors. Distinct schemas, executable entrypoints,
// studies and fixtures retain their semantics and paths.
const canonicalPaths = [
 'control-configurations.normalized.json','field-configurations.normalized.json',
 'yeeflow-expression-functions.normalized.json','yeeflow-expression-operators.normalized.json',
 'yeeflow-expression-function-knowledge-base.normalized.json',
 'scripts/workflow-action-configurations.normalized.json'
];
export function consolidateClaudeResources(root) {
 const all = walk(root).sort();
 const aliases = {}, rewrites = {};
 let savedBytes=0;
 for (const canonical of canonicalPaths) {
  const bytes=readFileSync(join(root,canonical));
  for(const file of all) {
   const alias=relative(root,file).split('\\').join('/');
   if(alias===canonical || !alias.startsWith('skills/') || !alias.endsWith('/'+posix.basename(canonical))) continue;
   const candidate=readFileSync(file);
   if(hash(candidate)!==hash(bytes)) throw new Error('CLAUDE_SHARED_RESOURCE_CONTENT_DIFF: '+alias);
   aliases[alias]={canonical,sha256:hash(bytes),bytes:bytes.length};
   savedBytes+=candidate.length;
  }
 }
 for(const file of all) {
  const rel=relative(root,file).split('\\').join('/');
  if(aliases[rel] || !/\.(?:js|cjs|mjs|md)$/.test(file)) continue;
  const original=readFileSync(file,'utf8'); let body=original;
  for(const [alias,{canonical}] of Object.entries(aliases)) {
   const target=posix.relative(posix.dirname(rel),canonical);
   // Explicit plugin-root references in documentation or script literals.
   body=body.split(alias).join(canonical);
   if(/\.(?:js|cjs|mjs)$/.test(file) && posix.dirname(alias)===posix.dirname(rel)) {
    const name=posix.basename(alias).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    body=body.replace(new RegExp('(path\\.(?:join|resolve)\\(__dirname,\\s*["\'])'+name+'(["\']\\))','g'),(_,a,b)=>a+target+b);
    body=body.replace(new RegExp('(require\\(["\'])\\./'+name+'(["\']\\))','g'),(_,a,b)=>a+(target.startsWith('.')?target:'./'+target)+b);
   }
   if(rel.endsWith('.md')) {
    // Skill references may use bare names. Make the root contract explicit.
    if(rel.startsWith('skills/') && alias.startsWith(rel.split('/').slice(0,2).join('/')+'/')) {
     body=body.split('`'+posix.basename(alias)+'`').join('`<plugin-root>/'+canonical+'`');
    }
    body=body.replace(/\]\(([^)]+)\)/g,(match,link)=> {
     if(link.includes('://') || link.startsWith('#')) return match;
     const [path,anchor]=link.split('#');
     return posix.normalize(posix.join(posix.dirname(rel),path))===alias ? ']('+target+(anchor?'#'+anchor:'')+')':match;
    });
   }
  }
  if(body!==original) {
   writeFileSync(file,body);
   rewrites[rel]={beforeSha256:hash(original),afterSha256:hash(body)};
  }
 }
 for(const alias of Object.keys(aliases)) rmSync(join(root,alias));
 const report={schemaVersion:1,method:'ordinary shared files; no blobs, symlinks or materialization',aliases,rewrites,removedFiles:Object.keys(aliases).length,savedBytes};
 writeFileSync(join(root,'claude-shared-resources.json'),JSON.stringify(report,null,2)+'\n');
 return report;
}
