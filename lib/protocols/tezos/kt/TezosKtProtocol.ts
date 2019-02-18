import {
  TezosProtocol,
  TezosOperation,
  TezosOperationType,
  TezosWrappedOperation,
  TezosOriginationOperation,
  TezosDelegationOperation
} from '../TezosProtocol'
import { SubProtocolType, ICoinSubProtocol } from '../../ICoinSubProtocol'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { RawTezosTransaction } from '../../../serializer/unsigned-transactions/tezos-transactions.serializer'

export class TezosKtProtocol extends TezosProtocol implements ICoinSubProtocol {
  identifier = 'xtz-kt'
  isSubProtocol = true
  subProtocolType = SubProtocolType.ACCOUNT
  addressValidationPattern = '^KT1[1-9A-Za-z]{33}$'

  async getAddressFromPublicKey(publicKey: string): Promise<string> {
    return (await this.getAddressesFromPublicKey(publicKey))[0]
  }

  async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const tz1address = await super.getAddressFromPublicKey(publicKey)
    const { data } = await axios.get(`${this.baseApiUrl}/v3/operations/${tz1address}?type=Origination`)

    const ktAddresses: string[] = [].concat.apply(
      [],
      data.map((origination: { type: { operations: [{ tz1: { tz: string } }] } }) => {
        return origination.type.operations.map(operation => {
          return operation.tz1.tz
        })
      })
    )

    return ktAddresses.reverse()
  }

  async originate(publicKey: string): Promise<RawTezosTransaction> {
    let counter = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []
    const address = await super.getAddressFromPublicKey(publicKey)

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager = results[2].data

      // check if we have revealed the key already
      if (!accountManager.key) {
        operations.push(await super.createRevealOperation(counter, publicKey))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const balance = await this.getBalanceOfAddresses([address])

    const fee = new BigNumber(1400)

    if (balance.isLessThan(fee)) {
      throw new Error('not enough balance')
    }

    const originationOperation: TezosOriginationOperation = {
      kind: TezosOperationType.ORIGINATION,
      source: address,
      fee: fee.toFixed(),
      counter: counter.toFixed(),
      gas_limit: '10000', // taken from eztz
      storage_limit: '257', // taken from eztz
      managerPubkey: address,
      balance: '0',
      spendable: true,
      delegatable: true
    }

    operations.push(originationOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch: branch,
        contents: operations
      }

      const binaryTx = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  async isAddressDelegated(ktAddress: string): Promise<{ isDelegated: boolean; setable: boolean; value?: string }> {
    const { data } = await axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${ktAddress}`)

    return {
      isDelegated: data.delegate.value ? true : false,
      setable: data.delegate.setable,
      value: data.delegate.value
    }
  }

  async undelegate(publicKey: string, ktAddress?: string): Promise<RawTezosTransaction> {
    return this.delegate(publicKey, ktAddress)
  }

  async delegate(publicKey: string, ktAddress?: string, delegate?: string): Promise<RawTezosTransaction> {
    let counter = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []
    const address = await super.getAddressFromPublicKey(publicKey)

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager = results[2].data

      // check if we have revealed the key already
      if (!accountManager.key) {
        operations.push(await super.createRevealOperation(counter, publicKey))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const balance = await this.getBalanceOfAddresses([address])

    const fee = new BigNumber(1420)

    if (balance.isLessThan(fee)) {
      throw new Error('not enough balance')
    }

    const delegationOperation: TezosDelegationOperation = {
      kind: TezosOperationType.DELEGATION,
      source: ktAddress || address,
      fee: fee.toFixed(),
      counter: counter.toFixed(),
      gas_limit: '10000', // taken from eztz
      storage_limit: '0', // taken from eztz
      delegate: delegate
    }

    operations.push(delegationOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch: branch,
        contents: operations
      }

      const binaryTx = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error)
      throw new Error('Forging Tezos TX failed.')
    }
  }
}
