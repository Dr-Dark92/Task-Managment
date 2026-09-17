(()=>{
 const stage03Pages=new Set(['dashboard','projects','tasks']);
 const alwaysVisible=new Set(['dashboard','projects','tasks','tickets','calendar','messages','announcements','documents','kpi']);
 let bootstrapped=false;
 function normalizeNav(){document.querySelectorAll('.nav button[data-page]').forEach(b=>{b.type='button';b.style.pointerEvents='auto';if(alwaysVisible.has(b.dataset.page))b.classList.remove('hidden')})}
 function route(page){if(!window.TM?.Stage03)return false;if(page==='dashboard'){TM.Stage03.dashboard();return true}if(page==='projects'){TM.Stage03.projectsPage();return true}if(page==='tasks'){TM.Stage03.tasksPage();return true}return false}
 function handleNav(e){const b=e.target.closest?.('.nav button[data-page]');if(!b)return;const page=b.dataset.page;if(!stage03Pages.has(page))return;e.preventDefault();e.stopPropagation();route(page)}
 document.addEventListener('click',handleNav,false);
 document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const b=e.target.closest?.('.nav button[data-page]');if(!b||!stage03Pages.has(b.dataset.page))return;e.preventDefault();route(b.dataset.page)},false);
 const observer=new MutationObserver(normalizeNav);observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
 function bootstrap(){normalizeNav();const app=document.querySelector('#app-view');if(!bootstrapped&&app&&!app.classList.contains('hidden')&&window.TM?.Stage03){bootstrapped=true;route('dashboard')}}
 const timer=setInterval(bootstrap,100);setTimeout(()=>clearInterval(timer),10000);bootstrap();
 window.TM=window.TM||{};TM.Router={route,normalizeNav};
})();
