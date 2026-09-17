window.TM=window.TM||{};
TM.DB=(()=>{
  const NAME='task-management-v2', LEGACY='task-management', VERSION=1;
  let db, opening;
  const reqp=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});

  function createSchema(d){
    let s=d.createObjectStore('users',{keyPath:'id',autoIncrement:true});s.createIndex('username','username',{unique:true});s.createIndex('enabled','enabled');
    s=d.createObjectStore('groups',{keyPath:'id',autoIncrement:true});s.createIndex('name','name',{unique:true});
    d.createObjectStore('settings',{keyPath:'key'});
    s=d.createObjectStore('audit',{keyPath:'id',autoIncrement:true});s.createIndex('timestamp','timestamp');
    d.createObjectStore('sessions',{keyPath:'key'});
    s=d.createObjectStore('roles',{keyPath:'id',autoIncrement:true});s.createIndex('name','name',{unique:true});
    s=d.createObjectStore('memberships',{keyPath:'id',autoIncrement:true});s.createIndex('userId','userId');s.createIndex('groupId','groupId');
    d.createObjectStore('meta',{keyPath:'key'});
  }

  function openNew(){return new Promise((resolve,reject)=>{const r=indexedDB.open(NAME,VERSION);r.onupgradeneeded=()=>createSchema(r.result);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('New local database creation was blocked. Close other Task Management tabs and reload.'))})}

  function openLegacy(){return new Promise(resolve=>{let settled=false;const r=indexedDB.open(LEGACY);r.onsuccess=()=>{settled=true;resolve(r.result)};r.onerror=()=>{settled=true;resolve(null)};r.onupgradeneeded=()=>{try{r.transaction.abort()}catch{} };setTimeout(()=>{if(!settled)resolve(null)},1200)})}

  async function copyStore(oldDb,newDb,name){if(!oldDb.objectStoreNames.contains(name))return;const rows=await new Promise((res,rej)=>{const r=oldDb.transaction(name,'readonly').objectStore(name).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});if(!rows.length)return;await new Promise((res,rej)=>{const tx=newDb.transaction(name,'readwrite'),s=tx.objectStore(name);for(const row of rows)s.put(row);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||new Error('Migration transaction aborted'))})}

  async function migrateLegacy(newDb){const marker=await new Promise((res,rej)=>{const r=newDb.transaction('meta','readonly').objectStore('meta').get('legacyMigrated');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});if(marker)return;
    const oldDb=await openLegacy();
    if(oldDb){try{for(const n of ['users','groups','settings','audit','sessions'])await copyStore(oldDb,newDb,n)}finally{oldDb.close()}}
    await new Promise((res,rej)=>{const tx=newDb.transaction('meta','readwrite');tx.objectStore('meta').put({key:'legacyMigrated',at:new Date().toISOString()});tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)});
  }

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
