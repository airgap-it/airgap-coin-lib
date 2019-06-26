export function padStart(targetString: string, targetLength: number, padString: string) {
  // truncate if number, or convert non-number to 0
  targetLength = targetLength >> 0

  if (targetString.length >= targetLength) {
    return targetString
  } else {
    targetLength = targetLength - targetString.length
    if (targetLength > padString.length) {
      // append to original to ensure we are longer than needed
      padString += padString.repeat(targetLength / padString.length)
    }
    return padString.slice(0, targetLength) + targetString
  }
}
