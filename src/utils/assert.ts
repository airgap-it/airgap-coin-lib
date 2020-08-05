export function assertFields(name: string, object: any, ...fields: string[]): void {
  fields.forEach((field: string) => {
    if (object[field] === undefined || object[field] === null) {
      throw new Error(`${name}, required: ${fields.join(', ')}, but ${field} is missing.`)
    }
  })
}