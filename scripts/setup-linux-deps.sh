#!/usr/bin/env bash
set -euo pipefail

# Linux dependencies for Tauri 2 desktop development
# Run with: sudo bash scripts/setup-linux-deps.sh

apt-get update
apt-get install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libdbus-1-dev \
  pkg-config

echo "Linux dependencies installed. Ensure Rust and Node.js are also installed."
