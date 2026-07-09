#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f "Logo/logo.png" ]; then
  echo "Error: Logo/logo.png not found"
  exit 1
fi

npm run tauri icon Logo/logo.png
cp Logo/logo.png public/logo.png
echo "Icons generated in src-tauri/icons/ and public/logo.png updated."
