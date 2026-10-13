export type GameState = 'READY' | 'RUNNING' | 'PAUSED' | 'CAUGHT' | 'GAME_OVER';

export type LaneIndex = -1 | 0 | 1;

export type InputAction = 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE' | 'START' | 'RESET' | 'PAUSE' | 'RETRY' | 'TEASE';

export type ObstacleType =
  | 'LOW_BARRIER'
  | 'TALL_BLOCK'
  | 'ROLLING_MATKA'
  | 'SLIDING_GATE'
  | 'OVERHEAD_BEAM'
  | 'BRIDGE_ROPE'
  | 'GHAT_STEPS'
  | 'PRAYER_FLAG_GALE'
  | 'PULU_KISI_CROSSING';

export type GuardianState = 'TRACKING' | 'CLOSING' | 'CAUGHT';

export interface BoundingBox3D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export type JumpStyle = 0 | 1 | 2; // 0: Parkour Vault, 1: Front Flip Somersault, 2: Backward Teasing Leap
export type SlideStyle = 0 | 1 | 2; // 0: Temple Run Glide, 1: Parkour Dive Roll, 2: Rockstar Knee Slide
export type DodgeStyle = 0 | 1 | 2; // 0: Skater Carve Swipe, 1: Lateral Barrel Hop, 2: 360° Spin Quick-Step

export const JUMP_STYLE_NAMES = [
  'Parkour Vault',
  'Front Flip Somersault',
  'Backward Teasing Leap'
] as const;

export const SLIDE_STYLE_NAMES = [
  'Temple Run Glide',
  'Parkour Dive Roll',
  'Rockstar Knee Slide'
] as const;

export const DODGE_STYLE_NAMES = [
  'Skater Carve Swipe',
  'Lateral Barrel Hop',
  '360° Spin Quick-Step'
] as const;

export interface PlayerTelemetry {
  lane: LaneIndex;
  targetLane: LaneIndex;
  x: number;
  y: number;
  z: number;
  isJumping: boolean;
  isSliding: boolean;
  isTeasing?: boolean;
  jumpVariant?: number;
  slideVariant?: number;
  dodgeVariant?: number;
  distance: number;
  coins: number;
  bounds: BoundingBox3D;
}

export interface CollisionInfo {
  collided: boolean;
  obstacleType?: ObstacleType;
  lane?: LaneIndex;
  distance?: number;
}

export interface GameOverData {
  finalDistance: number;
  bestDistance: number;
  isNewRecord: boolean;
  coins: number;
  bestCoins: number;
  obstacleType?: ObstacleType;
  lane?: LaneIndex;
  guardianDistance: number;
}

export type SkillCalloutType =
  | 'CLEAN_VAULT'
  | 'CLEAN_SLIDE'
  | 'CLOSE_CALL'
  | 'GATE_EVADED'
  | 'COMBO_SURGE'
  | 'RECORD_BROKEN'
  | 'GUARDIAN_OUTPACED'
  | 'WIND_GUST_EVADED'
  | 'MILESTONE_CLEARED'
  | 'TEASE_TAUNT'
  | 'PULU_KISI_EVADED';

export interface SkillCalloutEvent {
  type: SkillCalloutType;
  title: string;
  subtitle: string;
  points: number;
  multiplier: number;
  timestamp: number;
  lateralDir?: number;
}

export type BiomeType = 'DURBAR_ALLEY' | 'RIVER_CAUSEWAY' | 'TEMPLE_HILL';

export interface BiomeConfig {
  type: BiomeType;
  name: string;
  tagline: string;
  fogColor: { r: number; g: number; b: number };
  clearColor: { r: number; g: number; b: number };
  sunColor: { r: number; g: number; b: number };
  sunIntensity: number;
  ambientColor: { r: number; g: number; b: number };
  fogStart: number;
  fogEnd: number;
}

