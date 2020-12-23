export class ErrorWithData extends Error {
  public data: unknown
  constructor(message: string, data: unknown) {
    super(message)
    this.data = data
  }
}
