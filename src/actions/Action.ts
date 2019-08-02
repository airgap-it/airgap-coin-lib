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

  private state: ActionState = ActionState.READY

  public onComplete: (result?: SUCCESS) => Promise<void> = async () => {}
  public onError: (error: Error) => Promise<void> = async () => {}
  public onCancel: () => Promise<void> = async () => {}

  public constructor() {}

  public async start() {
    if (this.state != ActionState.READY) {
      return
    }
    this.state = ActionState.EXECUTING
    try {
      this.result = await this.perform()
      this.complete()
    } catch (error) {
      this.handleError(error)
    }
  }

  protected abstract perform(): Promise<SUCCESS | undefined>

  private complete() {
    this.state = ActionState.COMPLETED
    this.onComplete(this.result)
  }

  private handleError(error: Error) {
    this.error = error
    this.state = ActionState.COMPLETED
    this.onError(error)
  }

  public readonly getState: () => Promise<ActionState> = async () => {
    return this.state
  }

  public cancel() {
    this.state = ActionState.CANCELLED
    this.onCancel()
  }
}
