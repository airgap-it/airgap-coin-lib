export abstract class RemoteData<T> {
  protected constructor(public readonly uri: string) {}

  public abstract get(): Promise<T | undefined>
}
