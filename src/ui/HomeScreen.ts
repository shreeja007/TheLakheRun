interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Progressive enhancement: browser play works even without install/cache APIs. */
export class HomeScreen {
  private dialog = document.getElementById('home-screen-dialog') as HTMLDialogElement;
  private installButton = document.getElementById('btn-install') as HTMLButtonElement;
  private menuButton = document.getElementById('btn-home-screen') as HTMLButtonElement;
  private status = document.getElementById('offline-status')!;
  private prompt?: InstallPrompt;
  private refreshOfflineStatus?: () => void;
  private installed = matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  constructor() {
    this.menuButton.hidden = this.installed;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.prompt = event as InstallPrompt;
      this.installButton.hidden = this.installed;
    });
    window.addEventListener('appinstalled', () => {
      this.installed = true;
      this.prompt = undefined;
      this.menuButton.hidden = true;
      this.installButton.hidden = true;
      if (this.dialog.open) this.dialog.close();
    });
    this.installButton.addEventListener('click', () => void this.install());
    document.getElementById('home-screen-close')!.addEventListener('click', () => this.dialog.close());
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    document.getElementById('install-instructions')!.textContent = ios
      ? 'Open this game in Safari. Tap Share, then Add to Home Screen. If shown, enable Open as Web App.'
      : 'Use Install when it’s available, or look for Install app / Add to Home screen in your browser menu. You can always play in this tab.';

    if (!import.meta.env.PROD) {
      this.status.textContent = 'Development preview: offline saving is disabled.';
    } else if ('serviceWorker' in navigator && window.isSecureContext) {
      this.status.textContent = 'Saving the game for offline play… Keep this tab open until saving finishes.';
      void this.registerWorker();
    } else {
      this.status.textContent = 'Online play is available. Home-screen installation and offline saving need HTTPS or localhost in a supporting browser.';
    }
  }

  public isOpen(): boolean { return this.dialog.open; }
  public open(): void {
    this.refreshOfflineStatus?.();
    if (!this.dialog.open) this.dialog.showModal();
  }

  private async install(): Promise<void> {
    if (!this.prompt) return;
    const prompt = this.prompt;
    this.prompt = undefined;
    this.installButton.hidden = true;
    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === 'dismissed') {
        document.getElementById('install-instructions')!.textContent = 'Installation dismissed. You can keep playing here, or use your browser’s install menu later.';
      }
    } catch {
      document.getElementById('install-instructions')!.textContent = 'The install prompt wasn’t available. Use your browser menu to add the game to your home screen, or keep playing here.';
    }
  }

  private async registerWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
      let savingFailed = false;
      const updateStatus = () => {
        this.status.textContent = savingFailed && !registration.active
          ? 'Offline saving failed. You can still play online; reconnect and reload to try again.'
          : registration.waiting
          ? 'An update is saved. Close all game tabs and reopen to use it. Your current run won’t be interrupted.'
          : registration.active
            ? 'Game saved for offline play on this browser. Browser storage can be cleared or evicted; reconnect if a later launch fails.'
            : 'Saving the game for offline play… Keep this tab open until saving finishes.';
      };
      this.refreshOfflineStatus = updateStatus;
      const watch = (worker: ServiceWorker | null) => {
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && registration.active) {
            // waiting may be assigned after this event; identify the saved update explicitly.
            this.status.textContent = 'An update is saved. Close all game tabs and reopen to use it. Your current run won’t be interrupted.';
          } else if (worker.state === 'redundant' && !registration.active) {
            savingFailed = true;
            updateStatus();
          } else updateStatus();
        });
      };
      watch(registration.installing);
      registration.addEventListener('updatefound', () => { watch(registration.installing); updateStatus(); });
      updateStatus();
    } catch (error) {
      console.warn('Home-screen offline saving unavailable:', error);
      this.status.textContent = 'Offline saving is unavailable. You can still play online.';
    }
  }
}
