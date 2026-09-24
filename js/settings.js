window.TM=window.TM||{};
TM.Settings=(()=>{
 const PATH=['Task-Management-Data','System'],FILE='settings.json',defaults={systemName:'Task Management',accentColor:'#2563eb',sidebarColor:'#111827',pageColor:'#0b1120'};
 async function get(){try{return{...defaults,...await TM.FileSystem.readJSON(PATH,FILE)}}catch{return{...defaults}}}
 async function save(actorId,value){if(!await TM.Auth.can(actorId,'*'))throw Error('Administrator permission required');const next={schema:1,id:'SETTINGS',type:'settings',updatedAt:new Date().toISOString(),updatedBy:actorId,systemName:String(value.systemName||defaults.systemName).trim()||defaults.systemName,accentColor:value.accentColor||defaults.accentColor,sidebarColor:value.sidebarColor||defaults.sidebarColor,pageColor:value.pageColor||defaults.pageColor};if(await TM.FileSystem.exists(PATH,FILE))await TM.FileSystem.remove(PATH,FILE);await TM.FileSystem.createJSON(PATH,FILE,next);return next}
 function apply(s){s={...defaults,...s};const root=document.documentElement;root.style.setProperty('--tm-accent',s.accentColor);root.style.setProperty('--tm-sidebar',s.sidebarColor);root.style.setProperty('--tm-page',s.pageColor);document.querySelectorAll('[data-system-name]').forEach(x=>x.textContent=s.systemName);document.title=s.systemName}
 async function loadAndApply(){const s=await get();apply(s);return s}
 return{defaults,get,save,apply,loadAndApply};
})();
