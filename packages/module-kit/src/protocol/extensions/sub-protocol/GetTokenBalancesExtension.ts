import { Amount } from '../../../types/amount'
import { ExtendedPublicKey, PublicKey } from '../../../types/key'
import { _OnlineProtocol } from '../../protocol'

export type GetTokenBalancesExtension<T extends _OnlineProtocol> = T extends _OnlineProtocol<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  infer _PublicKey
>
  ? GetTokenBalances<_PublicKey>
  : never

interface BaseTokenDetails<_Type extends string> {
  type: _Type
  identifier: string
  contractAddress: string
}

interface SingleTokenDetails extends BaseTokenDetails<'single'> {}
interface MultiTokenDetails extends BaseTokenDetails<'multi'> {
  tokenId: string
}

export type TokenDetails = SingleTokenDetails | MultiTokenDetails

export interface GetTokenBalances<_PublicKey extends PublicKey | ExtendedPublicKey = PublicKey> {
  getTokenBalancesOfPublicKey(publicKey: _PublicKey, tokens: TokenDetails[]): Promise<Record<string /* identifier */, Amount>>
}
