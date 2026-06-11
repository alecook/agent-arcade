#!/usr/bin/env node

import { runArcade } from './arcade-app.js';

const args = new Set(process.argv.slice(2));

if (args.has('--help') || args.has('-h')) {
    console.log(`agent-arcade

Usage:
  agent-arcade [--mock]

Controls:
  up/down or j/k   Move selection
  enter or space   Select / drop
  left/right       Move launcher in peg-drop
  q or escape      Back / quit
`);
    process.exit(0);
}

if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error('agent-arcade requires an interactive TTY.');
    process.exit(1);
}

try {
    await runArcade({ isMockMode: args.has('--mock') });
    process.exit(0);
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
}
