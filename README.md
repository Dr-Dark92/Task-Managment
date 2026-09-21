# Task Management

Standalone, portable, HTML-first internal work management application.

## Runtime rule
Open `index.html` directly in a modern browser. Production requires no Python, Node.js runtime, FastAPI, web server, Docker, Apache, nginx, systemd/Windows service, API, administrator installation, or background runtime.

## Architecture
- HTML5, CSS3 and Vanilla JavaScript
- Browser File System Access API for the planned authoritative shared datastore on a user-selected SMB/shared folder
- JSON record/event files for shared application state
- IndexedDB for the current application datastore during migration and later browser-local cache/state where appropriate
- Web Crypto API for browser-side cryptographic operations
- Client-side XLSX import
- Browser PDF viewing
- Client-side DOCX viewing/editing where practical

## Shared datastore direction
The production target is a static frontend plus a shared filesystem datastore. Users open the application directly and explicitly select the authorized shared workspace. The application must not silently fall back to browser-local data when configured for authoritative shared mode.

The previous HTTP/.NET/SQLite shared-service prototype has been removed. Shared storage is being developed and validated as a browser-to-filesystem layer before the live application is migrated away from its current IndexedDB datastore.

## Planned core
- First-run administrator bootstrap and login
- User/group management and RBAC
- XLSX user import (`username`, `password` minimum)
- Projects and collaborative workspaces
- Tasks, delegation, statuses, comments, attachments and history
- Tickets and assignment workflow
- KPI dashboards
- Calendar and leave management
- Private/group messaging
- Announcements
- Documents, PDF viewing and DOCX workflow
- Notifications and audit history
- Settings/branding
- Backup/export and restore/import

## Status
The application is currently in staged development. Existing application modules still use IndexedDB while the SharedFS foundation is designed and tested against the zero-install shared-folder deployment model.
