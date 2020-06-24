export class Lazy<T> {
  private value?: T = undefined

  constructor(private readonly init: () => T) {}

  public get(): T {
    if (this.value === undefined) {
      this.value = this.init()
    }

    return this.value
  }
}
