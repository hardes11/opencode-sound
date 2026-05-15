import { exec } from "node:child_process";
import { existsSync } from "node:fs";

const ENABLED = process.env.OPENCODE_SOUND_ENABLED !== "0";
const VOLUME = parseInt(process.env.OPENCODE_SOUND_VOLUME || "80", 10);

const SOUNDS = {
  ask_question: "/usr/share/sounds/freedesktop/stereo/message-new-instant.oga",
  ask_permission: "/usr/share/sounds/freedesktop/stereo/message-new-instant.oga",
  answer_done: "/usr/share/sounds/freedesktop/stereo/complete.oga",
};

const YARU_SOUNDS = {
  ask_question: "/usr/share/sounds/Yaru/stereo/message-new-instant.oga",
  ask_permission: "/usr/share/sounds/Yaru/stereo/message-new-instant.oga",
  answer_done: "/usr/share/sounds/Yaru/stereo/complete.oga",
};

let _player = null;

function detectPlayer() {
  if (_player) return _player;

  const candidates = [
    { cmd: "pw-play", args: (f) => [f], name: "pipewire" },
    { cmd: "paplay", args: (f) => [f], name: "pulseaudio" },
    { cmd: "canberra-gtk-play", args: (f) => ["-f", f], name: "canberra" },
    { cmd: "play", args: (f) => [f, "vol", `${VOLUME / 100}`], name: "sox" },
    { cmd: "aplay", args: (f) => [f], name: "alsa" },
  ];

  _player = candidates[0];
  return _player;
}

function playSound(soundKey) {
  if (!ENABLED) return;

  let file = SOUNDS[soundKey];
  if (!existsSync(file)) {
    file = YARU_SOUNDS[soundKey];
    if (!file || !existsSync(file)) return;
  }

  const player = detectPlayer();
  const args = player.args(file);
  const cmd = [player.cmd, ...args].join(" ");

  exec(cmd, { timeout: 3000, stdio: "ignore" }, () => {});
}

const cooldowns = new Map();

function debounced(soundKey, ms = 2000) {
  const last = cooldowns.get(soundKey) || 0;
  const now = Date.now();
  if (now - last < ms) return;
  cooldowns.set(soundKey, now);
  playSound(soundKey);
}

export const OpencodeSoundPlugin = async (input) => {
  const { client } = input;

  const log = (msg) => {
    client.app
      .log({ body: { service: "opencode-sound", level: "info", message: msg } })
      .catch(() => {});
  };

  log(`Sound plugin initialized (enabled: ${ENABLED})`);

  return {
    event: async ({ event }) => {
      switch (event.type) {
        case "question.asked":
          debounced("ask_question", 2000);
          break;

        case "permission.asked":
          debounced("ask_permission", 2000);
          break;

        case "session.idle":
          debounced("answer_done", 3000);
          break;
      }
    },
  };
};

export default OpencodeSoundPlugin;
