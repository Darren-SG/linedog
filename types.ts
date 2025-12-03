
export interface PetState {
  name: string;
  imageSrc: string | null;
  fullness: number; // 0-100 (Replaces 'Hunger' logic: 0 is empty/starving)
  satisfaction: number; // 0-100
  lastUpdated: number; // Timestamp
  isDead: boolean;
}

export interface GameSettings {
  hungerRateMultiplier: number; // 0.1 to 3.0
  feedingPowerMultiplier: number; // 0.5 to 2.0
}

export interface GameState {
  pet: PetState;
  snacks: number;
  settings: GameSettings;
}

export interface TimerState {
  isActive: boolean;
  startTime: number | null;
  duration: number; // in minutes
  originalDuration: number;
}

export const CONSTANTS = {
  MAX_STAT: 100,
  DECAY_RATE_PER_MINUTE: 0.67, // Approx 20% per 30 mins (20/30) base rate
  SNACK_RECOVERY_FULLNESS: 15,
  SNACK_RECOVERY_SATISFACTION: 10,
  DEFAULT_PET_NAME: "线条小狗",
};
