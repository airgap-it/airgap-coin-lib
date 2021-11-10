export interface RawData {
  bytes: Buffer
  contentType?: string
}

export abstract class RemoteData<T> {
  protected constructor(public readonly uri: string) {}

  public abstract get(): Promise<T | undefined>
  public abstract getRaw(): Promise<RawData | undefined>
}
