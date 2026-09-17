window.TM=window.TM||{};
TM.DB=(()=>{
  const NAME='task-management-v2', LEGACY='task-management', VERSION=2;
  let db, opening;
  const reqp=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});

  function ensureStore(d,name,options,indexes=[]){
    let s;
    if(!d.objectStoreNames.contains(name)) s=d.createObjectStore(name,options);
    else return;
    for(const [idx,key,opt] of indexes)s.createIndex(idx,key,opt||{});
  }

  function upgradeSchema(d){
    ensureStore(d,'users',{keyPath:'id',autoIncrement:true},[['username','username',{unique:true}],['enabled','enabled']]);
    ensureStore(d,'groups',{keyPath:'id',autoIncrement:true},[['name','name',{unique:true}]]);
    ensureStore(d,'settings',{keyPath:'key'});
    ensureStore(d,'audit',{keyPath:'id',autoIncrement:true},[['timestamp','timestamp']]);
    ensureStore(d,'sessions',{keyPath:'key'});
    ensureStore(d,'roles',{keyPath:'id',autoIncrement:true},[['name','name',{unique:true}]]);
    ensureStore(d,'memberships',{keyPath:'id',autoIncrement:true},[['userId','userId'],['groupId','groupId']]);
    ensureStore(d,'meta',{keyPath:'key'});
    ensureStore(d,'projects',{keyPath:'id',autoIncrement:true},[['code','code',{unique:true}],['groupId','groupId'],['status','status'],['ownerUserId','ownerUserId']]);
    ensureStore(d,'tasks',{keyPath:'id',autoIncrement:true},[['code','code',{unique:true}],['groupId','groupId'],['projectId','projectId'],['assigneeUserId','assigneeUserId'],['status','status'],['expectedFinish','expectedFinish']]);
    ensureStore(d,'taskEvents',{keyPath:'id',autoIncrement:true},[['taskId','taskId'],['createdAt','createdAt'],['actorUserId','actorUserId']]);
    ensureStore(d,'projectEvents',{keyPath:'id',autoIncrement:true},[['projectId','projectId'],['createdAt','createdAt'],['actorUserId','actorUserId']]);
  }

  function openNew(){return new Promise((resolve,reject)=>{const r=indexedDB.open(NAME,VERSION);r.onupgradeneeded=()=>upgradeSchema(r.result);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Local database upgrade was blocked. Close other Task Management tabs and reload.'))})}
  function openLegacy(){return new Promise(resolve=>{let settled=false;const r=indexedDB.open(LEGACY);r.onsuccess=()=>{settled=true;resolve(r.result)};r.onerror=()=>{settled=true;resolve(null)};r.onupgradeneeded=()=>{try{r.transaction.abort()}catch{} };setTimeout(()=>{if(!settled)resolve(null)},1200)})}
  async function copyStore(oldDb,newDb,name){if(!oldDb.objectStoreNames.contains(name)||!newDb.objectStoreNames.contains(name))return;const rows=await new Promise((res,rej)=>{const r=oldDb.transaction(name,'readonly').objectStore(name).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});if(!rows.length)return;await new Promise((res,rej)=>{const tx=newDb.transaction(name,'readwrite'),s=tx.objectStore(name);for(const row of rows)s.put(row);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||new Error('Migration transaction aborted'))})}
  async function migrateLegacy(newDb){const marker=await new Promise((res,rej)=>{const r=newDb.transaction('meta','readonly').objectStore('meta').get('legacyMigrated');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});if(marker)return;const oldDb=await openLegacy();if(oldDb){try{for(const n of ['users','groups','settings','audit','sessions'])await copyStore(oldDb,newDb,n)}finally{oldDb.close()}}await new Promise((res,rej)=>{const tx=newDb.transaction('meta','readwrite');tx.objectStore('meta').put({key:'legacyMigrated',at:new Date().toISOString()});tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
  async function open(){if(db)return db;if(opening)return opening;opening=(async()=>{const d=await openNew();await migrateLegacy(d);db=d;db.onversionchange=()=>{db.close();db=null;opening=null};return db})();try{return await opening}catch(e){opening=null;throw e}}
  async function store(n,m='readonly'){const d=await open();return d.transaction(n,m).objectStore(n)}
  async function getAll(n){return reqp((await store(n)).getAll())}
  async function get(n,k){return reqp((await store(n)).get(k))}
  async function put(n,v){return reqp((await store(n,'readwrite')).put(v))}
  async function add(n,v){return reqp((await store(n,'readwrite')).add(v))}
  async function remove(n,k){return reqp((await store(n,'readwrite')).delete(k))}
  async function byIndex(n,i,k){return reqp((await store(n)).index(i).get(k))}
  async function allByIndex(n,i,k){return reqp((await store(n)).index(i).getAll(k))}
  async function count(n){return reqp((await store(n)).count())}
  async function audit(action,objectType='',objectId='',metadata={}){return add('audit',{timestamp:new Date().toISOString(),action,objectType,objectId:String(objectId||''),metadata})}
  return{open,getAll,get,put,add,remove,byIndex,allByIndex,count,audit};
})();
