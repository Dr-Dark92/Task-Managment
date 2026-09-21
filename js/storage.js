window.TM=window.TM||{};
(()=>{
 const cfg=window.TM_CONFIG||{};
 // During the SharedFS migration the live application remains on LocalDB.
 // Shared mode will be enabled only after the filesystem datastore passes its tests.
 TM.DB=TM.LocalDB;
 TM.Storage={mode:String(cfg.storageMode||'local').toLowerCase()};
})();
