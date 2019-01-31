import { TezosProtocol } from '../TezosProtocol'
import { SubProtocolType, ICoinSubProtocol } from '../../ICoinSubProtocol'
import axios from 'axios'

export class TezosKtProtocol extends TezosProtocol implements ICoinSubProtocol {
  isSubProtocol = true
  subProtocolType = SubProtocolType.ACCOUNT
  addressValidationPattern = '^KT1[1-9A-Za-z]{33}$'

  async getAddressFromPublicKey(publicKey: string): Promise<string> {
    return (await this.getAddressesFromPublicKey(publicKey))[0]
  }

  async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const tz1address = await super.getAddressFromPublicKey(publicKey)
    const { data } = await axios.get(`${this.baseApiUrl}/v3/operations/${tz1address}?type=Origination`)
    const ktAddresses = [].concat.apply(
      [],
      data.map((origination: { type: { operations: [{ tz1: { tz: string } }] } }) => {
        return origination.type.operations.map(operation => {
          return operation.tz1.tz
        })
      })
    )

    return ktAddresses
  }

  static originate() {
    //
  }

  delegate() {
    //
  }
}
