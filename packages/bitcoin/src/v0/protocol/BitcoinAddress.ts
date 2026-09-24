import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { IAirGapAddress } from '@airgap/coinlib-core/interfaces/IAirGapAddress'

/**
 * Resolves the two supported call shapes of `BitcoinAddress.from`/`BitcoinSegwitAddress.from`:
 *
 *  - pre-migration: `(node, visibilityDerivationIndex?, addressDerivationIndex?)`, where `node` is
 *    a bitgo-utxo-lib-style HDNode exposing `getAddress()`. Kept because both classes are exported
 *    from `@airgap/bitcoin/v0` and external callers use this positional shape.
 *  - current: `(node, lib, network, visibilityDerivationIndex?, addressDerivationIndex?)`, where
 *    `node` is a bip32 node and `lib.payments` decides how the address is hashed.
 */
export function resolveFromArgs(
  node: any,
  libOrVisibilityIndex?: { payments: any } | number,
  networkOrAddressIndex?: any,
  maybeVisibilityIndex?: number,
  maybeAddressIndex?: number
): { node: any; lib?: { payments: any }; network?: any; visibilityDerivationIndex?: number; addressDerivationIndex?: number } {
  const isCurrentShape: boolean =
    typeof libOrVisibilityIndex === 'object' && libOrVisibilityIndex !== null && 'payments' in libOrVisibilityIndex

  const lib: { payments: any } | undefined = isCurrentShape ? (libOrVisibilityIndex as { payments: any }) : undefined
  const network: any = isCurrentShape ? networkOrAddressIndex : undefined

  // bitcoinjs-lib's payments fall back to Bitcoin mainnet for a missing network (`a.network ||
  // BITCOIN_NETWORK`), which would turn a testnet or Groestlcoin key into a mainnet address
  // instead of failing. Require an explicit network in the current shape.
  if (isCurrentShape && (network === undefined || network === null || typeof network !== 'object')) {
    throw new ConditionViolationError(
      Domain.BITCOIN,
      'BitcoinAddress.from called with (node, lib, network, ...) but no network was supplied; refusing to fall back to mainnet.'
    )
  }
  const visibilityDerivationIndex: number | undefined = isCurrentShape ? maybeVisibilityIndex : (libOrVisibilityIndex as number | undefined)
  const addressDerivationIndex: number | undefined = isCurrentShape ? maybeAddressIndex : (networkOrAddressIndex as number | undefined)

  const derivedNode =
    visibilityDerivationIndex !== undefined && addressDerivationIndex !== undefined
      ? node.derive(visibilityDerivationIndex).derive(addressDerivationIndex)
      : node

  if (!isCurrentShape && typeof derivedNode.getAddress !== 'function') {
    throw new ConditionViolationError(
      Domain.BITCOIN,
      'BitcoinAddress.from called with the legacy (node, visibilityDerivationIndex?, addressDerivationIndex?) shape, but the node does not expose getAddress(); pass (node, lib, network, ...) instead.'
    )
  }

  return { node: derivedNode, lib, network, visibilityDerivationIndex, addressDerivationIndex }
}

export class BitcoinAddress implements IAirGapAddress {
  // TODO: types
  constructor(
    protected readonly value: string,
    public readonly visibilityDerivationIndex?: number,
    public readonly addressDerivationIndex?: number
  ) {}

  /**
   * `lib` is the injected bitcoinjs-lib-compatible library. Its `payments.p2pkh` decides how the
   * address is hashed — SHA256d for Bitcoin, groestl for Groestlcoin — which is why Groestlcoin
   * injects `groestlcoinjs-lib` rather than passing a parameter.
   *
   * The pre-migration `(node, visibilityDerivationIndex?, addressDerivationIndex?)` shape is still
   * accepted for external callers holding a bitgo-style node with `getAddress()`.
   */
  public static from(node: any, visibilityDerivationIndex?: number, addressDerivationIndex?: number): BitcoinAddress
  public static from(
    node: any,
    lib: { payments: any },
    network: any,
    visibilityDerivationIndex?: number,
    addressDerivationIndex?: number
  ): BitcoinAddress
  public static from(
    node: any,
    libOrVisibilityIndex?: { payments: any } | number,
    networkOrAddressIndex?: any,
    maybeVisibilityIndex?: number,
    maybeAddressIndex?: number
  ): BitcoinAddress {
    const args = resolveFromArgs(node, libOrVisibilityIndex, networkOrAddressIndex, maybeVisibilityIndex, maybeAddressIndex)

    const address: string =
      args.lib !== undefined
        ? args.lib.payments.p2pkh({ pubkey: Buffer.from(args.node.publicKey), network: args.network }).address
        : args.node.getAddress()

    return new BitcoinAddress(address, args.visibilityDerivationIndex, args.addressDerivationIndex)
  }

  public asString(): string {
    return this.value
  }
}
