(()=>{
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function safeRich(html){
   const doc=new DOMParser().parseFromString(`<div>${html||''}</div>`,'text/html');
   const allowed=new Set(['DIV','BR','B','STRONG','I','EM','FONT','SPAN']);
   [...doc.body.querySelectorAll('*')].forEach(el=>{
     if(!allowed.has(el.tagName)){el.replaceWith(...el.childNodes);return}
     [...el.attributes].forEach(a=>{
       const ok=(el.tagName==='FONT'&&['color','size'].includes(a.name))||(el.tagName==='SPAN'&&a.name==='style'&&/^\s*(color|font-size)\s*:/i.test(a.value));
       if(!ok)el.removeAttribute(a.name);
     });
   });
   return doc.body.firstElementChild?.innerHTML||'';
 }
 async function currentTaskId(){
   const code=document.querySelector('.task-detail-head .work-code')?.textContent?.trim();
   if(!code)return null;
   const tasks=await TM.DB.getAll('tasks');
   return tasks.find(t=>t.code===code)?.id||null;
 }
 async function confirmFinish(id){
   const t=await TM.DB.get('tasks',Number(id));if(!t||t.status==='Finished')return;
   const r=$('#modal-root');
   r.innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>Finish / Close task?</h2><p class="muted">The task will be marked Finished and the closure will be recorded in its timeline.</p><div class="status-change-preview"><span class="badge">${esc(t.status||'New')}</span><strong>→</strong><span class="badge">Finished</span></div><div id="close-msg" class="hidden"></div><div class="modal-actions"><button type="button" class="secondary" id="close-cancel">Cancel</button><button type="button" id="close-confirm">Finish / Close</button></div></div></div>`;
   $('#close-cancel').onclick=()=>r.innerHTML='';
   $('#close-confirm').onclick=async e=>{const b=e.currentTarget;b.disabled=true;b.textContent='Closing…';try{await TM.Work.changeTaskStatus(id,'Finished',await TM.Auth.currentUser());r.innerHTML='';await TM.Stage03.taskDetail(id);setTimeout(enhance,0)}catch(x){b.disabled=false;b.textContent='Finish / Close';const m=$('#close-msg');m.textContent=x.message;m.className='error'}};
 }
 async function enhance(){
   const old=document.querySelector('.task-detail-head');if(!old)return;
   const id=await currentTaskId();if(!id)return;
   document.querySelector('.task-detail-head + .toolbar')?.remove();
   const form=$('#task-comment');if(!form||form.dataset.rich==='1')return;
   form.dataset.rich='1';
   const task=await TM.DB.get('tasks',id);
   const events=(await TM.DB.allByIndex('taskEvents','taskId',id)).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
   document.querySelectorAll('.timeline-event').forEach((node,i)=>{const e=events[i];if(e?.type==='COMMENT'&&e.metadata?.html){const p=node.querySelector('.timeline-box p');if(p)p.innerHTML=safeRich(e.metadata.html)}if(e?.type==='ATTACHMENT'){const p=node.querySelector('.timeline-box p');if(p)p.innerHTML=`📎 <strong>${esc(e.metadata?.name||e.text)}</strong>${e.metadata?.size?` <span class="muted">(${Math.ceil(e.metadata.size/1024)} KB)</span>`:''}`}});
   const host=document.createElement('section');host.className='task-compose';
   host.innerHTML=`<div class="editor-toolbar"><button type="button" data-editor-cmd="bold" title="Bold"><b>B</b></button><button type="button" data-editor-cmd="italic" title="Italic"><i>I</i></button><label class="editor-color">Color <input id="task-editor-color" type="color" value="#ffffff"></label><select id="task-editor-size" title="Text size"><option value="2">Small</option><option value="3" selected>Normal</option><option value="4">Large</option><option value="5">X-Large</option></select><label class="attach-button">📎 Attach file<input id="task-attachment" type="file" hidden></label><span id="task-file-name" class="muted"></span></div><form id="rich-task-comment" class="comment-box rich-comment"><div id="task-editor" class="comment-editor" contenteditable="true" data-placeholder="Add a comment…"></div><button>Comment</button></form><div class="task-close-row">${task.status==='Finished'?'<span class="badge">Task closed</span>':'<button type="button" id="finish-close" class="finish-close">Finish / Close</button>'}</div>`;
   form.replaceWith(host);
   const editor=$('#task-editor'),file=$('#task-attachment');
   document.querySelectorAll('[data-editor-cmd]').forEach(b=>b.onclick=()=>{editor.focus();document.execCommand(b.dataset.editorCmd,false,null)});
   $('#task-editor-color').oninput=e=>{editor.focus();document.execCommand('foreColor',false,e.target.value)};
   $('#task-editor-size').onchange=e=>{editor.focus();document.execCommand('fontSize',false,e.target.value)};
   file.onchange=()=>$('#task-file-name').textContent=file.files[0]?.name||'';
   $('#rich-task-comment').onsubmit=async e=>{e.preventDefault();const text=editor.innerText.trim(),attachment=file.files[0]||null;if(!text&&!attachment)return;const actor=await TM.Auth.currentUser();if(text)await TM.Work.comment(id,text,actor,{html:safeRich(editor.innerHTML)});if(attachment)await TM.Work.attach(id,attachment,actor);await TM.Stage03.taskDetail(id);setTimeout(enhance,0)};
   $('#finish-close')?.addEventListener('click',()=>confirmFinish(id));
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-task]'))setTimeout(enhance,0)},false);
 const original=()=>window.TM?.Stage03?.taskDetail;
 setTimeout(()=>{const fn=original();if(!fn)return;TM.Stage03.taskDetail=async id=>{await fn(id);await enhance()}},0);
 window.TM=window.TM||{};TM.TaskCompose={enhance};
})();
