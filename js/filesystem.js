window.TM=window.TM||{};
TM.FileSystem=(()=>{
 const DB='tm-filesystem',STORE='handles',KEY='workspace';let root=null;
 const valid=s=>typeof s==='string'&&s.length>0&&!/[\\/:*?"<>|]/.test(s)&&s!=='.'&&s!=='..';
 function idb(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
 async function save(h){const d=await idb();return new Promise((ok,no)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put(h,KEY);t.oncomplete=()=>{d.close();ok()};t.onerror=()=>no(t.error)})}
 async function load(){const d=await idb();return new Promise((ok,no)=>{const t=d.transaction(STORE),r=t.objectStore(STORE).get(KEY);r.onsuccess=()=>{d.close();ok(r.result||null)};r.onerror=()=>no(r.error)})}
 async function permission(h=root){if(!h)return 'missing';return h.queryPermission({mode:'readwrite'})}
 async function ensurePermission(h=root){if(!h)throw Error('No workspace selected');let p=await permission(h);if(p!=='granted')p=await h.requestPermission({mode:'readwrite'});if(p!=='granted')throw Error('Workspace read/write permission not granted');return p}
 async function selectWorkspace(){if(typeof showDirectoryPicker!=='function')throw Error('File System Access API unavailable');const h=await showDirectoryPicker({mode:'readwrite',id:'task-management-workspace'});await ensurePermission(h);root=h;await save(h);return h}
 async function restoreWorkspace(){const h=await load();if(!h)return null;root=h;return h}
 async function walk(parts=[],create=false){if(!root)throw Error('No workspace selected');let d=root;for(const n of parts){if(!valid(n))throw Error('Invalid path component: '+n);d=await d.getDirectoryHandle(n,{create})}return d}
 async function createDirectory(parts){return walk(parts,true)}
 async function createJSON(dirParts,name,obj){if(!valid(name)||!name.endsWith('.json'))throw Error('Invalid JSON filename');const d=await walk(dirParts,true);for await(const k of d.keys())if(k===name)throw Error('Immutable record already exists: '+name);const h=await d.getFileHandle(name,{create:true});const w=await h.createWritable();try{await w.write(JSON.stringify(obj,null,2));await w.close()}catch(e){try{await w.abort()}catch{};throw e}return name}
 async function readJSON(dirParts,name){const d=await walk(dirParts);const h=await d.getFileHandle(name);return JSON.parse(await (await h.getFile()).text())}
 async function list(dirParts=[]){const d=await walk(dirParts),a=[];for await(const [name,h] of d.entries())a.push({name,kind:h.kind});return a.sort((a,b)=>a.name.localeCompare(b.name))}
 async function exists(dirParts,name){try{const d=await walk(dirParts);for await(const k of d.keys())if(k===name)return true;return false}catch{return false}}
 async function remove(dirParts,name,recursive=false){if(!valid(name))throw Error('Invalid name');const d=await walk(dirParts);await d.removeEntry(name,{recursive})}
 async function initializeWorkspace(){await ensurePermission();const base=['Task-Management-Data'];for(const p of [['System'],['Identity'],['Projects'],['Tasks'],['Presence'],['Audit'],['_Recovery','Conflicts'],['_Recovery','Corrupt'],['_Recovery','Orphaned']])await walk(base.concat(p),true);return base[0]}
 return{supported:()=>typeof showDirectoryPicker==='function',current:()=>root,selectWorkspace,restoreWorkspace,permission,ensurePermission,createDirectory,createJSON,readJSON,list,exists,remove,initializeWorkspace};
})();