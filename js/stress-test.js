window.TM=window.TM||{};
TM.StressTest=(()=>{
 const CONFIG={users:50,groups:5,projects:100,projectTasks:10,taskComments:10,standaloneTasks:1000,tickets:1000,personalNotes:50,personalPhones:50,personalEmails:50,leaveDays:30};
 const pad=(n,w=4)=>String(n).padStart(w,'0'),pick=(a,n)=>a[n%a.length],iso=d=>d.toISOString().slice(0,10);
 async function generate(actorId,progress=()=>{}){
  if(!actorId)throw Error('Administrator required');
  if(!await TM.Auth.can(actorId,'*'))throw Error('Administrator permission required');
  const existing=(await TM.Store.list('user')).filter(x=>!x._corrupt&&String(x.username||'').startsWith('DUMMY.LOAD.'));
  if(existing.length)throw Error('DUMMY load-test data already exists in this workspace. Use a fresh test workspace.');
  const roles=(await TM.Store.list('role')).filter(x=>!x._corrupt),employee=roles.find(x=>x.systemKey==='employee');
  if(!employee)throw Error('Employee role not found');
  const groups=[],users=[],projects=[],allTasks=[];
  progress('Creating 5 DUMMY groups…');
  for(let i=1;i<=CONFIG.groups;i++)groups.push(await TM.Store.createGroup({name:'DUMMY.GROUP.LOAD-'+pad(i,2),description:'DUMMY load-test group '+i}));
  progress('Creating 50 DUMMY users…');
  for(let i=1;i<=CONFIG.users;i++){const u=await TM.Store.createUser({username:'DUMMY.LOAD.USER.'+pad(i,3),displayName:'DUMMY Load User '+pad(i,3),enabled:true});users.push(u);await TM.Store.addMembership({userId:u.id,groupId:groups[(i-1)%groups.length].id,roleId:employee.id})}
  progress('Creating 100 projects × 10 tasks × 10 comments…');
  for(let p=1;p<=CONFIG.projects;p++){
   const g=groups[(p-1)%groups.length],owner=users[(p-1)%users.length];
   const pr=await TM.Store.createProject({name:'DUMMY.PROJECT.'+pad(p,3),description:'DUMMY load-test project '+p,ownerId:owner.id,groupId:g.id,status:pick(['Active','Active','On Hold','Completed'],p),startDate:'2026-09-01',targetDate:'2026-12-31'});projects.push(pr);
   await TM.Store.addProjectGroup({projectId:pr.id,groupId:g.id,actorId});
   for(let t=1;t<=CONFIG.projectTasks;t++){const n=(p-1)*CONFIG.projectTasks+t,assignee=users.find((u,idx)=>idx%groups.length===(p-1)%groups.length)||owner,task=await TM.Store.createTask({projectId:pr.id,responsibleGroupId:g.id,title:'DUMMY.TASK.PROJECT-'+pad(n),description:'DUMMY project task '+n,creatorId:owner.id,assigneeId:assignee.id,priority:pick(['Low','Normal','High','Critical'],n),status:pick(['Assigned','In Progress','Pending Review','Completed'],n),dueAt:'2026-10-'+pad((n%28)+1,2)});allTasks.push(task);for(let c=1;c<=CONFIG.taskComments;c++)await TM.Store.addTaskComment({taskId:task.id,authorId:users[(n+c)%users.length].id,html:'<p>DUMMY comment '+c+' for project task '+n+'</p>'});}
   if(p%10===0)progress('Projects: '+p+'/100 · task comments: '+(p*100));
  }
  progress('Creating 1,000 standalone tasks × 10 comments…');
  for(let n=1;n<=CONFIG.standaloneTasks;n++){const g=groups[(n-1)%groups.length],creator=users[(n-1)%users.length],assignee=users.find((u,idx)=>idx%groups.length===(n-1)%groups.length)||creator,task=await TM.Store.createTask({responsibleGroupId:g.id,title:'DUMMY.TASK.STANDALONE-'+pad(n),description:'DUMMY standalone load-test task '+n,creatorId:creator.id,assigneeId:assignee.id,priority:pick(['Low','Normal','High','Critical'],n),status:pick(['Assigned','In Progress','Blocked','Pending Review','Completed'],n),dueAt:'2026-11-'+pad((n%28)+1,2)});allTasks.push(task);for(let c=1;c<=CONFIG.taskComments;c++)await TM.Store.addTaskComment({taskId:task.id,authorId:users[(n+c)%users.length].id,html:'<p>DUMMY comment '+c+' for standalone task '+n+'</p>'});if(n%100===0)progress('Standalone tasks: '+n+'/1000');}
  progress('Creating 1,000 tickets…');
  for(let n=1;n<=CONFIG.tickets;n++){const g=groups[(n-1)%groups.length],requester=users[(n-1)%users.length],assignee=users.find((u,idx)=>idx%groups.length===(n-1)%groups.length)||requester;await TM.Store.createTicket({requesterId:requester.id,responsibleGroupId:g.id,title:'DUMMY.TICKET.'+pad(n),description:'DUMMY load-test ticket '+n,priority:pick(['Low','Normal','High','Critical'],n),assigneeId:assignee.id,status:pick(['Open','Assigned','In Progress','Pending Resolution','Resolved','Closed'],n)});if(n%100===0)progress('Tickets: '+n+'/1000');}
  progress('Creating 30-day leave for all 50 users…');
  for(let i=0;i<users.length;i++){const start=new Date(Date.UTC(2026,9,1+(i%20))),end=new Date(start);end.setUTCDate(end.getUTCDate()+29);await TM.Store.create('publicLeave',{ownerId:users[i].id,title:'DUMMY.LEAVE.30-DAYS.'+pad(i+1,3),startDate:iso(start),endDate:iso(end),note:'DUMMY 30-day load-test leave'})}
  progress('Creating Personal Workspace test records for the current administrator…');
  for(let i=1;i<=CONFIG.personalNotes;i++)await TM.PersonalDB.put('notes',actorId,{id:'DUMMY.LOAD.NOTE.'+pad(i,3),title:'DUMMY Note '+pad(i,3),body:'DUMMY personal workspace load-test note '+i,tags:'DUMMY,load-test'});
  for(let i=1;i<=CONFIG.personalPhones;i++)await TM.PersonalDB.put('phonebook',actorId,{id:'DUMMY.LOAD.PHONE.'+pad(i,3),name:'DUMMY Contact '+pad(i,3),organization:'DUMMY Organization',phone:'+968 90'+pad(i,6),extension:pad(i,3),notes:'DUMMY phone-book load test'});
  for(let i=1;i<=CONFIG.personalEmails;i++)await TM.PersonalDB.put('emailbook',actorId,{id:'DUMMY.LOAD.EMAIL.'+pad(i,3),name:'DUMMY Mail Contact '+pad(i,3),organization:'DUMMY Organization',email:'dummy.load.'+pad(i,3)+'@example.test',notes:'DUMMY email-book load test'});
  const summary={users:users.length,groups:groups.length,projects:projects.length,projectTasks:CONFIG.projects*CONFIG.projectTasks,standaloneTasks:CONFIG.standaloneTasks,taskComments:(CONFIG.projects*CONFIG.projectTasks+CONFIG.standaloneTasks)*CONFIG.taskComments,tickets:CONFIG.tickets,leaves:users.length,personalNotes:CONFIG.personalNotes,personalPhones:CONFIG.personalPhones,personalEmails:CONFIG.personalEmails};
  localStorage.setItem('tm-load-test-summary',JSON.stringify({...summary,generatedAt:new Date().toISOString()}));progress('Load-test environment complete.');return summary;
 }
 return{CONFIG,generate};
})();