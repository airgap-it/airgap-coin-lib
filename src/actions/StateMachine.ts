export class StateMachine<S> {
  private state: S
  private readonly validTransitions: Map<S, S[]>

  constructor(initialState: S, validTransitions: Map<S, S[]>) {
    this.state = initialState
    this.validTransitions = validTransitions
  }

  public transitionTo(state: S): void {
    if (this.canTransitionTo(state)) {
      this.state = state
    } else {
      throw new Error(`Invalid state transition: ${this.state} -> ${state}`)
    }
  }

  public getState(): S {
    return this.state
  }

  public addValidStateTransition(from: S, to: S): void {
    const states: S[] | undefined = this.validTransitions.get(to)
    if (states !== undefined && states.indexOf(from) === -1) {
      states.push(from)
      this.validTransitions.set(to, states)
    } else {
      this.validTransitions.set(to, [from])
    }
  }

  private canTransitionTo(state: S): boolean {
    const states: S[] | undefined = this.validTransitions.get(state)
    if (states !== undefined) {
      return states.indexOf(this.state) !== -1
    }

    return false
  }
}
