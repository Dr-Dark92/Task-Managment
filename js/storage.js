window.TM=window.TM||{};
(()=>{
 const cfg=window.TM_CONFIG||{};
 const shared=String(cfg.storageMode||'local').toLowerCase()==='shared';
 TM.DB=shared?TM.SharedDB:TM.LocalDB;
 TM.Storage={mode:shared?'shared':'local',api:shared?cfg.sharedApi||'':null};
})();
