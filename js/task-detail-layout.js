(()=>{
  function placeChecklist(){
    const root=document.querySelector('#page-content');
    if(!root)return;
    const checklist=root.querySelector('.task-checklist-panel');
    const timeline=root.querySelector('.timeline-shell');
    const composer=root.querySelector('.task-composer');
    if(!checklist||!timeline||!composer)return;
    if(checklist.previousElementSibling===timeline&&checklist.nextElementSibling===composer)return;
    composer.parentNode.insertBefore(checklist,composer);
  }
  const observer=new MutationObserver(()=>placeChecklist());
  const start=()=>{
    const root=document.querySelector('#page-content');
    if(!root)return setTimeout(start,50);
    observer.observe(root,{childList:true,subtree:true});
    placeChecklist();
  };
  start();
})();