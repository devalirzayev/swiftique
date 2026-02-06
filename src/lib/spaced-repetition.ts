/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm
 *
 * quality: 0-5 rating of how well you remembered
 *   0-2: Failed (reset interval)
 *   3: Barely remembered
 *   4: Remembered with effort
 *   5: Easily remembered
 */
export function calculateNextReview(
  quality: number,
  currentInterval: number,
  currentEaseFactor: number
): { interval: number; easeFactor: number } {
  let interval: number;
  let easeFactor = currentEaseFactor;

  if (quality < 3) {
    // Failed — reset to 1 day
    interval = 1;
  } else {
    if (currentInterval === 0) {
      interval = 1;
    } else if (currentInterval === 1) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
  }

  // Update ease factor
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { interval, easeFactor };
}

export function getNextReviewDate(intervalDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString();
}
