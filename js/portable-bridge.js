window.TM=window.TM||{};
TM.PortableBridge=(()=>{
 const token=(location.hash.match(/(?:^|#)tm-token=([^&]+)/)||[])[1]||'';
 const headers={'Content-Type':'application/json','X-TM-Token':decodeURIComponent(token)};
 async function call(op,body={}){const r=await fetch('/__tm_bridge/'+op,{method:'POST',headers,body:JSON.stringify(body)});const x=await r.json();if(!r.ok)throw Error(x.error||('Bridge error '+r.status));return x}
 async function status(){try{const r=await fetch('/__tm_bridge/status');return r.ok?await r.json():null}catch{return null}}
 return{status,select:path=>call('select',{path}),mkdir:path=>call('mkdir',{path}),list:path=>call('list',{path}),read:path=>call('read',{path}),create:(path,text)=>call('create',{path,text})};
})();