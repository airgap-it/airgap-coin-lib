export enum ActionState {
  READY,
  EXECUTING,
  COMPLETED,
  CANCELLED
}

class StateMachine<S> {
  private state: S
  private validTransitions: Map<S, S[]>

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

  addValidStateTransition(from: S, to: S) {
    const states = this.validTransitions.get(to)
    if (states !== undefined && states.indexOf(from) === -1) {
      states.push(from)
      this.validTransitions.set(to, states)
    } else {
      this.validTransitions.set(to, [from])
    }
  }

  private canTransitionTo(state: S): boolean {
    const states = this.validTransitions.get(state)
    if (states !== undefined) {
      return states.indexOf(this.state) != -1
    }
    return false
  }
}

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

  public getState(): ActionState {
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

  protected addValidTransition(from: ActionState, to: ActionState) {
    this.stateMachine.addValidStateTransition(from, to)
  }

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

  private readonly promise: () => Promise<Result>

  public constructor(promise: () => Promise<Result>) {
    super()
    this.promise = promise
  }

  protected async perform(): Promise<Result> {
    return await this.promise()
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

  public cancel() {
    if (this.action.getState() === ActionState.EXECUTING) {
      this.action.cancel()
    } else if (this.linkedAction !== undefined && this.linkedAction.getState() === ActionState.EXECUTING) {
      this.linkedAction.cancel()
    }
    super.cancel()
  }
}

export class RepeatableAction<Result, InnerContext, Context> extends Action<Result, Context> {
  private actionFactory: () => Action<Result, InnerContext>
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
