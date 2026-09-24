window.TM=window.TM||{};
TM.Store=(()=>{
 const BASE=['Task-Management-Data'],SCHEMA=1;
 const TYPES={
  user:{prefix:'USR',path:['Identity','Users']},role:{prefix:'ROL',path:['Identity','Roles']},
  group:{prefix:'GRP',path:['Identity','Groups']},membership:{prefix:'MBR',path:['Identity','Memberships']},session:{prefix:'SES',path:['Identity','Sessions']},userEvent:{prefix:'UEV',path:['Identity','UserEvents']},membershipEvent:{prefix:'MEV',path:['Identity','MembershipEvents']},groupEvent:{prefix:'GEV',path:['Identity','GroupEvents']},
  project:{prefix:'PRJ',path:['Projects','Records']},projectEvent:{prefix:'PEV',path:['Projects','Events']},projectMember:{prefix:'PMB',path:['Projects','Members']},projectGroup:{prefix:'PGR',path:['Projects','Groups']},projectGroupEvent:{prefix:'PGE',path:['Projects','GroupEvents']},task:{prefix:'TSK',path:['Tasks','Records']},taskEvent:{prefix:'TEV',path:['Tasks','Events']},announcement:{prefix:'ANN',path:['Announcements','Records']},ticket:{prefix:'TKT',path:['Tickets','Records']},ticketEvent:{prefix:'TKE',path:['Tickets','Events']},ticketComment:{prefix:'TKC',path:['Tickets','Comments']},projectComment:{prefix:'PRC',path:['Projects','Comments']},
  event:{prefix:'EVT',path:['_Lab','Events']}
 };
 const uid=t=>TYPES[t].prefix+'-'+crypto.randomUUID(),now=()=>new Date().toISOString();
 async function init(){
  await TM.FileSystem.initializeWorkspace();
  for(const t of ['Users','Roles','Groups','Memberships','Sessions','UserEvents','MembershipEvents','GroupEvents'])await TM.FileSystem.createDirectory(BASE.concat(['Identity',t]));
  for(const t of ['Records','Events','Members','Groups','GroupEvents','Comments'])await TM.FileSystem.createDirectory(BASE.concat(['Projects',t]));
  for(const t of ['Records','Events'])await TM.FileSystem.createDirectory(BASE.concat(['Tasks',t]));
  await TM.FileSystem.createDirectory(BASE.concat(['Announcements','Records']));
  for(const t of ['Records','Events','Comments'])await TM.FileSystem.createDirectory(BASE.concat(['Tickets',t]));
  await TM.FileSystem.createDirectory(BASE.concat(['_Lab','Events']));
 }
 async function create(type,data){
  const def=TYPES[type];if(!def)throw Error('Unknown record type: '+type);
  const id=uid(type),record={schema:SCHEMA,id,type,createdAt:now(),...data};
  await TM.FileSystem.createJSON(BASE.concat(def.path),id+'.json',record);return record;
 }
 async function get(type,id){const d=TYPES[type];if(!d)throw Error('Unknown record type');return TM.FileSystem.readJSON(BASE.concat(d.path),id+'.json')}
 async function list(type){const d=TYPES[type];if(!d)throw Error('Unknown record type');const out=[];for(const x of await TM.FileSystem.list(BASE.concat(d.path))){if(x.kind!=='file'||!x.name.endsWith('.json'))continue;try{out.push(await TM.FileSystem.readJSON(BASE.concat(d.path),x.name))}catch(e){out.push({_corrupt:true,file:x.name,error:e.message})}}return out}
 async function bootstrapSystem(name='Task Management Workspace'){
  await init();const sys=BASE.concat(['System']);
  if(!await TM.FileSystem.exists(sys,'workspace.json'))await TM.FileSystem.createJSON(sys,'workspace.json',{schema:SCHEMA,id:'WORKSPACE',type:'workspace',name,createdAt:now()});
  if(!await TM.FileSystem.exists(sys,'schema.json'))await TM.FileSystem.createJSON(sys,'schema.json',{schema:SCHEMA,id:'SCHEMA',type:'schema',version:SCHEMA,createdAt:now()});
  let roles=await list('role');
  if(!roles.some(r=>r.systemKey==='administrator'))await create('role',{systemKey:'administrator',name:'Administrator',permissions:['*'],protected:true});
  if(!roles.some(r=>r.systemKey==='team_leader'))await create('role',{systemKey:'team_leader',name:'Team Leader',permissions:['tasks.view','tasks.create','tasks.delegate','tasks.edit','tasks.close','tickets.create','tickets.assign','leave.request','kpi.self','kpi.team']});
  if(!roles.some(r=>r.systemKey==='manager'))await create('role',{systemKey:'manager',name:'Manager',permissions:['users.view','groups.manage','tasks.create','tasks.delegate','tasks.edit','tasks.close','tickets.create','tickets.assign','tickets.close','leave.approve','announcements.create','kpi.self','kpi.team']});
  if(!roles.some(r=>r.systemKey==='employee'))await create('role',{systemKey:'employee',name:'Employee',permissions:['tasks.view','tasks.updateOwn','tickets.create','leave.request','kpi.self']});
  if(!roles.some(r=>r.systemKey==='auditor'))await create('role',{systemKey:'auditor',name:'Auditor',permissions:['audit.view','kpi.organization']});
  return {workspace:await TM.FileSystem.readJSON(sys,'workspace.json'),schema:await TM.FileSystem.readJSON(sys,'schema.json'),roles:await list('role')};
 }
 async function createUser({username,displayName,passwordHash=null,passwordSalt=null,passwordIterations=null,passwordAlgorithm=null,enabled=true}){if(!username||!displayName)throw Error('username and displayName required');return create('user',{username,displayName,passwordHash,passwordSalt,passwordIterations,passwordAlgorithm,enabled})}
 async function createGroup({name,description=''}){if(!name)throw Error('group name required');return create('group',{name,description,enabled:true})}
 async function addMembership({userId,groupId=null,roleId}){if(!userId||!roleId)throw Error('userId and roleId required');return create('membership',{userId,groupId,roleId,enabled:true})}
 async function createProject({name,description='',ownerId,groupId=null,status='Active',startDate=null,targetDate=null}){if(!name||!ownerId)throw Error('project name and ownerId required');return create('project',{name,description,ownerId,groupId,status,startDate,targetDate})}
 async function addProjectEvent({projectId,action,value,actorId}){if(!projectId||!action||!actorId)throw Error('projectId, action and actorId required');return create('projectEvent',{projectId,action,value,actorId})}
 async function addProjectGroup({projectId,groupId,actorId}){if(!projectId||!groupId||!actorId)throw Error('projectId, groupId and actorId required');return create('projectGroup',{projectId,groupId,actorId,enabled:true})}
 async function addProjectGroupEvent({projectGroupId,projectId,action,value,actorId}){if(!projectGroupId||!projectId||!action||!actorId)throw Error('projectGroupId, projectId, action and actorId required');return create('projectGroupEvent',{projectGroupId,projectId,action,value,actorId})}
 async function addProjectMember({projectId,userId,role='member',actorId}){if(!projectId||!userId||!actorId)throw Error('projectId, userId and actorId required');return create('projectMember',{projectId,userId,role,actorId,enabled:true})}
 async function createTask({projectId=null,responsibleGroupId,title,description='',creatorId,assigneeId=null,priority='Normal',status='Draft',dueAt=null}){if(!responsibleGroupId||!title||!creatorId)throw Error('responsibleGroupId, title and creatorId required');return create('task',{projectId,responsibleGroupId,title,description,creatorId,assigneeId,priority,status,dueAt})}
 async function addTaskEvent({taskId,action,value,actorId}){if(!taskId||!action||!actorId)throw Error('taskId, action and actorId required');return create('taskEvent',{taskId,action,value,actorId})}
 async function createTicket({requesterId,responsibleGroupId,title,description='',priority='Normal',assigneeId=null,status='Open'}){if(!requesterId||!responsibleGroupId||!title)throw Error('requesterId, responsibleGroupId and title required');return create('ticket',{requesterId,responsibleGroupId,title,description,priority,assigneeId,status})}
 async function addTicketEvent({ticketId,action,value,actorId}){if(!ticketId||!action||!actorId)throw Error('ticketId, action and actorId required');return create('ticketEvent',{ticketId,action,value,actorId})}
 async function addTicketComment({ticketId,authorId,html}){if(!ticketId||!authorId||!html)throw Error('ticketId, authorId and html required');return create('ticketComment',{ticketId,authorId,html})}
 async function addProjectComment({projectId,authorId,html}){if(!projectId||!authorId||!html)throw Error('projectId, authorId and html required');return create('projectComment',{projectId,authorId,html})}
 async function createAnnouncement({level,title,message,creatorId,groupId=null,projectId=null,remindAt=null,expiresAt=null}){if(!level||!title||!message||!creatorId)throw Error('announcement level, title, message and creatorId required');return create('announcement',{level,title,message,creatorId,groupId,projectId,remindAt,expiresAt,enabled:true})}
 async function createEvent(client,payload={}){return create('event',{client,payload})}
 async function scanEvents(){const rows=await list('event'),stats={files:rows.length,valid:0,corrupt:0,duplicateIds:0,clients:{},ids:new Set(),errors:[]};for(const r of rows){if(r._corrupt){stats.corrupt++;stats.errors.push({file:r.file,error:r.error});continue}try{if(r.schema!==SCHEMA||r.type!=='event'||typeof r.id!=='string'||typeof r.client!=='string'||!r.createdAt)throw Error('invalid record schema');if(stats.ids.has(r.id))stats.duplicateIds++;else stats.ids.add(r.id);stats.clients[r.client]=(stats.clients[r.client]||0)+1;stats.valid++}catch(e){stats.corrupt++;stats.errors.push({file:r.id||'unknown',error:e.message})}}stats.uniqueIds=stats.ids.size;delete stats.ids;return stats}
 return{SCHEMA,init,bootstrapSystem,create,get,list,createUser,createGroup,addMembership,createProject,addProjectEvent,addProjectGroup,addProjectGroupEvent,addProjectMember,createTask,addTaskEvent,createTicket,addTicketEvent,addTicketComment,addProjectComment,createAnnouncement,createEvent,scanEvents};
})();