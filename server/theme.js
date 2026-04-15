import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const HARDCODED_DEFAULTS = {
  agents: {
    'main':   { name: 'Jansky', color: '#FFD700', hairColor: '#FFD700', clothColor: '#998100', voice: 'onyx'  },
    'claw-1': { name: 'Orbit',  color: '#00DDFF', hairColor: '#00DDFF', clothColor: '#008499', voice: 'echo'  },
    'claw-2': { name: 'Nova',   color: '#AA66FF', hairColor: '#AA66FF', clothColor: '#663D99', voice: 'fable' },
  },
  background: { wall: '#141828', wallAccent: '#1A2040', floor: '#1A1E2E', floorLine: '#222840' },
};

let cachedConfig = null;

function loadTheme() {
  if (cachedConfig) return cachedConfig;

  const themeName = config.theme;
  const themePath = join(__dirname, '..', 'themes', `${themeName}.json`);

  if (!existsSync(themePath)) {
    console.warn(`[theme] themes/${themeName}.json not found, using defaults`);
    cachedConfig = null;
    return null;
  }

  try {
    cachedConfig = JSON.parse(readFileSync(themePath, 'utf8'));
    return cachedConfig;
  } catch (err) {
    console.warn(`[theme] Failed to parse themes/${themeName}.json, using defaults:`, err.message);
    return null;
  }
}

export function resolveUiConfig() {
  const defaults = JSON.parse(JSON.stringify(HARDCODED_DEFAULTS));
  const theme = loadTheme();
  if (!theme) return defaults;

  for (const agentId of ['main', 'claw-1', 'claw-2']) {
    const src = theme.agents?.[agentId];
    if (!src) continue;
    const dst = defaults.agents[agentId];
    if (src.name       && typeof src.name       === 'string') dst.name       = src.name;
    if (src.color      && typeof src.color      === 'string') dst.color      = src.color;
    if (src.hairColor  && typeof src.hairColor  === 'string') dst.hairColor  = src.hairColor;
    if (src.clothColor && typeof src.clothColor === 'string') dst.clothColor = src.clothColor;
    if (src.voice      && typeof src.voice      === 'string') dst.voice      = src.voice;
  }

  const bg = theme.background;
  if (bg) {
    if (bg.wall       && typeof bg.wall       === 'string') defaults.background.wall       = bg.wall;
    if (bg.wallAccent && typeof bg.wallAccent === 'string') defaults.background.wallAccent = bg.wallAccent;
    if (bg.floor      && typeof bg.floor      === 'string') defaults.background.floor      = bg.floor;
    if (bg.floorLine  && typeof bg.floorLine  === 'string') defaults.background.floorLine  = bg.floorLine;
  }

  return defaults;
}

export function getActiveVoices() {
  const cfg = resolveUiConfig();
  return Object.fromEntries(
    Object.entries(cfg.agents).map(([id, agent]) => [id, agent.voice])
  );
}
