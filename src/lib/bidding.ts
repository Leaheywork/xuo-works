// Bidding rules. One place, so the site and the future bidding engine agree.

// How much a new bid must beat the current bid by, depending on the price.
export const BID_STEPS: { below: number; step: number }[] = [
  { below: 200, step: 10 },
  { below: 1000, step: 25 },
  { below: 5000, step: 50 },
  { below: Infinity, step: 100 },
];

export function bidStep(currentBid: number): number {
  for (const t of BID_STEPS) {
    if (currentBid < t.below) return t.step;
  }
  return 100;
}

export function minNextBid(currentBid: number): number {
  return currentBid + bidStep(currentBid);
}

// A bid placed in the last ANTI_SNIPE_MINUTES adds that many minutes to the clock.
export const ANTI_SNIPE_MINUTES = 5;

export const BID_CLOCK_HOURS = 24;
