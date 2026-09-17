(()=>{
function wire(){
 const cards=[...document.querySelectorAll('.project-grid .work-card')];
 if(!cards.length)return;
 TM.DB.getAll('projects').then(projects=>{
  cards.forEach((card,i)=>{
   const code=card.querySelector('.work-code')?.textContent?.trim();
   const project=projects.find(p=>p.code===code)||projects[i];
   if(!project)return;
   card.dataset.project=project.id;
   card.tabIndex=0;
   card.setAttribute('role','button');
   card.style.cursor='pointer';
   card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();TM.ProjectDetail?.render(project.id)}};
  });
 });
}
const observer=new MutationObserver(()=>wire());
observer.observe(document.querySelector('#page-content'),{childList:true,subtree:true});
wire();
})();