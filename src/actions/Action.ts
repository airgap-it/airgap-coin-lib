export enum ActionState {
  READY,
  EXECUTING,
  CANCELLED,
  COMPLETED
}

/**
 * We have all the methods as readonly properties to prevent users from accidentally overwriting them.
 */
export abstract class Action<SUCCESS> {
  public readonly identifier: string = 'action'
  public result?: SUCCESS
  public error?: Error

  public onComplete?: (result: SUCCESS) => Promise<void>
  public onError?: (error: Error) => Promise<void>
  public onCancel?: () => Promise<void>

  private state: ActionState = ActionState.READY

  public constructor() {}

  public readonly getState: () => Promise<ActionState> = async () => {
    return this.state
  }

  public async start() {
    if (this.state != ActionState.READY) {
      throw new Error('Invalid state transition') // TODO: throw custom error
    }
    this.state = ActionState.EXECUTING
    try {
      this.handleSuccess(await this.perform())
    } catch (error) {
      this.handleError(error)
    }
  }

  public cancel() {
    this.state = ActionState.CANCELLED
    if (this.onCancel) {
      this.onCancel()
    }
  }

  protected abstract async perform(): Promise<SUCCESS>

  private handleSuccess(result: SUCCESS) {
    this.result = result
    this.state = ActionState.COMPLETED
    if (this.onComplete) {
      this.onComplete(result)
    }
  }

  private handleError(error: Error) {
    this.error = error
    this.state = ActionState.COMPLETED
    if (this.onError) {
      this.onError(error)
    } else {
      throw error
    }
  }
}

export class SimpleAction<Result> extends Action<Result> {
  public readonly identifier: string = 'simple-action'

  private readonly promise: Promise<Result>

  public constructor(promise: Promise<Result>) {
    super()
    this.promise = promise
  }

  protected async perform(): Promise<Result> {
    return this.promise
  }
}
