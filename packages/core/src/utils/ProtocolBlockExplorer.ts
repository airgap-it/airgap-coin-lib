export abstract class ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string) {}

  public abstract getAddressLink(address: string): Promise<string>
  public abstract getTransactionLink(transactionId: string): Promise<string>
}
