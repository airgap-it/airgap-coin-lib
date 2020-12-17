import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { RawTezosTransaction } from '../../../serializer/types'
import { TezosFA1Protocol } from './TezosFA1Protocol'

enum TezosFA12ContractEntrypoint {
  BALANCE = 'getBalance',
  ALLOWANCE = 'getAllowance',
  APPROVE = 'approve',
  TRANSFER = 'transfer',
  TOTAL_SUPPLY = 'getTotalSupply',
}

export class TezosFA12Protocol extends TezosFA1Protocol {

  public async getAllowance(
    ownerAddress: string,
    spenderAddress: string,
    callbackContract: string = this.callbackContract(),
    source?: string
  ): Promise<string> {
    const getAllowanceCall = await this.contract.createContractCall(TezosFA12ContractEntrypoint.ALLOWANCE, [{
      owner: ownerAddress,
      spender: spenderAddress
    }, callbackContract])

    return this.getContractCallIntResult(getAllowanceCall, this.requireSource(source, spenderAddress, 'kt'))
  }

  public async approve(spenderAddress: string, amount: string, fee: string, publicKey: string): Promise<RawTezosTransaction> {
    const approveCall = await this.contract.createContractCall(TezosFA12ContractEntrypoint.APPROVE, {
      spender: spenderAddress,
      value: new BigNumber(amount).toNumber()
    })

    return this.prepareContractCall([approveCall], fee, publicKey)
  }
}