#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
exec uvicorn app.main:app --host "${TASK_BIND:-127.0.0.1}" --port "${TASK_PORT:-8080}"
