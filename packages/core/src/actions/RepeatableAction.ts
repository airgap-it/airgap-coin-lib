import { Action, ActionState } from './Action'

export class RepeatableAction<Result, InnerContext, Context> extends Action<Result, Context> {
  private readonly actionFactory: () => Action<Result, InnerContext>
  private innerAction?: Action<Result, InnerContext>

  public constructor(context: Context, actionFactory: () => Action<Result, InnerContext>) {
    super(context)
    this.actionFactory = actionFactory
    this.addValidTransition(ActionState.EXECUTING, ActionState.EXECUTING)
    this.addValidTransition(ActionState.COMPLETED, ActionState.EXECUTING)
    this.addValidTransition(ActionState.CANCELLED, ActionState.EXECUTING)
  }

  protected async perform(): Promise<Result> {
    if (this.innerAction !== undefined && this.innerAction.getState() === ActionState.EXECUTING) {
      this.innerAction.cancel()
    }
    this.innerAction = this.actionFactory()
    await this.innerAction.start()

    return this.innerAction.result!
  }

  public cancel() {
    if (this.innerAction !== undefined && this.innerAction.getState() === ActionState.EXECUTING) {
      this.innerAction.cancel()
    }
    super.cancel()
  }
}
