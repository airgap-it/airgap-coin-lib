export function idlDecodedToJsonStringifiable(value: any): any {
  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'function') {
    return '__function__'
  }

  if (typeof value === 'object') {
    return Object.entries(value).reduce((obj: Record<string, any>, [key, value]: any) => {
      return Object.assign(obj, { [key]: idlDecodedToJsonStringifiable(value) })
    }, {})
  }

  return value
}
