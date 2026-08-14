#!/bin/bash
set -e

echo "==> Installing Git LFS..."
sudo apt-get update && sudo apt-get install -y git-lfs

echo "==> Installing project dependencies..."
npm install

echo "==> Installing Playwright browsers..."
npx playwright install --with-deps

echo "==> Installing Claude Code..."
curl -fsSL https://claude.ai/install.sh | bash

echo "==> Setup complete!"
