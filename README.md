# Task Management

Portable HTML-first internal work management platform.

## Planned core
- First-run administrator bootstrap and secure login
- User and group management with RBAC
- XLSX bulk user import (username/password minimum) with forced password change
- Tasks, delegation, statuses, comments, attachments, checklists and history
- Ticket delegation and lifecycle
- KPI dashboards
- Calendar and leave workflows
- Private/group messaging and announcements
- Collaborative workspaces and projects
- PDF viewing and DOCX viewing/editing workflow
- UI/branding settings: colors, logos, names and background images
- Audit logging, notifications, backup/restore

## Architecture
HTML5 + CSS3 + vanilla JavaScript frontend, Python FastAPI/Jinja2 backend, SQLAlchemy ORM, SQLite initially with a clean migration path to PostgreSQL.

## Development rule
Operational data, uploaded files, branding and the SQLite database are never committed to Git. Code and schema/migrations live in GitHub.

## Status
Bootstrap commit. Implementation follows staged foundation-first development.
