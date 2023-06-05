import axios, { AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'

import { TezosSaplingStateDiff } from '../types/sapling/TezosSaplingStateDiff'

export class TezosSaplingNodeClient {
  constructor(private readonly rpcUrl: string, private readonly contractAddress: string) {}

  public async getSaplingStateDiff(): Promise<TezosSaplingStateDiff> {
    const response: AxiosResponse<TezosSaplingStateDiff> = await axios.get(
      `${this.rpcUrl}/chains/main/blocks/head/context/contracts/${this.contractAddress}/single_sapling_get_diff`
    )

    return response.data
  }

  public async getChainId(): Promise<string> {
    const response: AxiosResponse<{ chain_id: string }> = await axios.get(`${this.rpcUrl}/chains/main/blocks/head/header`)

    return response.data.chain_id
  }
}
