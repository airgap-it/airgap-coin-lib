export enum ActionState {
  READY,
  EXECUTING,
  COMPLETED,
  CANCELLED
}

class StateMachine<S> {
  private state: S
  private readonly validTransitions: Map<S, S[]>

  constructor(initialState: S, validTransitions: Map<S, S[]>) {
    this.state = initialState
    this.validTransitions = validTransitions
  }

  transitionTo(state: S) {
    if (this.canTransitionTo(state)) {
      this.state = state
    } else {
      throw new Error('Invalid state transition: ' + this.state + ' -> ' + state)
    }
  }

  getState() {
    return this.state
  }

  private canTransitionTo(state: S): boolean {
    const states = this.validTransitions.get(this.state)
    if (states) {
      return states.indexOf(state) != -1
    }
    return false
  }
}

/**
 * We have all the methods as readonly properties to prevent users from accidentally overwriting them.
 */
export abstract class Action<Result, Context> {
  public readonly identifier: string = 'action'

  public readonly context: Context
  public result?: Result
  public error?: Error

  public onComplete?: (result: Result) => Promise<void>
  public onError?: (error: Error) => Promise<void>
  public onCancel?: () => Promise<void>

  private stateMachine = new StateMachine<ActionState>(
    ActionState.READY,
    new Map<ActionState, ActionState[]>([
      [ActionState.READY, []],
      [ActionState.EXECUTING, [ActionState.READY]],
      [ActionState.COMPLETED, [ActionState.EXECUTING]],
      [ActionState.CANCELLED, [ActionState.READY, ActionState.EXECUTING]]
    ])
  )

  public constructor(context: Context) {
    this.context = context
  }

  public readonly getState: () => Promise<ActionState> = async () => {
    return this.stateMachine.getState()
  }

  public async start() {
    try {
      this.stateMachine.transitionTo(ActionState.EXECUTING)
      const result = await this.perform()
      this.handleSuccess(result)
    } catch (error) {
      this.handleError(error)
    }
  }

  public cancel() {
    this.stateMachine.transitionTo(ActionState.CANCELLED)
    if (this.onCancel) {
      this.onCancel()
    }
  }

  protected abstract async perform(): Promise<Result>

  private handleSuccess(result: Result) {
    this.result = result
    this.stateMachine.transitionTo(ActionState.COMPLETED)
    if (this.onComplete) {
      this.onComplete(result)
    }
  }

  private handleError(error: Error) {
    this.error = error
    this.stateMachine.transitionTo(ActionState.COMPLETED)
    if (this.onError) {
      this.onError(error)
    }
    throw error
  }
}

export class SimpleAction<Result> extends Action<Result, void> {
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

export class LinkedAction<Result, Context> extends Action<Result, void> {
  public readonly action: Action<Context, void>
  private linkedAction?: Action<Result, Context>

  public constructor(
    action: Action<Context, void>,
    private readonly linkedActionType: { new (context: Context): Action<Result, Context> }
  ) {
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
}
