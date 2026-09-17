(()=>{
 function openWorkspace(){TM.PersonalWorkspace.render()}
 const nav=document.querySelector('.nav');
 if(nav)nav.addEventListener('click',e=>{const b=e.target.closest('[data-page="my-workspace"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openWorkspace()},true);
 const profile=document.querySelector('#profile-button');
 if(profile){
  profile.onclick=null;
  profile.addEventListener('click',e=>{
   e.preventDefault();e.stopImmediatePropagation();
   let menu=document.querySelector('#profile-quick-menu');
   if(menu){menu.remove();return}
   menu=document.createElement('div');menu.id='profile-quick-menu';menu.className='profile-quick-menu';
   menu.innerHTML='<button type="button" data-profile-action="workspace">🔒 <span><strong>My Workspace</strong><small>Private notes, reminders and personal tools</small></span></button><button type="button" data-profile-action="profile">👤 <span><strong>My Profile</strong><small>Account details and password</small></span></button>';
   document.body.appendChild(menu);
   const r=profile.getBoundingClientRect();menu.style.top=`${r.bottom+8}px`;menu.style.right=`${Math.max(12,innerWidth-r.right)}px`;
   menu.querySelector('[data-profile-action="workspace"]').onclick=()=>{menu.remove();openWorkspace()};
   menu.querySelector('[data-profile-action="profile"]').onclick=()=>{menu.remove();if(TM.Profile?.open)TM.Profile.open();else if(TM.Profile?.render)TM.Profile.render()};
   setTimeout(()=>document.addEventListener('click',function close(x){if(!menu.contains(x.target)&&x.target!==profile&&!profile.contains(x.target)){menu.remove();document.removeEventListener('click',close)}},true),0);
  },true)
 }
})();