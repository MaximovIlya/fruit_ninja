import {
  BASE_BOMB_CHANCE,
  BASE_FRUITS_PER_SPAWN,
  DIFFICULTY_RAMP_DURATION,
  MAX_BOMB_CHANCE,
  MAX_FRUITS_PER_SPAWN,
  MAX_SPEED_MULTIPLIER,
  MIN_SPAWN_INTERVAL,
  SPAWN_INTERVAL
} from '../../config';

export class DifficultySystem {
  private _spawnInterval = SPAWN_INTERVAL;
  private _bombChance = BASE_BOMB_CHANCE;
  private _speedMultiplier = 1;
  private _fruitsPerSpawn = BASE_FRUITS_PER_SPAWN;
  private _startTime = 0;

  reset(now: number = performance.now()): void {
    this._startTime = now;
    this._spawnInterval = SPAWN_INTERVAL;
    this._bombChance = BASE_BOMB_CHANCE;
    this._speedMultiplier = 1;
    this._fruitsPerSpawn = BASE_FRUITS_PER_SPAWN;
  }

  update(timestamp: number): void {
    if (this._startTime === 0) {
      this._startTime = timestamp;
    }

    const elapsed = Math.max(0, timestamp - this._startTime);
    const progress = Math.min(1, elapsed / DIFFICULTY_RAMP_DURATION);

    const spawnIntervalRange = SPAWN_INTERVAL - MIN_SPAWN_INTERVAL;
    this._spawnInterval = SPAWN_INTERVAL - spawnIntervalRange * progress;

    this._bombChance = BASE_BOMB_CHANCE + (MAX_BOMB_CHANCE - BASE_BOMB_CHANCE) * progress;
    this._speedMultiplier = 1 + (MAX_SPEED_MULTIPLIER - 1) * progress;

    const fruitsPerSpawn = BASE_FRUITS_PER_SPAWN + (MAX_FRUITS_PER_SPAWN - BASE_FRUITS_PER_SPAWN) * progress;
    this._fruitsPerSpawn = Math.max(BASE_FRUITS_PER_SPAWN, Math.round(fruitsPerSpawn));
  }

  get spawnInterval(): number {
    return this._spawnInterval;
  }

  get bombChance(): number {
    return this._bombChance;
  }

  get speedMultiplier(): number {
    return this._speedMultiplier;
  }

  get fruitsPerSpawn(): number {
    return this._fruitsPerSpawn;
  }
}

