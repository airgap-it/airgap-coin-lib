export class RPCBody {
  constructor(
    public readonly method: string,
    public readonly params: any[],
    public readonly id: number = 1,
    public readonly jsonrpc: string = '2.0'
  ) {}
}
