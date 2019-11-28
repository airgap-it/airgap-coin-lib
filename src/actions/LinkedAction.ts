import { Action, ActionState } from './Action'

export class LinkedAction<Result, Context> extends Action<Result, void> {
  public readonly action: Action<Context, void>
  private linkedAction?: Action<Result, Context>

  public constructor(action: Action<Context, void>, private readonly linkedActionType: new (context: Context) => Action<Result, Context>) {
    super()
    this.action = action
  }

  public getLinkedAction(): Action<Result, Context> | undefined {
    return this.linkedAction
  }

  protected async perform(): Promise<Result> {
    await this.action.start()
    this.linkedAction = new this.linkedActionType(this.action.result!)
    await this.linkedAction.start()

    return this.linkedAction.result!
  }

  public cancel() {
    if (this.action.getState() === ActionState.EXECUTING) {
      this.action.cancel()
    } else if (this.linkedAction !== undefined && this.linkedAction.getState() === ActionState.EXECUTING) {
      this.linkedAction.cancel()
    }
    super.cancel()
  }
}
