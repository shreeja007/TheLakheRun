export class ScoreManager {
  private static readonly STORAGE_KEY = 'lakhey_run_best_distance';
  private static readonly STORAGE_KEY_COINS = 'lakhey_run_best_coins';
  private inMemoryBest = 0;
  private inMemoryBestCoins = 0;
  private currentCoins = 0;
  private storageSupported = false;

  // Combo Multiplier & Skill Bonus System
  private multiplier = 1;
  private multiplierTimer = 0;
  public static readonly MULTIPLIER_MAX = 8;
  public static readonly MULTIPLIER_DURATION = 3.2; // Seconds
  private bonusScore = 0;
  private recordCelebratedInRun = false;

  constructor() {
    this.checkStorageSupport();
    this.loadBest();
  }

  private checkStorageSupport(): void {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      this.storageSupported = true;
    } catch {
      this.storageSupported = false;
      console.warn('localStorage is unavailable; falling back to session in-memory storage.');
    }
  }

  private loadBest(): void {
    if (this.storageSupported) {
      try {
        const savedDist = window.localStorage.getItem(ScoreManager.STORAGE_KEY);
        if (savedDist !== null) {
          const parsed = parseFloat(savedDist);
          if (!isNaN(parsed) && parsed >= 0) {
            this.inMemoryBest = parsed;
          }
        }
        const savedCoins = window.localStorage.getItem(ScoreManager.STORAGE_KEY_COINS);
        if (savedCoins !== null) {
          const parsedCoins = parseInt(savedCoins, 10);
          if (!isNaN(parsedCoins) && parsedCoins >= 0) {
            this.inMemoryBestCoins = parsedCoins;
          }
        }
      } catch (err) {
        console.warn('Failed to read from localStorage:', err);
      }
    }
  }

  public getBest(): number {
    return this.inMemoryBest;
  }

  public getBestCoins(): number {
    return this.inMemoryBestCoins;
  }

  public getCoins(): number {
    return this.currentCoins;
  }

  public addCoin(): number {
    this.currentCoins++;
    return this.currentCoins;
  }

  public resetCoins(): void {
    this.currentCoins = 0;
  }

  // Multiplier Management
  public boostMultiplier(): { multiplier: number; upgraded: boolean } {
    let upgraded = false;
    if (this.multiplier < ScoreManager.MULTIPLIER_MAX) {
      this.multiplier++;
      upgraded = true;
    }
    this.multiplierTimer = ScoreManager.MULTIPLIER_DURATION;
    return { multiplier: this.multiplier, upgraded };
  }

  public addSkillBonus(points: number): number {
    const earned = points * this.multiplier;
    this.bonusScore += earned;
    this.boostMultiplier();
    return earned;
  }

  public update(dt: number): void {
    if (this.multiplierTimer > 0) {
      this.multiplierTimer -= dt;
      if (this.multiplierTimer <= 0) {
        if (this.multiplier > 1) {
          this.multiplier--;
          this.multiplierTimer = ScoreManager.MULTIPLIER_DURATION * 0.7; // Grace decay
        } else {
          this.multiplier = 1;
        }
      }
    }
  }

  public getMultiplier(): number {
    return this.multiplier;
  }

  public getMultiplierProgress(): number {
    return Math.max(0, Math.min(1.0, this.multiplierTimer / ScoreManager.MULTIPLIER_DURATION));
  }

  public getBonusScore(): number {
    return this.bonusScore;
  }

  public getTotalScore(distance: number): number {
    return Math.floor(distance + this.bonusScore);
  }

  public checkInRunRecord(distance: number): { isNewRecord: boolean; firstTimeThisRun: boolean } {
    if (distance > this.inMemoryBest && this.inMemoryBest >= 10.0) {
      if (!this.recordCelebratedInRun) {
        this.recordCelebratedInRun = true;
        return { isNewRecord: true, firstTimeThisRun: true };
      }
      return { isNewRecord: true, firstTimeThisRun: false };
    }
    return { isNewRecord: distance > this.inMemoryBest, firstTimeThisRun: false };
  }

  public resetRun(): void {
    this.currentCoins = 0;
    this.multiplier = 1;
    this.multiplierTimer = 0;
    this.bonusScore = 0;
    this.recordCelebratedInRun = false;
  }

  public registerScore(score: number): {
    isNewRecord: boolean;
    best: number;
    isNewCoinRecord: boolean;
    bestCoins: number;
  } {
    const isNewRecord = score > this.inMemoryBest;
    if (isNewRecord) {
      this.inMemoryBest = score;
      if (this.storageSupported) {
        try {
          window.localStorage.setItem(ScoreManager.STORAGE_KEY, score.toFixed(1));
        } catch (err) {
          console.warn('Failed to save score to localStorage:', err);
        }
      }
    }

    const isNewCoinRecord = this.currentCoins > this.inMemoryBestCoins;
    if (isNewCoinRecord) {
      this.inMemoryBestCoins = this.currentCoins;
      if (this.storageSupported) {
        try {
          window.localStorage.setItem(ScoreManager.STORAGE_KEY_COINS, this.currentCoins.toString());
        } catch (err) {
          console.warn('Failed to save best coins to localStorage:', err);
        }
      }
    }

    return {
      isNewRecord,
      best: this.inMemoryBest,
      isNewCoinRecord,
      bestCoins: this.inMemoryBestCoins,
    };
  }

  public clearBest(): void {
    this.inMemoryBest = 0;
    this.inMemoryBestCoins = 0;
    this.currentCoins = 0;
    this.multiplier = 1;
    this.multiplierTimer = 0;
    this.bonusScore = 0;
    this.recordCelebratedInRun = false;
    if (this.storageSupported) {
      try {
        window.localStorage.removeItem(ScoreManager.STORAGE_KEY);
        window.localStorage.removeItem(ScoreManager.STORAGE_KEY_COINS);
      } catch (err) {
        console.warn('Failed to clear localStorage:', err);
      }
    }
  }

  public isStorageSupported(): boolean {
    return this.storageSupported;
  }
}
