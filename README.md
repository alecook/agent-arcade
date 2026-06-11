# Agent Arcade

Terminal games for passing time while coding agents work.

Agent Arcade runs as a standalone CLI and as an Opencode TUI plugin. The Opencode plugin registers `/arcade`, suspends Opencode's renderer, runs the arcade in the current terminal buffer, and resumes Opencode when the arcade exits.

The first game is `Raid Peg Drop`, a small fantasy peg-drop prototype. The package is dependency-free and uses Node built-ins plus ANSI terminal control.

## Requirements

- Node.js 20 or newer
- Opencode with TUI plugin support

## CLI Usage

From a clone:

```bash
npm install
npm run build
npm run start -- --mock
```

After installing or linking the package:

```bash
agent-arcade --mock
```

## Opencode Setup

Add Agent Arcade to `~/.config/opencode/tui.json`.

Installed from npm:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    [
      "agent-arcade",
      {
        "commandName": "arcade",
        "keybind": "ctrl+shift+a",
        "args": ["--mock"]
      }
    ]
  ]
}
```

Loaded from a local clone:

```bash
npm install
npm run build
```

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    [
      "file:///path/to/agent-arcade",
      {
        "commandName": "arcade",
        "keybind": "ctrl+shift+a",
        "args": ["--mock"]
      }
    ]
  ]
}
```

Restart Opencode after changing `tui.json`.

## Opencode Usage

Run the slash command:

```text
/arcade
```

Or use the configured keybind:

```text
ctrl+shift+a
```

The arcade takes over the current terminal buffer. Quit the arcade to return to Opencode.

## Controls

- `up` / `down` or `j` / `k`: move through menus
- `enter` / `space`: select menu items or drop the orb
- `left` / `right`: aim in Raid Peg Drop
- `r`: reset Raid Peg Drop
- `q` / `escape`: back or quit

## Plugin Options

- `commandName`: slash command name. Default: `arcade`.
- `keybind`: optional keybind for launching without prompt input.
- `args`: string array passed to the packaged `agent-arcade` CLI. Default: `["--mock"]`.

## Development

```bash
npm install
npm run build
npm run check
npm run smoke
```

`npm run build` compiles TypeScript into `dist`. `npm run check` runs TypeScript without emitting files. `npm run smoke` prints CLI help from the built CLI.

## Packaging

Preview package contents:

```bash
npm run pack:dry-run
```

Create a tarball:

```bash
npm pack
```

## Notes

Raid Peg Drop is inspired by pachinko-style arcade games. It avoids third-party names and assets so the project can stay public-package friendly.
