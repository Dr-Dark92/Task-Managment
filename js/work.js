window.TM=window.TM||{};
TM.Work=(()=>{
  const now=()=>new Date().toISOString();
  const clean=v=>String(v??'').trim();
  async function nextCode(store,prefix){const rows=await TM.DB.getAll(store);let max=0;for(const r of rows){const m=String(r.code||'').match(new RegExp('^'+prefix+'-(\\d+)$'));if(m)max=Math.max(max,Number(m[1]))}return `${prefix}-${String(max+1).padStart(6,'0')}`}
  function taskBucket(t,at=Date.now()){
    if(t.status==='Finished')return'Finished';
    if(t.expectedFinish&&new Date(t.expectedFinish).getTime()<at)return'Late';
    return t.status==='In Progress'?'In Progress':'New';
  }
  function isLate(t,at=Date.now()){return taskBucket(t,at)==='Late'}
  async function addTaskEvent(taskId,actorUserId,type,text='',metadata={}){return TM.DB.add('taskEvents',{taskId:Number(taskId),actorUserId:Number(actorUserId)||null,type,text:clean(text),metadata,createdAt:now()})}
  async function addProjectEvent(projectId,actorUserId,type,text='',metadata={}){return TM.DB.add('projectEvents',{projectId:Number(projectId),actorUserId:Number(actorUserId)||null,type,text:clean(text),metadata,createdAt:now()})}
  async function createProject(data,actor){
    if(!clean(data.name))throw Error('Project name is required.');
    const code=await nextCode('projects','PRJ'),createdAt=now();
    const id=await TM.DB.add('projects',{code,name:clean(data.name),description:clean(data.description),groupId:Number(data.groupId)||null,ownerUserId:Number(data.ownerUserId)||Number(actor?.id)||null,status:'Active',expectedFinish:data.expectedFinish||'',createdAt,createdBy:Number(actor?.id)||null,updatedAt:createdAt});
    await addProjectEvent(id,actor?.id,'PROJECT_CREATED',`Project ${code} created.`);await TM.DB.audit('PROJECT_CREATED','project',id,{code});return id;
  }
  async function createTask(data,actor){
    if(!clean(data.title))throw Error('Task title is required.');
    if(!data.expectedFinish)throw Error('Expected finish is required.');
    const due=new Date(data.expectedFinish);if(Number.isNaN(due.getTime()))throw Error('Expected finish is invalid.');
    const code=await nextCode('tasks','TASK'),createdAt=now();
    const task={code,title:clean(data.title),description:clean(data.description),groupId:Number(data.groupId)||null,projectId:Number(data.projectId)||null,assigneeUserId:Number(data.assigneeUserId)||null,priority:data.priority||'Normal',status:'New',expectedFinish:due.toISOString(),createdAt,createdBy:Number(actor?.id)||null,updatedAt:createdAt,finishedAt:null};
    const id=await TM.DB.add('tasks',task);await addTaskEvent(id,actor?.id,'TASK_CREATED',`Task ${code} created.`,{expectedFinish:task.expectedFinish});
    if(task.assigneeUserId)await addTaskEvent(id,actor?.id,'ASSIGNED','Task assigned.',{assigneeUserId:task.assigneeUserId});
    await TM.DB.audit('TASK_CREATED','task',id,{code,groupId:task.groupId,projectId:task.projectId});return id;
  }
  async function changeTaskStatus(taskId,status,actor){
    if(!['New','In Progress','Finished'].includes(status))throw Error('Invalid task status.');const t=await TM.DB.get('tasks',Number(taskId));if(!t)throw Error('Task not found.');const from=t.status;t.status=status;t.updatedAt=now();t.finishedAt=status==='Finished'?now():null;await TM.DB.put('tasks',t);await addTaskEvent(t.id,actor?.id,'STATUS_CHANGED',`${from} → ${status}`,{from,to:status});await TM.DB.audit('TASK_STATUS_CHANGED','task',t.id,{from,to:status});return t;
  }
  async function comment(taskId,text,actor){if(!clean(text))throw Error('Comment cannot be empty.');return addTaskEvent(taskId,actor?.id,'COMMENT',text)}
  async function dashboard(){const tasks=await TM.DB.getAll('tasks'),groups=await TM.DB.getAll('groups');const total={New:0,'In Progress':0,Late:0,Finished:0};for(const t of tasks)total[taskBucket(t)]++;const teams=groups.map(g=>{const own=tasks.filter(t=>t.groupId===g.id),late=own.filter(isLate).length,finished=own.filter(t=>t.status==='Finished').length,open=own.filter(t=>t.status!=='Finished'&&!isLate(t)).length;return{groupId:g.id,name:g.name,open,finished,late,total:own.length}});return{total,teams,count:tasks.length}}
  return{createProject,createTask,changeTaskStatus,comment,addTaskEvent,addProjectEvent,taskBucket,isLate,dashboard};
})();
