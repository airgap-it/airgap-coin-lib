import axios, { AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'

export class TezosSaplingInjectorClient {
  constructor(private readonly url: string, private readonly contractAddress: string) {}

  public async injectTransaction(transaction: string): Promise<string> {
    const response: AxiosResponse<{ hash: string }> = await axios.post(`${this.url}/sapling_transaction`, {
      transaction,
      contractAddress: this.contractAddress
    })

    return response.data.hash
  }
}
