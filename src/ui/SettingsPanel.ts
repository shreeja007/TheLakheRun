import { GameSettings, loadSettings, saveSettings } from '../game/Settings';

/** T039 settings dialog: volumes, reduce screen shake and vibration, applied live and saved. */
export class SettingsPanel {
  private dialog = document.getElementById('settings-dialog') as HTMLDialogElement;
  private music = document.getElementById('setting-music') as HTMLInputElement;
  private effects = document.getElementById('setting-effects') as HTMLInputElement;
  private musicValue = document.getElementById('setting-music-value')!;
  private effectsValue = document.getElementById('setting-effects-value')!;
  private shake = document.getElementById('setting-shake') as HTMLInputElement;
  private vibration = document.getElementById('setting-vibration') as HTMLInputElement;
  private status = document.getElementById('settings-status')!;
  private settings: GameSettings = loadSettings();

  constructor(private apply: (settings: GameSettings) => void, vibrationSupported: boolean) {
    this.vibration.disabled = !vibrationSupported;
    document.getElementById('setting-vibration-note')!.hidden = vibrationSupported;
    this.render();
    this.apply(this.settings);

    this.music.addEventListener('input', () => this.update({ musicVolume: Number(this.music.value) / 100 }));
    this.effects.addEventListener('input', () => this.update({ effectsVolume: Number(this.effects.value) / 100 }));
    this.shake.addEventListener('change', () => this.update({ reduceShake: this.shake.checked }));
    this.vibration.addEventListener('change', () => this.update({ vibration: this.vibration.checked }));
    document.getElementById('settings-done')!.addEventListener('click', () => this.dialog.close());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.open());
  }

  public isOpen(): boolean { return this.dialog.open; }
  public open(): void {
    if (!this.dialog.open) this.dialog.showModal();
  }

  private update(change: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...change };
    this.render();
    this.apply(this.settings);
    this.status.textContent = saveSettings(this.settings)
      ? 'Saved on this device.'
      : 'This browser is blocking storage, so these settings reset when the game closes.';
  }

  private render(): void {
    const music = Math.round(this.settings.musicVolume * 100);
    const effects = Math.round(this.settings.effectsVolume * 100);
    this.music.value = String(music);
    this.effects.value = String(effects);
    this.musicValue.textContent = `${music}%`;
    this.effectsValue.textContent = `${effects}%`;
    this.shake.checked = this.settings.reduceShake;
    this.vibration.checked = this.settings.vibration && !this.vibration.disabled;
  }
}
