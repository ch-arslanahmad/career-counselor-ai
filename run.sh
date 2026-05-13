#!/bin/bash

# Exit on error, undefined var, or any failure
set -euo pipefail

# Get script's directory (absolute path)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PORT=8001
FRONTEND_PORT=8000

# Cleanup background processes on exit
cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true # kill process using `kill` command.
  fi

  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

# Run cleanup on Ctrl+C or script exit
trap cleanup EXIT INT TERM

# Kill specified ports if they are in use, suppressing errors if not
fuser -k "$BACKEND_PORT"/tcp 2>/dev/null || true
fuser -k "$FRONTEND_PORT"/tcp 2>/dev/null || true

echo "Starting backend on http://localhost:${BACKEND_PORT}"
(
  cd "$BACKEND_DIR"
  uvicorn main:app --reload --host 127.0.0.1 --port "$BACKEND_PORT" # start backend
) &
BACKEND_PID=$!  # capture PID of last background job

# Start frontend server
echo "Starting frontend on http://localhost:${FRONTEND_PORT}"
(
  cd "$FRONTEND_DIR"
  python3 -m http.server "$FRONTEND_PORT" # start frontend
) &
FRONTEND_PID=$!

# Keep script alive while child processes run
wait
