import type { GameManager } from '../game/GameManager';
import type { InputAction } from '../types';

const STORAGE_KEY = 'lakhey-run.controls.v1';
const STEPS = [
  { action: 'LEFT', symbol: '←', title: 'Find your lane', hint: 'Swipe left to change lanes.', keyboard: 'Left arrow or A' },
  { action: 'RIGHT', symbol: '→', title: 'Make room to run', hint: 'Swipe right to change lanes.', keyboard: 'Right arrow or D' },
  { action: 'JUMP', symbol: '↑', title: 'Over the hurdle', hint: 'Swipe up to jump over low obstacles.', keyboard: 'Up arrow, W or Space' },
  { action: 'SLIDE', symbol: '↓', title: 'Under the beam', hint: 'Swipe down to slide under overhead obstacles.', keyboard: 'Down arrow or S' },
] as const;

/** A safe, pre-run rehearsal. It never moves the player or changes collision timing. */
export class ControlsTutorial {
  private dialog = document.getElementById('controls-tutorial') as HTMLDialogElement;
  private pad = document.getElementById('tutorial-pad')!;
  private step = 0;
  private seen = false;
  private startAfter = false;
  private returnFocus?: HTMLElement;

  constructor(private game: GameManager) {
    try { this.seen = localStorage.getItem(STORAGE_KEY) === 'seen'; } catch { /* Session-only fallback. */ }
    document.getElementById('tutorial-next')!.addEventListener('click', () => this.advance());
    document.getElementById('tutorial-skip')!.addEventListener('click', () => this.finish());
    this.dialog.addEventListener('cancel', (event) => { event.preventDefault(); this.finish(); });

    let pointer: { id: number; x: number; y: number } | undefined;
    this.pad.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      this.pad.setPointerCapture(event.pointerId);
    });
    this.pad.addEventListener('pointermove', (event) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= 30) return;
      pointer = undefined; // One step per gesture, including long swipes.
      const action = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'LEFT' : 'RIGHT') : (dy < 0 ? 'JUMP' : 'SLIDE');
      this.practice(action);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      this.pad.addEventListener(type, () => { pointer = undefined; });
    }
  }

  public isOpen(): boolean { return this.dialog.open; }

  public allowAction(action: InputAction): boolean {
    if (this.isOpen()) {
      this.practice(action);
      return false;
    }
    if (!this.seen && this.game.getState() === 'READY' &&
        ['START', 'LEFT', 'RIGHT', 'JUMP', 'SLIDE', 'RETRY'].includes(action)) {
      this.open(true);
      return false;
    }
    return true;
  }

  public open(startAfter = false): void {
    if (this.isOpen()) return;
    this.returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.startAfter = startAfter;
    this.step = 0;
    this.render();
    this.dialog.showModal();
    document.getElementById('tutorial-next')!.focus();
  }

  private practice(action: InputAction): void {
    if (action === STEPS[this.step].action) this.advance();
    else if (['LEFT', 'RIGHT', 'JUMP', 'SLIDE'].includes(action)) {
      document.getElementById('tutorial-feedback')!.textContent = `Try ${STEPS[this.step].hint.toLowerCase()}`;
    }
  }

  private advance(): void {
    if (this.step === STEPS.length - 1) this.finish();
    else { this.step++; this.render(); }
  }

  private render(): void {
    const step = STEPS[this.step];
    document.getElementById('tutorial-progress')!.textContent = `Controls · ${this.step + 1} / ${STEPS.length}`;
    document.getElementById('tutorial-title')!.textContent = step.title;
    document.getElementById('tutorial-hint')!.textContent = step.hint;
    document.getElementById('tutorial-symbol')!.textContent = step.symbol;
    document.getElementById('tutorial-keyboard')!.textContent = `${step.keyboard} · or choose Next to review`;
    document.getElementById('tutorial-feedback')!.textContent = 'Practise here. Gameplay stays still.';
    document.getElementById('tutorial-next')!.textContent = this.step === STEPS.length - 1
      ? (this.startAfter ? 'Let’s run' : 'Done') : 'Next';
  }

  private finish(): void {
    this.seen = true;
    try { localStorage.setItem(STORAGE_KEY, 'seen'); } catch { /* Do not block play. */ }
    this.dialog.close();
    if (this.startAfter) {
      this.game.triggerAction('START', 'Controls tutorial completed or skipped');
      document.getElementById('application-canvas')!.focus();
    } else if (this.returnFocus?.isConnected) this.returnFocus.focus();
  }
}
