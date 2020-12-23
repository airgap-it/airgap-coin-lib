import { StateMachine } from './StateMachine'

export enum ActionState {
  READY,
  EXECUTING,
  COMPLETED,
  CANCELLED
}

export abstract class Action<Result, Context> {
  public get identifier(): string {
    return 'action'
  }

  public readonly context: Context
  public result?: Result
  public error?: Error

  public onComplete?: (result: Result) => Promise<void>
  public onError?: (error: Error) => Promise<void>
  public onCancel?: () => Promise<void>

  private readonly stateMachine: StateMachine<ActionState> = new StateMachine<ActionState>(
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

  public async start(): Promise<void> {
    try {
      this.stateMachine.transitionTo(ActionState.EXECUTING)
      const result = await this.perform()
      this.handleSuccess(result)
    } catch (error) {
      this.handleError(error)
    }
  }

  public cancel(): void {
    this.stateMachine.transitionTo(ActionState.CANCELLED)
    if (this.onCancel) {
      this.onCancel()
    }
  }

  protected abstract perform(): Promise<Result>

  protected addValidTransition(from: ActionState, to: ActionState): void {
    this.stateMachine.addValidStateTransition(from, to)
  }

  private handleSuccess(result: Result): void {
    this.result = result
    this.stateMachine.transitionTo(ActionState.COMPLETED)
    if (this.onComplete) {
      this.onComplete(result)
    }
  }

  private handleError(error: Error): void {
    this.error = error
    this.stateMachine.transitionTo(ActionState.COMPLETED)
    if (this.onError) {
      this.onError(error)
    }
    throw error
  }
}
