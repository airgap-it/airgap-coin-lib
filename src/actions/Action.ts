export enum ActionState {
  INITIAL,

  PREPARING,
  PREPARED,

  EXECUTING,
  EXECUTED,

  COMPLETING,
  COMPLETED,

  ERRORING,
  ERROR,

  CANCELLING,
  CANCELLED
}

export interface ActionProgress<U> {
  percentage: number
  info?: U
}

export interface ActionInfo {
  [key: string]: string | undefined
}

/**
 * We have all the methods as readonly properties to prevent users from accidentally overwriting them.
 */
export abstract class Action<CONTEXT, PROGRESS, RESULT> {
  public readonly identifier: string = 'action'
  public info: ActionInfo = {}
  public context: CONTEXT | undefined

  public prepareFunction: () => Promise<CONTEXT | void> = async () => {
    /* */
  }
  public beforeHandler: () => Promise<void> = async () => {
    /* */
  }
  public handlerFunction: (context?: CONTEXT) => Promise<RESULT | undefined> = async () => {
    /* */
    return undefined
  }
  public afterHandler: () => Promise<void> = async () => {
    /* */
  }
  public progressFunction: (context?: CONTEXT, progress?: ActionProgress<PROGRESS>) => Promise<void> = async () => {
    /* */
  }
  public completeFunction: (context?: CONTEXT, result?: RESULT) => Promise<void> = async () => {
    /* */
  }
  public errorFunction: (context?: CONTEXT, error?: Error) => Promise<void> = async () => {
    /* */
  }
  public cancelFunction: (context?: CONTEXT) => Promise<void> = async () => {
    /* */
  }

  protected data: { [key: string]: unknown } = {}
  private progress: ActionProgress<PROGRESS> | undefined
  private state: ActionState = ActionState.INITIAL

  constructor(context?: CONTEXT) {
    this.context = context
    this.progress = { percentage: 0 }
  }

  public readonly perform: () => Promise<RESULT | undefined> = async () => {
    try {
      await this.onPrepare()

      await this.beforeHandler()

      const result: RESULT | undefined = await this.handler()

      await this.afterHandler()

      await this.onComplete(result)

      return result
    } catch (error) {
      this.onError(error).catch()

      return undefined
    }
  }

  public readonly getState: () => Promise<ActionState> = async () => {
    return this.state
  }

  public readonly getProgress: () => Promise<ActionProgress<PROGRESS> | undefined> = async () => {
    return this.progress
  }

  public readonly cancel: () => Promise<void> = async () => {
    await this.onCancel()
  }

  protected readonly onPrepare: () => Promise<void> = async () => {
    this.state = ActionState.PREPARING

    const preparedContext: CONTEXT | void = await this.prepareFunction()
    if (preparedContext) {
      // We only overwrite the context if onPrepare returns one
      this.context = preparedContext
    }

    this.state = ActionState.PREPARED
  }

  protected readonly handler: () => Promise<RESULT | undefined> = async () => {
    this.state = ActionState.EXECUTING

    const result: RESULT | undefined = await this.handlerFunction(this.context)

    this.state = ActionState.EXECUTED

    return result
  }

  protected readonly onProgress: (progress: ActionProgress<PROGRESS>) => Promise<void> = async (progress: ActionProgress<PROGRESS>) => {
    this.progress = progress

    return this.progressFunction(this.context, progress)
  }

  protected readonly onComplete: (result?: RESULT) => Promise<void> = async (result?: RESULT) => {
    this.state = ActionState.COMPLETING

    await this.completeFunction(this.context, result)

    this.state = ActionState.COMPLETED
  }

  protected onError: (error: Error) => Promise<void> = async (error: Error) => {
    this.state = ActionState.ERRORING

    await this.errorFunction(this.context, error)

    this.state = ActionState.ERROR
  }

  protected onCancel: () => Promise<void> = async () => {
    this.state = ActionState.CANCELLING

    await this.cancelFunction(this.context)

    this.state = ActionState.CANCELLED
  }
}
