#!/bin/bash
set -e

echo "Starting Playwright component tests..."
playwright test -c playwright-ct.config.ts --ui
echo "Playwright tests completed."
