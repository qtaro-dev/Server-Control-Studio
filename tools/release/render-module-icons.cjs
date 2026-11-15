// Rebuild generic module icon PNGs from pinned Tabler SVGs on Windows.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const script = path.join(__dirname, 'render-module-icons.ps1');
const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
