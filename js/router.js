(()=>{
 const stage03Pages=new Set(['dashboard','projects','tasks']);
 const alwaysVisible=new Set(['dashboard','projects','tasks','tickets','calendar','messages','announcements','documents','kpi']);
 let bootstrapped=false;
 function normalizeNav(){
  document.querySelectorAll('.nav button[data-page]').forEach(b=>{
   if(alwaysVisible.has(b.dataset.page)) b.classList.remove('hidden');
  });
 }
 function route(page){
  if(!window.TM?.Stage03)return false;
  if(page==='dashboard'){TM.Stage03.dashboard();return true}
  if(page==='projects'){TM.Stage03.projectsPage();return true}
  if(page==='tasks'){TM.Stage03.tasksPage();return true}
  return false;
 }
 document.addEventListener('click',e=>{
  const b=e.target.closest('.nav button[data-page]');
  if(!b||!stage03Pages.has(b.dataset.page))return;
  e.preventDefault();e.stopImmediatePropagation();route(b.dataset.page);
 },true);
 const timer=setInterval(()=>{
  normalizeNav();
  const app=document.querySelector('#app-view');
  if(!bootstrapped&&app&&!app.classList.contains('hidden')&&window.TM?.Stage03){
   bootstrapped=true;
   route('dashboard');
  }
 },100);
 setTimeout(()=>clearInterval(timer),10000);
 window.TM=window.TM||{};
 TM.Router={route,normalizeNav};
})();
