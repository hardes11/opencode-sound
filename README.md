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

Restart OpenCode. The plugin auto-detects your sound player (PipeWire → PulseAudio → canberra → sox → ALSA).

**Disable temporarily:**
```bash
OPENCODE_SOUND_ENABLED=0 opencode
```

**Adjust volume (0-100):**
```bash
OPENCODE_SOUND_VOLUME=50 opencode
```

**Background/CLI suppression** (default: on):
Sounds are automatically suppressed when stdout is not a terminal — covering background sessions, piped output, scripted runs, and subagent contexts. This is the only OpenCode sound plugin that handles this case.

```bash
# Disable background suppression (play sounds even in non-interactive mode)
OPENCODE_SOUND_SUPPRESS_BACKGROUND=0 opencode

# Force sounds always (overrides all suppression)
OPENCODE_SOUND_FORCE=1 opencode
```

## Architecture

The plugin uses OpenCode's server-side plugin system and hooks into the SSE event stream:

| Event | Sound |
|-------|-------|
| `question.asked` | `/usr/share/sounds/freedesktop/stereo/message-new-instant.oga` |
| `permission.asked` | `/usr/share/sounds/freedesktop/stereo/message-new-instant.oga` |
| `session.idle` | `/usr/share/sounds/freedesktop/stereo/complete.oga` |

Falls back to the [Yaru](https://github.com/ubuntu/yaru) sound theme if freedesktop sounds aren't available.

Sounds are debounced (2s cooldown on asks, 3s on completion) to avoid spam.

## Comparison to Other Plugins

The [awesome-opencode](https://github.com/awesome-opencode/awesome-opencode) ecosystem has 9+ sound/notification plugins (opencode-notifier, opencode-notificator, opencode-ntfy.sh, opencode-smart-voice-notify, and more). **None of them suppress sounds in background/CLI mode.** They all focus on features this plugin deliberately avoids: desktop notifications, TTS, Telegram push, focus detection, per-project sound themes, and quiet hours.

This plugin is intentionally minimal:
- **<100 lines** — auditable in 2 minutes
- **No dependencies** — uses only Node.js built-ins
- **No desktop notifications** — plays system sounds only
- **Unique feature**: detects non-interactive mode (pipes, background sessions, subagents) and suppresses sounds automatically
- **Zero config** — works out of the box on any Linux with freedesktop or Yaru sound themes

If you want desktop notifications, Telegram alerts, TTS, or focus detection, use [opencode-notifier](https://github.com/mohak34/opencode-notifier) or [opencode-ntfy.sh](https://github.com/lannuttia/opencode-ntfy.sh). If you just want simple system sounds that don't fire in background sessions, this is the plugin.

## License

[MIT](LICENSE)
