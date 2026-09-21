window.TM=window.TM||{};
TM.SharedFS=(()=>{
 const DB='tm-shared-fs',STORE='handles',KEY='workspace';
 let root=null;
 const SAFE=/^[A-Za-z0-9._ -]+$/;
 function assertName(name){if(typeof name!=='string'||!name||name==='.'||name==='..'||!SAFE.test(name)||/[. ]$/.test(name)||/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i.test(name))throw Error('Unsafe Windows filename: '+name);return name}
 function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
 async function saveHandle(h){const d=await openDB();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put(h,KEY);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})}
 async function savedHandle(){const d=await openDB();return new Promise((res,rej)=>{const r=d.transaction(STORE).objectStore(STORE).get(KEY);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}
 async function clearSavedHandle(){const d=await openDB();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).delete(KEY);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})}
 async function permission(h,request=false){if(!h)return'denied';let p=await h.queryPermission({mode:'readwrite'});if(p!=='granted'&&request)p=await h.requestPermission({mode:'readwrite'});return p}
 async function use(h,request=true){if(!h)throw Error('Workspace handle required');if(await permission(h,request)!=='granted')throw Error('Read/write permission not granted');root=h;await saveHandle(h);return h}
 function supported(){return typeof window.showDirectoryPicker==='function'}\n async function connect(){if(!supported())throw Error('SharedFS unavailable: File System Access directory picker is not exposed in this browser/context');return use(await window.showDirectoryPicker({mode:'readwrite'}),false)}
 async function restore(request=true){const h=await savedHandle();if(!h)return null;try{return await use(h,request)}catch{return null}}
 function current(){return root}
 async function dir(path,create=false){if(!root)throw Error('Shared workspace is not connected');let d=root;for(const part of path){assertName(part);d=await d.getDirectoryHandle(part,{create})}return d}
 async function ensureDirectory(path){return dir(path,true)}
 async function fileHandle(path,create=false){if(!path.length)throw Error('File path required');const name=assertName(path[path.length-1]);const d=await dir(path.slice(0,-1),create);return d.getFileHandle(name,{create})}
 async function exists(path){try{await fileHandle(path,false);return true}catch(e){if(e.name==='NotFoundError')return false;throw e}}
 async function readText(path){const h=await fileHandle(path,false),f=await h.getFile();return f.text()}
 async function readJSON(path){const text=await readText(path);try{return JSON.parse(text)}catch(e){const x=Error('Malformed JSON: '+path.join('/')+' — '+e.message);x.cause=e;throw x}}
 async function writeText(path,text,{overwrite=false,verify=true}={}){if(!overwrite&&await exists(path))throw Error('Refusing to overwrite existing file: '+path.join('/'));const h=await fileHandle(path,true),w=await h.createWritable();try{await w.write(String(text));await w.close()}catch(e){try{await w.abort()}catch{}throw e}if(verify){const got=await readText(path);if(got!==String(text))throw Error('Write verification failed: '+path.join('/'))}return h}
 async function createJSON(path,obj){return writeText(path,JSON.stringify(obj,null,2)+'\n',{overwrite:false,verify:true})}
 async function replaceJSON(path,obj){return writeText(path,JSON.stringify(obj,null,2)+'\n',{overwrite:true,verify:true})}
 async function list(path,{kind=null,suffix=null}={}){const d=await dir(path,false),out=[];for await(const [name,h]of d.entries()){if(kind&&h.kind!==kind)continue;if(suffix&&!name.endsWith(suffix))continue;out.push({name,kind:h.kind})}return out.sort((a,b)=>a.name.localeCompare(b.name))}
 async function initialize(){if(!root)throw Error('Shared workspace is not connected');const dirs=[['System'],['System','Settings'],['Identity'],['Identity','Users'],['Identity','Roles'],['Identity','Groups'],['Projects'],['Tasks'],['Presence'],['Audit'],['_Recovery'],['_Recovery','Conflicts'],['_Recovery','Corrupt'],['_Recovery','Orphaned']];for(const p of dirs)await ensureDirectory(p);
  const now=new Date().toISOString();if(!await exists(['System','workspace.json']))await createJSON(['System','workspace.json'],{workspaceId:'WS-'+crypto.randomUUID(),name:root.name,createdAt:now,format:'task-management-shared-fs'});
  if(!await exists(['System','schema.json']))await createJSON(['System','schema.json'],{schemaVersion:1,storageModel:'shared-fs-json-events',createdAt:now});
  return{workspace:await readJSON(['System','workspace.json']),schema:await readJSON(['System','schema.json'])}
 }
 async function disconnect({forget=false}={}){root=null;if(forget)await clearSavedHandle()}
 return{supported,connect,restore,disconnect,current,permission,savedHandle,clearSavedHandle,assertName,ensureDirectory,exists,readText,readJSON,createJSON,replaceJSON,list,initialize};
})();