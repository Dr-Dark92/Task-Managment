(()=>{
const nav=document.querySelector('.nav');if(nav)nav.addEventListener('click',e=>{const b=e.target.closest('[data-page="announcements"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('.nav button[data-page]').forEach(x=>x.classList.toggle('active',x===b));TM.Announcements.page()},true);
const content=document.querySelector('#page-content');if(content)new MutationObserver(()=>TM.Announcements?.refreshMarquee()).observe(content,{childList:true,subtree:false});
setTimeout(()=>TM.Announcements?.refreshMarquee(),500);
})();