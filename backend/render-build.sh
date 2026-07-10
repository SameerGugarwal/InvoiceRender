#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# Install Chrome into a project-local cache so it survives from the
# Render build step into the runtime instance (the default ~/.cache
# location is not reliably available at runtime).
PUPPETEER_CACHE_DIR="$(pwd)/.cache/puppeteer" npx puppeteer browsers install chrome
