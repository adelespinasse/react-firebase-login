#!/bin/bash
set -e

echo "Starting Playwright component tests..."
playwright test -c playwright-ct.config.ts
echo "Playwright tests completed."