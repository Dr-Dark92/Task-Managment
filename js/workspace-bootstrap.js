window.TM=window.TM||{};
TM.WorkspaceBootstrap=(()=>{
 let selected=false;
 function status(text,kind='muted'){const el=document.getElementById('setup-workspace-status');if(el){el.textContent=text;el.className=kind}}
 async function select(){
  if(!TM.SharedFS?.supported?.()){status('Shared workspace selection is unavailable in this browser. Local development can continue; shared mode is not enabled.','muted');return false}
  try{const h=await TM.SharedFS.connect();selected=!!h;status('Selected: '+h.name+' — read/write permission granted. Workspace will be initialized after administrator creation.','success');return true}
  catch(e){selected=false;status('Workspace selection failed: '+e.message,'error');return false}
 }
 async function finalize(){
  if(!selected||!TM.SharedFS?.current?.())return null;
  const x=await TM.SharedFS.initialize();
  localStorage.setItem('tm.workspace.mode','shared-fs');
  localStorage.setItem('tm.workspace.name',TM.SharedFS.current().name);
  localStorage.setItem('tm.workspace.id',x.workspace.workspaceId);
  return x;
 }
 function bind(){const b=document.getElementById('setup-workspace');if(!b)return;b.onclick=select;if(!TM.SharedFS?.supported?.()){b.disabled=true;status('Shared workspace selection is not supported by this browser. You can continue local development here; shared mode requires a supported production browser.','muted')}}
 return{bind,select,finalize,isSelected:()=>selected};
})();