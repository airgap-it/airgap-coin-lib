export const ID_LENGTH: number = 8

// Not very random, but IDs don't have to be because they are only used locally
export function generateId(length: number = ID_LENGTH): number {
  const characters: string = '0123456789'
  const charactersLength: number = characters.length
  let result: string = ''
  for (let i: number = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return parseInt(result)
}
