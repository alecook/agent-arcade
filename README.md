# Agent Arcade

Terminal games for waiting while coding agents work.

This is intentionally dependency-free for the first pass. It uses Node built-ins and ANSI terminal control directly.

## Run

```bash
npm run start -- --mock
```

Or after linking/installing:

```bash
agent-arcade --mock
```

## Controls

- `up` / `down` or `j` / `k`: move through menus
- `enter` / `space`: select or drop the orb
- `left` / `right`: aim in Raid Peg Drop
- `r`: reset Raid Peg Drop
- `q` / `escape`: back or quit

## Opencode TUI Plugin

Use the TUI plugin when you want `/arcade` to take over the current terminal buffer without sending anything to the agent.

### From npm

After this package is published, add this to `~/.config/opencode/tui.json`:

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

Opencode loads the package's `./tui` export automatically.

### From a Local Clone

For local testing, add the package directory to `~/.config/opencode/tui.json`:

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

Restart Opencode after changing TUI plugin config. Then run:

```text
/arcade
```

Or use the configured keybind.

The TUI plugin suspends Opencode's renderer, runs Agent Arcade in the same terminal, then resumes Opencode when you quit the arcade. The agent/server side continues running while the arcade owns the terminal.

Plugin options:

- `commandName`: slash command name. Defaults to `arcade`.
- `keybind`: optional keybind for launching without prompt input.
- `args`: optional string array passed to the packaged `agent-arcade` CLI. Defaults to `["--mock"]`.

## Packaging

Run the package checks:

```bash
npm run smoke
npm run pack:dry-run
```

Create a distributable tarball:

```bash
npm pack
```

This produces a file like:

```text
agent-arcade-0.1.0.tgz
```

For the easiest external testing before publishing, send people a repository link or archive and have them use the local-clone `file:///.../agent-arcade` config above.

To publish publicly:

```bash
npm login
npm publish
```

If the unscoped `agent-arcade` package name is unavailable, rename the package to a scoped name such as `@your-scope/agent-arcade`, then users should reference that scoped package in `tui.json`.

## Notes

Raid Peg Drop is a fantasy peg-drop prototype inspired by arcade pachinko-style games. It avoids third-party names and assets so this can become a public package later.
