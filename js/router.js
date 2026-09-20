(()=>{
 const stage03Pages=new Set(['dashboard','projects','tasks','dummy-data']);
 const alwaysVisible=new Set(['dashboard','my-workspace','projects','tasks','tickets','calendar','messages','announcements','documents','users','groups','roles','kpi','settings','dummy-data']);
 let bootstrapped=false,lastAppVisible=false;
 function appVisible(){const app=document.querySelector('#app-view');return !!app&&!app.classList.contains('hidden')}
 function normalizeNav(){document.querySelectorAll('.nav button[data-page]').forEach(b=>{if(b.type!=='button')b.type='button';if(alwaysVisible.has(b.dataset.page)&&b.classList.contains('hidden'))b.classList.remove('hidden')})}
 function route(page){normalizeNav();if(page==='dummy-data'&&window.TM?.DummyData){TM.DummyData.page();return true}if(!window.TM?.Stage03)return false;if(page==='dashboard'){TM.Stage03.dashboard();return true}if(page==='projects'){TM.Stage03.projectsPage();return true}if(page==='tasks'){TM.Stage03.tasksPage();return true}return false}
 function handleNav(e){const b=e.target.closest?.('.nav button[data-page]');if(!b)return;const page=b.dataset.page;if(!stage03Pages.has(page))return;e.preventDefault();e.stopImmediatePropagation();route(page)}
 document.addEventListener('click',handleNav,true);
 document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const b=e.target.closest?.('.nav button[data-page]');if(!b||!stage03Pages.has(b.dataset.page))return;e.preventDefault();e.stopImmediatePropagation();route(b.dataset.page)},true);
 function bootstrap(){
   const visible=appVisible();
   if(visible)normalizeNav();
   if(visible&&!lastAppVisible&&window.TM?.Stage03){bootstrapped=true;route('dashboard')}
   else if(visible&&!bootstrapped&&window.TM?.Stage03){bootstrapped=true;route('dashboard')}
   lastAppVisible=visible;
 }
 const timer=setInterval(bootstrap,100);
 setTimeout(()=>clearInterval(timer),15000);
 window.addEventListener('focus',()=>{if(appVisible())normalizeNav();});
 bootstrap();
 window.TM=window.TM||{};TM.Router={route,normalizeNav};
})();