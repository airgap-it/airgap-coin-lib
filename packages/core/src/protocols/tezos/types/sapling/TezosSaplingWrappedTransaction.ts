import { TezosAddress } from '../../TezosAddress'

export interface TezosSaplingWrappedTransaction {
  signed: string | Buffer
  unshieldTarget?: TezosAddress
}
