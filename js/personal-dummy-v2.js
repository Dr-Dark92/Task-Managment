window.TM=window.TM||{};
TM.PersonalDummy=(()=>{
 const VERSION=2;
 const seed={
  profile:[{id:'PRO-DUMMY-V2',phone:'+968 9000 0000',email:'admin.personal@example.test',address:'Muscat — synthetic test address',notes:'Synthetic browser-local profile for Personal Workspace testing.'}],
  notes:[
   {id:'NOT-DUMMY-01',title:'Weekly priorities',body:'Review open tickets, project milestones and pending actions before the team meeting.',tags:'work,weekly'},
   {id:'NOT-DUMMY-02',title:'Lab ideas',body:'Test the next dashboard changes against the dummy workspace before promoting them.',tags:'lab,testing'},
   {id:'NOT-DUMMY-03',title:'Training notes',body:'Prepare questions and reference material for the upcoming technical workshop.',tags:'training'}
  ],
  reminders:[
   {id:'REM-DUMMY-01',title:'Review overdue tasks',details:'Check the dashboard late-work KPI.',remindAt:'2026-09-27T09:00',priority:'High'},
   {id:'REM-DUMMY-02',title:'Team status review',details:'Review project and ticket status before the weekly meeting.',remindAt:'2026-09-29T08:30',priority:'Normal'},
   {id:'REM-DUMMY-03',title:'Backup personal workspace',details:'Use export when the XLSX feature becomes available.',remindAt:'2026-10-02T16:00',priority:'Low'}
  ],
  phonebook:[
   {id:'PHO-DUMMY-01',name:'SOC Duty Desk',organization:'Example Security Operations',phone:'+968 2400 1001',extension:'101',notes:'Synthetic contact.'},
   {id:'PHO-DUMMY-02',name:'Network Duty Desk',organization:'Example Network Operations',phone:'+968 2400 1002',extension:'202',notes:'Synthetic contact.'},
   {id:'PHO-DUMMY-03',name:'Systems Duty Desk',organization:'Example Systems Team',phone:'+968 2400 1003',extension:'303',notes:'Synthetic contact.'}
  ],
  emailbook:[
   {id:'EMA-DUMMY-01',name:'SOC Mailbox',organization:'Example Security Operations',email:'soc@example.test',notes:'Synthetic mailbox.'},
   {id:'EMA-DUMMY-02',name:'Network Mailbox',organization:'Example Network Operations',email:'network@example.test',notes:'Synthetic mailbox.'},
   {id:'EMA-DUMMY-03',name:'Systems Mailbox',organization:'Example Systems Team',email:'systems@example.test',notes:'Synthetic mailbox.'}
  ],
  bookmarks:[
   {id:'BOO-DUMMY-01',name:'Internal Documentation',url:'https://docs.example.test',category:'Documentation',username:'dummy-user',description:'Synthetic URL. No real credentials.'},
   {id:'BOO-DUMMY-02',name:'Security Dashboard',url:'https://security.example.test',category:'Security',username:'dummy-analyst',description:'Synthetic URL. No real credentials.'},
   {id:'BOO-DUMMY-03',name:'Training Portal',url:'https://training.example.test',category:'Training',username:'',description:'Synthetic URL.'}
  ]
 };
 async function status(userId){return localStorage.getItem('tm-personal-dummy-v2:'+userId)==='loaded'}
 async function load(userId){if(!userId)throw Error('User required');if(await status(userId))throw Error('Personal dummy data v2 is already loaded for this user in this browser');for(const [store,rows] of Object.entries(seed))for(const row of rows)await TM.PersonalDB.put(store,userId,{...row});localStorage.setItem('tm-personal-dummy-v2:'+userId,'loaded');return Object.fromEntries(Object.entries(seed).map(([k,v])=>[k,v.length]))}
 return{VERSION,status,load};
})();