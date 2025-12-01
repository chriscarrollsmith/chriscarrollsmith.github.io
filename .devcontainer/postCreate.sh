#!/bin/bash
set -e

echo "==> Installing Git LFS..."
apt-get update && apt-get install -y git-lfs

echo "==> Installing project dependencies with Bun..."
bun install

echo "==> Installing Playwright browsers..."
bunx playwright install --with-deps

echo "==> Installing Claude Code..."
curl -fsSL https://claude.ai/install.sh | bash

echo "==> Setup complete!"
