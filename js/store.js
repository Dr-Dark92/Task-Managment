window.TM=window.TM||{};
TM.Store=(()=>{
 const BASE=['Task-Management-Data'];
 const prefixes={event:'EVT',entity:'ENT',comment:'CMT'};
 const uid=p=>(prefixes[p]||p.toUpperCase())+'-'+crypto.randomUUID();
 async function init(){await TM.FileSystem.initializeWorkspace();await TM.FileSystem.createDirectory(BASE.concat(['_Lab','Events']))}
 async function createEvent(client,payload={}){const id=uid('event'),record={schema:1,id,type:'event',client,createdAt:new Date().toISOString(),payload};await TM.FileSystem.createJSON(BASE.concat(['_Lab','Events']),id+'.json',record);return record}
 async function scanEvents(){const path=BASE.concat(['_Lab','Events']),items=await TM.FileSystem.list(path),stats={files:0,valid:0,corrupt:0,duplicateIds:0,clients:{},ids:new Set(),errors:[]};for(const x of items){if(x.kind!=='file'||!x.name.endsWith('.json'))continue;stats.files++;try{const r=await TM.FileSystem.readJSON(path,x.name);if(!r||r.schema!==1||r.type!=='event'||typeof r.id!=='string'||typeof r.client!=='string'||!r.createdAt)throw Error('invalid record schema');if(stats.ids.has(r.id))stats.duplicateIds++;else stats.ids.add(r.id);stats.clients[r.client]=(stats.clients[r.client]||0)+1;stats.valid++}catch(e){stats.corrupt++;stats.errors.push({file:x.name,error:e.message})}}stats.uniqueIds=stats.ids.size;delete stats.ids;return stats}
 return{init,createEvent,scanEvents};
})();