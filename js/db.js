window.TM = window.TM || {};
TM.DB = (() => {
  const NAME = 'task-management';
  const VERSION = 1;
  let db;

  function open() {
    if (db) return Promise.resolve(db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(NAME, VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        const users = d.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        users.createIndex('username', 'username', { unique: true });
        users.createIndex('enabled', 'enabled');
        const groups = d.createObjectStore('groups', { keyPath: 'id', autoIncrement: true });
        groups.createIndex('name', 'name', { unique: true });
        d.createObjectStore('settings', { keyPath: 'key' });
        const audit = d.createObjectStore('audit', { keyPath: 'id', autoIncrement: true });
        audit.createIndex('timestamp', 'timestamp');
        d.createObjectStore('sessions', { keyPath: 'key' });
      };
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onerror = () => reject(req.error);
    });
  }

  async function store(name, mode = 'readonly') {
    const d = await open();
    return d.transaction(name, mode).objectStore(name);
  }

  async function getAll(name) {
    const s = await store(name);
    return new Promise((resolve, reject) => { const r=s.getAll(); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
  }
  async function get(name, key) {
    const s = await store(name);
    return new Promise((resolve, reject) => { const r=s.get(key); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
  }
  async function put(name, value) {
    const s = await store(name, 'readwrite');
    return new Promise((resolve, reject) => { const r=s.put(value); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
  }
  async function add(name, value) {
    const s = await store(name, 'readwrite');
    return new Promise((resolve, reject) => { const r=s.add(value); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
  }
  async function remove(name, key) {
    const s = await store(name, 'readwrite');
    return new Promise((resolve, reject) => { const r=s.delete(key); r.onsuccess=()=>resolve(); r.onerror=()=>reject(r.error); });
  }
  async function byIndex(name, index, key) {
    const s = await store(name);
    return new Promise((resolve, reject) => { const r=s.index(index).get(key); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
  }
  async function count(name) {
    const s = await store(name);
    return new Promise((resolve, reject) => { const r=s.count(); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
  }
  async function audit(action, objectType='', objectId='', metadata={}) {
    return add('audit', { timestamp:new Date().toISOString(), action, objectType, objectId:String(objectId||''), metadata });
  }
  return { open, getAll, get, put, add, remove, byIndex, count, audit };
})();
