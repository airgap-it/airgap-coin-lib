import { Action } from './Action'

export class SimpleAction<Result> extends Action<Result, void> {
  get identifier(): string {
    return 'simple-action'
  }

  private readonly promise: () => Promise<Result>

  public constructor(promise: () => Promise<Result>) {
    super()
    this.promise = promise
  }

  protected async perform(): Promise<Result> {
    return this.promise()
  }
}
