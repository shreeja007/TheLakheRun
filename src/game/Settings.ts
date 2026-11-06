/** Player settings (T039), saved on this device. Storage may be blocked; settings then last the session. */
export interface GameSettings {
  musicVolume: number; // 0–1
  effectsVolume: number; // 0–1
  reduceShake: boolean;
  vibration: boolean;
}

const STORAGE_KEY = 'lakhey-run.settings.v1';

export function defaultSettings(): GameSettings {
  return {
    musicVolume: 1,
    effectsVolume: 1,
    // Respect the device's reduced-motion preference until the player chooses.
    reduceShake: typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
    vibration: true,
  };
}

export function loadSettings(): GameSettings {
  const settings = defaultSettings();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<GameSettings> | null;
    if (saved && typeof saved === 'object') {
      if (typeof saved.musicVolume === 'number') settings.musicVolume = clampVolume(saved.musicVolume);
      if (typeof saved.effectsVolume === 'number') settings.effectsVolume = clampVolume(saved.effectsVolume);
      if (typeof saved.reduceShake === 'boolean') settings.reduceShake = saved.reduceShake;
      if (typeof saved.vibration === 'boolean') settings.vibration = saved.vibration;
    }
  } catch {
    // Unreadable or blocked storage: keep defaults.
  }
  return settings;
}

export function saveSettings(settings: GameSettings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

function clampVolume(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
}
