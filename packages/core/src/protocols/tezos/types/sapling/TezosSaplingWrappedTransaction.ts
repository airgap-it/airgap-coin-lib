import { TezosAddress } from '../../TezosAddress'

export interface TezosSaplingWrappedTransaction {
  signed: string
  unshieldTarget?: TezosAddress
}
