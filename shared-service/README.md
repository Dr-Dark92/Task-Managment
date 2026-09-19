# Task Management Shared Data Service

This is the authoritative storage service for Shared Mode. The browser frontend remains static and can stay on the SMB share. The database and service are kept off the share by default under `C:\ProgramData\TaskManagement\`.

Build a self-contained Windows executable from a development machine with the .NET 8 SDK:

```powershell
dotnet publish .\TaskManagement.Shared.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

Copy the published executable to the designated Windows host, outside the SMB frontend directory. Start it as a Windows service using your normal service-management policy. It listens on TCP 8787 by default. Set `TM_LISTEN` and `TM_DB_PATH` as service environment variables if different values are required.

On the SMB frontend, set `config.js` to:

```js
window.TM_CONFIG={
  storageMode:'shared',
  sharedApi:'http://SERVER-NAME:8787'
};
```

Do not place the SQLite database on the SMB share. All browsers talk to the service; only the service opens the database.
