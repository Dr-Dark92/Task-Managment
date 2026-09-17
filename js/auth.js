window.TM = window.TM || {};
TM.Auth = (() => {
  const enc = new TextEncoder();
  const hex = b => [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const unhex = h => new Uint8Array(h.match(/.{1,2}/g).map(x=>parseInt(x,16)));
  const randomHex = n => { const b=new Uint8Array(n); crypto.getRandomValues(b); return [...b].map(x=>x.toString(16).padStart(2,'0')).join(''); };

  async function derive(password, saltHex, iterations=210000) {
    const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(saltHex),iterations,hash:'SHA-256'}, key, 256);
    return hex(bits);
  }
  async function makePassword(password) {
    const salt=randomHex(16), iterations=210000;
    return {salt, iterations, hash:await derive(password,salt,iterations)};
  }
  async function verify(password, user) {
    return (await derive(password,user.passwordSalt,user.passwordIterations)) === user.passwordHash;
  }
  async function createFirstAdmin(data) {
    if (await TM.DB.count('users')) throw new Error('System is already initialized.');
    if (data.password.length < 12) throw new Error('Password must be at least 12 characters.');
    if (data.password !== data.confirmPassword) throw new Error('Passwords do not match.');
    const p=await makePassword(data.password);
    const id=await TM.DB.add('users',{username:data.username.trim().toLowerCase(),displayName:data.displayName.trim(),email:data.email.trim(),passwordHash:p.hash,passwordSalt:p.salt,passwordIterations:p.iterations,enabled:true,systemAdmin:true,forcePasswordChange:false,createdAt:new Date().toISOString()});
    await TM.DB.audit('SYSTEM_BOOTSTRAP','user',id,{username:data.username.trim().toLowerCase()});
    return id;
  }
  async function login(username,password) {
    const user=await TM.DB.byIndex('users','username',username.trim().toLowerCase());
    if(!user || !user.enabled || !(await verify(password,user))) { await TM.DB.audit('LOGIN_FAILED','user','',{username:username.trim().toLowerCase()}); return false; }
    sessionStorage.setItem('tm.session',JSON.stringify({userId:user.id,startedAt:new Date().toISOString()}));
    await TM.DB.audit('LOGIN_SUCCESS','user',user.id,{}); return true;
  }
  function logout(){ sessionStorage.removeItem('tm.session'); location.reload(); }
  async function currentUser(){ try{const s=JSON.parse(sessionStorage.getItem('tm.session')); return s?TM.DB.get('users',s.userId):null;}catch{return null;} }
  return {createFirstAdmin,login,logout,currentUser,makePassword};
})();
