import type { GameTelemetryPayload } from '../game/GameManager';
import type { BiomeType, GameState, SkillCalloutEvent } from '../types';

/** One short HUD message; scoring/audio/3D effects remain owned by the game. */
export class RunFeedback {
  private element = document.getElementById('run-feedback')!;
  private text = document.getElementById('run-feedback-text')!;
  private points = document.getElementById('run-feedback-points')!;
  private timer?: number;
  private priority = 0;
  private lastRoutineAt = -Infinity;
  private biome?: BiomeType;
  private lastEvent?: SkillCalloutEvent;
  private state?: GameState;
  private runId?: number;

  public update(payload: GameTelemetryPayload): void {
    const { state, activeCallout } = payload;
    const freshRun = state === 'RUNNING' &&
      ((this.state !== 'RUNNING' && this.state !== 'PAUSED') || payload.runId !== this.runId);
    this.state = state;
    this.runId = payload.runId;

    if (freshRun) {
      this.clear();
      this.biome = undefined;
      this.lastEvent = undefined;
      this.lastRoutineAt = -Infinity;
    }
    if (state !== 'RUNNING') {
      this.clear();
      this.lastEvent = activeCallout; // Consume interrupted events; never replay on Resume.
      if (state === 'READY') this.biome = undefined;
      return;
    }

    const locationChanged = this.biome !== payload.currentBiome;
    if (locationChanged) {
      this.biome = payload.currentBiome;
      this.show(payload.biomeName, 2, 1100, 'location');
    }
    if (!activeCallout || activeCallout === this.lastEvent) return;
    this.lastEvent = activeCallout;

    if (activeCallout.type === 'MILESTONE_CLEARED') {
      // One announcement for the transition and its existing awarded bonus.
      this.show(payload.biomeName, 2, 1100, 'location', activeCallout.points);
    } else if (activeCallout.type === 'RECORD_BROKEN') {
      this.show('New personal best', 3, 1300, 'record');
    } else {
      const now = performance.now();
      if (now - this.lastRoutineAt < 650) return;
      // Combo events upgrade the multiplier; their nominal points are not awarded by ScoreManager.
      const awarded = activeCallout.type === 'COMBO_SURGE' ? 0 : activeCallout.points;
      if (this.show(activeCallout.title, 1, 850, 'skill', awarded)) this.lastRoutineAt = now;
    }
  }

  private show(text: string, priority: number, duration: number, kind: string, points = 0): boolean {
    if (this.priority > priority) return false;
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.priority = priority;
    this.text.textContent = text;
    this.points.textContent = points > 0 ? `+${points}` : '';
    this.element.dataset.kind = kind;
    this.element.hidden = false;
    this.timer = window.setTimeout(() => this.clear(), duration);
    return true;
  }

  public clear(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.priority = 0;
    this.element.hidden = true;
    this.text.textContent = '';
    this.points.textContent = '';
  }
}
