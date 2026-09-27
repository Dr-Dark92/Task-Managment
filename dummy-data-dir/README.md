# dummy-data-dir

Synthetic populated workspace for Task Management development and dashboard testing.

Contains 12 users, 5 groups, 5 projects, 16 tasks, 8 tickets and 8 Take Action records, plus comments and announcements.

No real credentials or production indicators are included.

## Personal Workspace dummy data v2

Personal Workspace records are intentionally **not** stored in this shared dummy directory. They are browser-local IndexedDB data.

After signing in with the dummy administrator, open **My Workspace** and click **Load Dummy Data v2**. The loader seeds only the current Chrome browser/user with synthetic profile data, 3 notes, 3 reminders, 3 phone-book contacts, 3 email-book contacts and 3 important URLs.

The loader is one-time per user/browser and contains no real credentials. Clearing the browser's site data/IndexedDB removes the Personal Workspace dataset without modifying this shared dummy workspace.
