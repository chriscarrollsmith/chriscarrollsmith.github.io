#!/bin/bash
set -e

echo "==> Installing project dependencies with Bun..."
bun install

echo "==> Installing Playwright browsers..."
bunx playwright install --with-deps

echo "==> Installing Claude Code..."
curl -fsSL https://claude.ai/install.sh | bash

echo "==> Setup complete!"
