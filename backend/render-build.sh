#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# Ensure Puppeteer installs the browser
npx puppeteer browsers install chrome
