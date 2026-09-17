(()=>{
window.TM=window.TM||{};
const ALLOWED=new Set(['personalNotes','personalReminders','personalCalendar','personalContacts','personalBookmarks']);
async function owner(){const u=await TM.Auth.currentUser();if(!u||u.enabled===false)throw Error('Authenticated user required.');return Number(u.id)}
function store(name){if(!ALLOWED.has(name))throw Error('Invalid personal workspace store.');return name}
async function list(name){name=store(name);const uid=await owner();return TM.DB.allByIndex(name,'ownerUserId',uid)}
async function get(name,id){name=store(name);const uid=await owner(),row=await TM.DB.get(name,Number(id));if(!row)return null;if(Number(row.ownerUserId)!==uid)throw Error('Access denied to another user workspace.');return row}
async function add(name,data){name=store(name);const uid=await owner(),stamp=new Date().toISOString(),row={...data};delete row.id;delete row.ownerUserId;row.ownerUserId=uid;row.createdAt=row.createdAt||stamp;row.updatedAt=stamp;return TM.DB.add(name,row)}
async function update(name,id,changes){name=store(name);const row=await get(name,id);if(!row)throw Error('Personal workspace item not found.');const safe={...changes};delete safe.id;delete safe.ownerUserId;Object.assign(row,safe,{updatedAt:new Date().toISOString()});return TM.DB.put(name,row)}
async function remove(name,id){name=store(name);await get(name,id);return TM.DB.remove(name,Number(id))}
async function count(name){return (await list(name)).length}
TM.PersonalStore={list,get,add,update,remove,count};
})();