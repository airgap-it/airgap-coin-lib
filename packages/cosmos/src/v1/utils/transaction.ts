export function calculateTransactionLimit(limit, selfTotal, otherTotal, selfOffset, otherOffset): number {
  return Math.min(Math.max(Math.ceil(limit / 2), limit - (otherTotal - otherOffset)), selfTotal - selfOffset)
}
