import { InputAction } from '../types';

export class InputManager {
  private listeners: Array<(action: InputAction, source: string) => void> = [];
  private pointerStartX = 0;
  private pointerStartY = 0;
  private pointerStartTime = 0;
  private isPointerDown = false;
  private swipeConsumed = false;
  private activeKeys = new Set<string>();

  private readonly SWIPE_THRESHOLD = 30; // pixels

  constructor(targetElement: HTMLElement) {
    this.setupKeyboard();
    this.setupTouchGestures(targetElement);
  }

  public onAction(callback: (action: InputAction, source: string) => void): void {
    this.listeners.push(callback);
  }

  public triggerAction(action: InputAction, source: string): void {
    for (const listener of this.listeners) {
      listener(action, source);
    }
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Keep text entry isolated and native Space/Enter activation on buttons/links.
      // Other game shortcuts must still work after clicking a gameplay control.
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (e.defaultPrevented || target?.closest('input, textarea, select, [contenteditable="true"]') ||
          (target?.closest('button, a') && ['Space', 'Enter'].includes(e.code))) return;
      // Prevent browser scroll for game controls
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Ignore auto-repeat for jump to ensure holding key doesn't trigger repeated jumps
      if (e.repeat && ['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        return;
      }

      // Track active keys
      this.activeKeys.add(e.code);

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.triggerAction('LEFT', `Keyboard [${e.code}]`);
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.triggerAction('RIGHT', `Keyboard [${e.code}]`);
          break;
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          this.triggerAction('JUMP', `Keyboard [${e.code}]`);
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.triggerAction('SLIDE', `Keyboard [${e.code}]`);
          break;
        case 'KeyT':
        case 'KeyE':
          this.triggerAction('TEASE', `Keyboard [${e.code}]`);
          break;
        case 'KeyR':
          this.triggerAction('RESET', 'Keyboard [R]');
          break;
        case 'KeyP':
        case 'Escape':
          this.triggerAction('PAUSE', 'Keyboard [P]');
          break;
        case 'Enter':
          this.triggerAction('START', 'Keyboard [Enter]');
          break;
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.activeKeys.delete(e.code);
    });
  }

  private setupTouchGestures(target: HTMLElement): void {
    target.addEventListener('pointerdown', (e: PointerEvent) => {
      // Only track primary touch/left mouse button
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (!e.isPrimary) return;

      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
      this.pointerStartTime = performance.now();
      this.isPointerDown = true;
      this.swipeConsumed = false;
      target.setPointerCapture(e.pointerId);
    });

    target.addEventListener('pointermove', (e: PointerEvent) => {
      if (!e.isPrimary || !this.isPointerDown || this.swipeConsumed) return;

      const dx = e.clientX - this.pointerStartX;
      const dy = e.clientY - this.pointerStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Check if threshold reached
      if (absX >= this.SWIPE_THRESHOLD || absY >= this.SWIPE_THRESHOLD) {
        if (absX > absY) {
          // Horizontal swipe
          if (dx < -this.SWIPE_THRESHOLD) {
            this.swipeConsumed = true;
            this.triggerAction('LEFT', `Swipe Left (${Math.round(absX)}px)`);
          } else if (dx > this.SWIPE_THRESHOLD) {
            this.swipeConsumed = true;
            this.triggerAction('RIGHT', `Swipe Right (${Math.round(absX)}px)`);
          }
        } else {
          // Vertical swipe
          if (dy < -this.SWIPE_THRESHOLD) {
            this.swipeConsumed = true;
            this.triggerAction('JUMP', `Swipe Up / Jump (${Math.round(absY)}px)`);
          } else if (dy > this.SWIPE_THRESHOLD) {
            this.swipeConsumed = true;
            this.triggerAction('SLIDE', `Swipe Down / Slide (${Math.round(absY)}px)`);
          }
        }
      }
    });

    const finishPointer = (e: PointerEvent) => {
      if (!e.isPrimary || !this.isPointerDown) return;
      const dx = e.clientX - this.pointerStartX;
      const dy = e.clientY - this.pointerStartY;
      const elapsed = performance.now() - this.pointerStartTime;

      // If it wasn't a swipe and was a quick tap (< 300ms, < 15px drift)
      if (!this.swipeConsumed && Math.abs(dx) < 15 && Math.abs(dy) < 15 && elapsed < 350) {
        this.triggerAction('START', 'Canvas Tap');
      }

      this.isPointerDown = false;
      this.swipeConsumed = false;
    };

    target.addEventListener('pointerup', finishPointer);
    const cancelPointer = () => {
      this.isPointerDown = false;
      this.swipeConsumed = false;
    };
    target.addEventListener('pointercancel', cancelPointer);
    target.addEventListener('lostpointercapture', cancelPointer);
    window.addEventListener('blur', cancelPointer);
  }

  public dispose(): void {
    this.listeners = [];
    this.activeKeys.clear();
  }
}
