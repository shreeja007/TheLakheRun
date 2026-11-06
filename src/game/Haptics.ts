/**
 * Short vibration cues (T039). Uses the Vibration API, which Android browsers support; iPhone/iPad
 * browsers do not, so there the game keeps its existing sound and camera feedback only.
 */
export class Haptics {
  public readonly supported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  public enabled = true;

  /** First edge bump: a single firm tap. */
  public bump(): void { this.pulse(45); }
  /** Close call: a light tick. */
  public nearMiss(): void { this.pulse(20); }
  /** Lakhey catches Tuku: a longer double pulse. */
  public catch(): void { this.pulse([70, 50, 140]); }

  private pulse(pattern: number | number[]): void {
    if (!this.enabled || !this.supported || document.hidden) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Some browsers throw without a user gesture; vibration is optional feedback.
    }
  }
}
