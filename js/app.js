window.TM = window.TM || {};
TM.App = (() => {
  const $=s=>document.querySelector(s);
  const view=id=>document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('hidden',x.id!==id));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function init(){
    await TM.DB.open();
    applySettings();
    if(await TM.DB.count('users')===0){view('setup-view');bindSetup();return;}
    const user=await TM.Auth.currentUser();
    if(!user){view('login-view');bindLogin();return;}
    await showApp(user);
  }
  function message(el,text,type='error'){el.textContent=text;el.className=type;el.classList.remove('hidden');}
  function bindSetup(){
    $('#setup-form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),m=$('#setup-message');m.classList.add('hidden');try{await TM.Auth.createFirstAdmin({username:f.get('username'),displayName:f.get('displayName')||'',email:f.get('email')||'',password:f.get('password'),confirmPassword:f.get('confirmPassword')});message(m,'Administrator created. Sign in to continue.','success');setTimeout(()=>{view('login-view');bindLogin();},500);}catch(err){message(m,err.message);}};
  }
  function bindLogin(){
    $('#login-form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),m=$('#login-message');m.classList.add('hidden');if(await TM.Auth.login(f.get('username'),f.get('password'))){await showApp(await TM.Auth.currentUser());}else message(m,'Invalid username or password.');};
  }
  async function showApp(user){
    view('app-view');$('#current-user').textContent=user.displayName||user.username;$('#logout').onclick=TM.Auth.logout;
    document.querySelectorAll('.nav button[data-page]').forEach(b=>b.onclick=()=>openPage(b.dataset.page));
    openPage('dashboard');
  }
  async function openPage(page){
    document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
    const area=$('#page-content');
    if(page==='dashboard'){const users=await TM.DB.count('users'),groups=await TM.DB.count('groups');area.innerHTML=`<h1>Dashboard</h1><p class="muted">Local standalone workspace</p><div class="cards"><div class="card">Users<div class="metric">${users}</div></div><div class="card">Groups<div class="metric">${groups}</div></div><div class="card">Open tasks<div class="metric">0</div></div><div class="card">Open tickets<div class="metric">0</div></div></div>`;return;}
    if(page==='users'){await usersPage();return;}
    if(page==='settings'){await settingsPage();return;}
    area.innerHTML=`<h1>${esc(page[0].toUpperCase()+page.slice(1))}</h1><div class="card"><p class="muted">Module reserved for the next development stage.</p></div>`;
  }
  async function usersPage(){
    const users=await TM.DB.getAll('users');$('#page-content').innerHTML=`<div class="toolbar"><button id="add-user">+ Add user</button><button class="secondary" disabled>Import XLSX — next patch</button></div><div class="table-wrap"><table><thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Status</th></tr></thead><tbody>${users.map(u=>`<tr><td>${esc(u.username)}</td><td>${esc(u.displayName||'—')}</td><td>${u.systemAdmin?'System Administrator':'User'}</td><td><span class="badge">${u.enabled?'Enabled':'Disabled'}</span></td></tr>`).join('')}</tbody></table></div>`;
    $('#add-user').onclick=()=>alert('User creation is the next foundation patch; first-admin bootstrap is active now.');
  }
  async function settingsPage(){
    $('#page-content').innerHTML=`<h1>Appearance</h1><div class="card"><div class="form-grid"><label>Application name<input id="set-name" value="${esc(localStorage.getItem('tm.appName')||'Task Management')}"></label><label>Primary color<input id="set-primary" type="color" value="${esc(localStorage.getItem('tm.primary')||'#2563eb')}"></label><button id="save-settings">Save appearance</button></div></div>`;
    $('#save-settings').onclick=()=>{localStorage.setItem('tm.appName',$('#set-name').value.trim()||'Task Management');localStorage.setItem('tm.primary',$('#set-primary').value);applySettings();};
  }
  function applySettings(){const name=localStorage.getItem('tm.appName')||'Task Management',primary=localStorage.getItem('tm.primary')||'#2563eb';document.documentElement.style.setProperty('--primary',primary);document.querySelectorAll('[data-app-name]').forEach(x=>x.textContent=name);document.title=name;}
  return {init};
})();
document.addEventListener('DOMContentLoaded',()=>TM.App.init().catch(err=>{console.error(err);document.body.innerHTML='<pre style="padding:24px;color:#fecaca">Startup error: '+err.message+'</pre>';}));
