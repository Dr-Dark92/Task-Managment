window.TM=window.TM||{};
TM.SharedDB=(()=>{
 const cfg=()=>window.TM_CONFIG||{}, base=()=>String(cfg().sharedApi||'').replace(/\/$/,'');
 async function request(path,options={}){
   const url=base()+path;if(!base())throw Error('Shared database URL is not configured.');
   const r=await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
   if(!r.ok){let m='Shared database request failed ('+r.status+')';try{const j=await r.json();if(j.error)m=j.error}catch{}throw Error(m)}
   if(r.status===204)return undefined;return r.json()
 }
 const enc=s=>encodeURIComponent(s);
 async function open(){return request('/api/health')}
 async function getAll(n){return request('/api/store/'+enc(n))}
 async function get(n,k){return request('/api/store/'+enc(n)+'/'+enc(k))}
 async function put(n,v){return request('/api/store/'+enc(n),{method:'PUT',body:JSON.stringify(v)})}
 async function add(n,v){return request('/api/store/'+enc(n),{method:'POST',body:JSON.stringify(v)})}
 async function remove(n,k){return request('/api/store/'+enc(n)+'/'+enc(k),{method:'DELETE'})}
 async function byIndex(n,i,k){const rows=await allByIndex(n,i,k);return rows[0]}
 async function allByIndex(n,i,k){return request('/api/store/'+enc(n)+'?index='+enc(i)+'&value='+enc(JSON.stringify(k)))}
 async function count(n){const x=await request('/api/store/'+enc(n)+'/count');return x.count}
 async function clearStores(names){return request('/api/admin/clear',{method:'POST',body:JSON.stringify({stores:names})})}
 async function audit(action,objectType='',objectId='',metadata={}){return add('audit',{timestamp:new Date().toISOString(),action,objectType,objectId:String(objectId||''),metadata})}
 return{open,getAll,get,put,add,remove,byIndex,allByIndex,count,clearStores,audit};
})();
