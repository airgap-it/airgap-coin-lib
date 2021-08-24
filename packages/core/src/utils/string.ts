export function extractGroups(
  str: string,
  options: {
    groupStart: string[]
    groupEnd: string[]
    groupSeparator?: string
  }
): string[] {
  let start: number | undefined
  let depth: number = 0

  const groups: string[] = []
  for (let pos = 0; pos < str.length; pos++) {
    if (options.groupSeparator && str.charAt(pos) === options.groupSeparator) {
      continue
    }

    if (options.groupStart.includes(str.charAt(pos))) {
      if (depth++ === 0) {
        start = pos + 1
      }
    } else if (options.groupEnd.includes(str.charAt(pos))) {
      if (--depth === 0) {
        groups.push(str.slice(start, pos))
        start = undefined
      }
    } else if (options.groupSeparator && str.charAt(pos - 1) === options.groupSeparator) {
      if (depth === 0) {
        start = pos
      }
    } else if (options.groupSeparator && str.charAt(pos + 1) === options.groupSeparator) {
      if (depth === 0) {
        groups.push(str.slice(start, pos + 1))
        start = undefined
      }
    }
  }

  if (start !== undefined) {
    groups.push(str.slice(start))
  }

  return groups
}
