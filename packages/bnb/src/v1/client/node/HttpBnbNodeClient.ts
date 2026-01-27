import { HttpEthereumNodeClient } from '@airgap/ethereum/v1'

import { BnbNodeClient } from './BnbNodeClient'

export class HttpBnbNodeClient extends HttpEthereumNodeClient implements BnbNodeClient {
  constructor(baseURL: string, headers?: any) {
    super(baseURL, headers)
  }
}
