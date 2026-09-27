window.TM=window.TM||{};
TM.Actions=(()=>{
 const TYPES=['Block Internal IP','Block External IP','Block Domain / URL','Disable Account','Isolate Endpoint','Change Firewall Rule','Change Domain Policy','Other'];
 const clean=v=>String(v??'').trim();
 async function list(){return (await TM.Store.list('actionRecord')).filter(x=>!x._corrupt).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))}
 async function get(id){return TM.Store.get('actionRecord',id)}
 async function create(actorId,{actionType,target,reason,details='',impact='',evidence='',groupId=null}){actionType=clean(actionType);target=clean(target);reason=clean(reason);if(!actionType||!target||!reason)throw Error('Action, target and reason are required');return TM.Store.createActionRecord({actorId,actionType,target,reason,details:clean(details),impact:clean(impact),evidence:clean(evidence),groupId:groupId||null})}
 async function comments(id){return (await TM.Store.list('actionComment')).filter(x=>!x._corrupt&&x.actionId===id).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)))}
 async function addComment(actorId,id,html){await get(id);html=String(html||'').trim();if(!html)throw Error('Comment required');return TM.Store.addActionComment({actionId:id,authorId:actorId,html})}
 return{TYPES,list,get,create,comments,addComment};
})();