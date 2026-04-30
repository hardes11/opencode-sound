# opencode-sound

Sound alerts for the [OpenCode](https://opencode.ai) terminal AI agent.

Plays system sounds when the agent:
- **Asks for permission** (bash, edit, webfetch) — `dialog-warning`
- **Asks a question** (the `question` tool) — `dialog-information`
- **Finishes a response** — `complete`

## Install

```bash
ln -sf "$(pwd)/opencode-sound.js" ~/.config/opencode/plugin/opencode-sound.js
```

Plugins in `~/.config/opencode/plugin/` are auto-loaded by OpenCode.

## Usage

Restart OpenCode. The plugin auto-detects your sound player (PipeWire → PulseAudio → canberra → sox → ALSA → terminal bell).

**Disable temporarily:**
```bash
OPENCODE_SOUND_ENABLED=0 opencode
```

**Adjust volume (0-100):**
```bash
OPENCODE_SOUND_VOLUME=50 opencode
```

## Architecture

The plugin uses OpenCode's [server-side plugin system](https://opencode.ai/docs/plugins) and hooks into the SSE event stream:

| Event | Sound |
|-------|-------|
| `question.asked` | `/usr/share/sounds/freedesktop/stereo/dialog-information.oga` |
| `permission.asked` | `/usr/share/sounds/freedesktop/stereo/dialog-warning.oga` |
| `session.idle` | `/usr/share/sounds/freedesktop/stereo/complete.oga` |

Falls back to the [Yaru](https://github.com/ubuntu/yaru) sound theme if freedesktop sounds aren't available.

Sounds are debounced (2s cooldown on asks, 3s on completion) to avoid spam.
