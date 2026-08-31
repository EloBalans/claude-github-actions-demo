const MAX_DELAY_MS = 700;
const STEP_MS = 150;
const MIN_DELAY_MS = 60;

export function searchDelayMs(search: string): number {
  return Math.max(MIN_DELAY_MS, MAX_DELAY_MS - search.length * STEP_MS);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
