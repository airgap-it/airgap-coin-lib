export function calculateTransactionLimit(
  limit: number,
  selfTotal: number,
  otherTotal: number,
  selfOffset: number,
  otherOffset: number
): number {
  return Math.min(Math.max(Math.ceil(limit / 2), limit - (otherTotal - otherOffset)), selfTotal - selfOffset)
}
