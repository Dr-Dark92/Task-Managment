window.TM=window.TM||{};
TM.PersonalDB=(()=>{
 const DB='TM-Personal',VERSION=2,STORES=['profile','notes','reminders','calendar','phonebook','emailbook','bookmarks','notificationState'];
 let dbp=null;
 function open(){if(dbp)return dbp;dbp=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{for(const s of STORES)if(!r.result.objectStoreNames.contains(s)){const o=r.result.createObjectStore(s,{keyPath:'id'});o.createIndex('userId','userId',{unique:false})}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbp}
 const now=()=>new Date().toISOString(),uid=p=>p+'-'+crypto.randomUUID();
 async function list(store,userId){const db=await open();return new Promise((res,rej)=>{const tx=db.transaction(store,'readonly'),q=tx.objectStore(store).index('userId').getAll(userId);q.onsuccess=()=>res(q.result.sort((a,b)=>String(b.updatedAt||b.createdAt).localeCompare(String(a.updatedAt||a.createdAt))));q.onerror=()=>rej(q.error)})}
 async function get(store,id){const db=await open();return new Promise((res,rej)=>{const q=db.transaction(store,'readonly').objectStore(store).get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}
 async function put(store,userId,data){const db=await open(),record={...data,id:data.id||uid(store.slice(0,3).toUpperCase()),userId,createdAt:data.createdAt||now(),updatedAt:now()};return new Promise((res,rej)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(record);tx.oncomplete=()=>res(record);tx.onerror=()=>rej(tx.error)})}
 async function remove(store,id,userId){const old=await get(store,id);if(!old||old.userId!==userId)throw Error('Personal record not found');const db=await open();return new Promise((res,rej)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id);tx.oncomplete=()=>res(true);tx.onerror=()=>rej(tx.error)})}
 async function profile(userId){return(await list('profile',userId))[0]||null}
 async function saveProfile(userId,data){const old=await profile(userId);return put('profile',userId,{...old,...data,id:old?.id})}
 async function counts(userId){const out={};for(const s of ['notes','reminders','calendar','phonebook','emailbook','bookmarks'])out[s]=(await list(s,userId)).length;return out}
 return{STORES,list,get,put,remove,profile,saveProfile,counts};
})();