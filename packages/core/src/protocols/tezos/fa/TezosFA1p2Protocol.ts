import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { RawTezosTransaction } from '../../../serializer/types'
import { TezosFATokenMetadata } from '../types/fa/TezosFATokenMetadata'

import { TezosFA1Protocol } from './TezosFA1Protocol'

enum TezosFA1p2ContractEntrypoint {
  BALANCE = 'getBalance',
  ALLOWANCE = 'getAllowance',
  APPROVE = 'approve',
  TRANSFER = 'transfer',
  TOTAL_SUPPLY = 'getTotalSupply'
}

export class TezosFA1p2Protocol extends TezosFA1Protocol {
  public async getTokenMetadata(): Promise<TezosFATokenMetadata | undefined> {
    return this.getTokenMetadataForTokenID(0)
  }

  public async getAllowance(
    ownerAddress: string,
    spenderAddress: string,
    callbackContract: string = this.callbackContract(),
    source?: string
  ): Promise<string> {
    const getAllowanceCall = await this.contract.createContractCall(TezosFA1p2ContractEntrypoint.ALLOWANCE, [
      {
        owner: ownerAddress,
        spender: spenderAddress
      },
      callbackContract
    ])

    return this.getContractCallIntResult(getAllowanceCall, this.requireSource(source, spenderAddress, 'kt'))
  }

  public async approve(spenderAddress: string, amount: string, fee: string, publicKey: string): Promise<RawTezosTransaction> {
    const approveCall = await this.contract.createContractCall(TezosFA1p2ContractEntrypoint.APPROVE, {
      spender: spenderAddress,
      value: new BigNumber(amount).toNumber()
    })

    return this.prepareContractCall([approveCall], fee, publicKey)
  }
}
