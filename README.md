# Task Management

Standalone, portable, HTML-first internal work management application.

## Runtime rule
Open `index.html` directly in a modern browser. No Python, Node.js runtime, FastAPI, web server, Docker, Apache, nginx, systemd service, or installation is required.

## Architecture
- HTML5
- CSS3
- Vanilla JavaScript
- IndexedDB for browser-local persistent data
- Web Crypto API for browser-side cryptographic operations
- Client-side XLSX import
- Browser PDF viewing
- Client-side DOCX viewing/editing where practical

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
- Settings/branding: application name, organization name, colors, logos, backgrounds and theme
- Backup/export and restore/import

## Important deployment model
A standalone HTML application stores its live data in the browser profile. This is ideal for a portable/local build. Shared multi-computer live state will require an optional synchronization/backend layer later; the standalone frontend will remain usable without it.

## Status
Restarted from scratch on 2026-09-17. The previous Python/FastAPI prototype is abandoned and will not be merged.
