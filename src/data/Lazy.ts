export class Lazy<T> {
  private isInitialized: boolean = false

  private value?: T = undefined

  constructor(private readonly init: () => T) {}

  public get(): T {
    if (!this.isInitialized) {
      this.value = this.init()
      this.isInitialized = true
    }

    return this.value as T
  }
}
