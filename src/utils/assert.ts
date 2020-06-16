export function assertFields(name: string, object: any, ...fields: string[]) {
  fields.forEach((field) => {
    if (object[field] === undefined || object[field] === null) {
      throw new Error(`${name}, required: ${fields.join()}, but ${field} is missing.`)
    }
  })
}
