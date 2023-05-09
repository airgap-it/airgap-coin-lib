import { isHex } from '@airgap/coinlib-core/utils/hex'
import { padStart } from '@airgap/coinlib-core/utils/padStart'
import { AirGapTransaction, Amount, newAmount } from '@airgap/module-kit'

import { getPrincipalFromPublicKey } from '../protocol/ICPImplementation'
import { ICRC1Account } from '../types/icrc/account'
import { icrcIDLTypes } from '../types/icrc/ledger'
import { ICRC1Metadata } from '../types/icrc/metadata'
import { ICRC1TransferArgs } from '../types/icrc/transfer'
import { ICRC1ProtocolNetwork } from '../types/protocol'
import * as IDL from '../utils/idl'

import { calculateCrc32 } from './convert'
import { encode, Principal } from './principal'

export function encodeICRC1Account(account: ICRC1Account): { owner: Principal; subaccount: [] | [Uint8Array] } {
  return {
    owner: isHex(account.owner) ? Principal.fromHex(account.owner) : Principal.from(account.owner),
    subaccount: account.subaccount ? [Buffer.from(account.subaccount, 'hex')] : []
  }
}

export function decodeOptionalICRC1Account(account: any): ICRC1Account | undefined {
  // TODO: maybe decode with IDL?
  if (!account || (account as any[]).length === 0) {
    return undefined
  }

  return decodeICRC1Account(account[0])
}

export function decodeICRC1Account(account: any): ICRC1Account {
  return {
    owner: (account.owner as Principal).toText(),
    subaccount: account.subaccount && account.subaccount[0] ? Buffer.from(account.subaccount[0]).toString('hex') : undefined
  }
}

export function decodeICRC1Metadata(metadata: any): ICRC1Metadata & Record<string, any> {
  // TODO: maybe decode with IDL?
  return (metadata as any[]).reduce((acc: ICRC1Metadata & Record<string, any>, next: [string, any]) => {
    switch (next[0]) {
      case 'icrc1:name':
        return Object.assign(acc, { name: next[1].Text })
      case 'icrc1:symbol':
        return Object.assign(acc, { symbol: next[1].Text })
      case 'icrc1:decimals':
        return Object.assign(acc, { decimals: Number(next[1].Nat) })
      case 'icrc1:fee':
        return Object.assign(acc, { fee: (next[1].Nat as bigint).toString() })
      default:
        return Object.assign(acc, { [next[0]]: next[1] })
    }
  }, {})
}

export function decodeICRC1TransferArgs(transaction: Buffer): ICRC1TransferArgs {
  const { TransferArg } = icrcIDLTypes(IDL)
  const transferArg = IDL.decode([TransferArg], transaction)[0] as any

  return {
    fromSubaccount:
      transferArg.from_subaccount && (transferArg.from_subaccount as any[]).length > 0
        ? Buffer.from(transferArg.from_subaccount).toString('hex')
        : undefined,
    to: decodeICRC1Account(transferArg.to),
    amount: (transferArg.amount as bigint).toString(),
    fee: transferArg.fee && (transferArg.fee as any[]).length > 0 ? (transferArg.fee as bigint).toString() : undefined,
    memo: transferArg.memo && (transferArg.memo as any[]).length > 0 ? Buffer.from(transferArg.memo).toString('hex') : undefined,
    createdAtTime:
      transferArg.created_at_time && (transferArg.created_at_time as any[]).length > 0
        ? (transferArg.created_at_time as bigint).toString()
        : undefined
  }
}

export function getDetailsFromTransferArgs<_Units extends string>(
  transferArgs: ICRC1TransferArgs,
  publicKey: string,
  network: ICRC1ProtocolNetwork,
  defaultFee: Amount<_Units>
): AirGapTransaction<_Units>[] {
  const from: string = getICRC1AddressFromPublicKey(publicKey, transferArgs.fromSubaccount)
  const to: string = getICRC1AddressFromPrincipal(transferArgs.to.owner, transferArgs.to.subaccount)

  return [
    {
      from: [from],
      to: [to],
      isInbound: from === to,

      amount: newAmount(transferArgs.amount, 'blockchain'),
      fee: transferArgs.fee ? newAmount(transferArgs.fee, 'blockchain') : defaultFee,

      network,
      arbitraryData: transferArgs.memo
    }
  ]
}

export function getICRC1AddressFromPublicKey(publicKey: string, subAccount?: string | Buffer | Uint8Array): string {
  // Get principal from public key
  const principal = getPrincipalFromPublicKey(publicKey)

  return getICRC1AddressFromPrincipal(principal, subAccount)
}

export function getICRC1AddressFromPrincipal(
  principalOrText: Principal | string,
  subAccountOrUndefined?: string | Buffer | Uint8Array
): string {
  const principal: Principal =
    typeof principalOrText === 'string'
      ? isHex(principalOrText)
        ? Principal.fromHex(principalOrText)
        : Principal.from(principalOrText)
      : principalOrText

  const subAccount: Buffer | undefined =
    typeof subAccountOrUndefined === 'string'
      ? Buffer.from(subAccountOrUndefined, 'hex')
      : typeof subAccountOrUndefined === 'undefined' || subAccountOrUndefined.length === 0
      ? undefined
      : Buffer.from(subAccountOrUndefined)

  if (subAccount === undefined) {
    return principal.toText()
  }

  const checksum: Buffer = calculateCrc32(Buffer.concat([Buffer.from(principal.toUint8Array()), subAccount]))

  return `${principal.toText()}-${encode(checksum)}.${subAccount.toString('hex').replace(/^0+/, '')}`
}

export function getICRC1AddressFromAccount(account: ICRC1Account): string {
  return getICRC1AddressFromPrincipal(account.owner, account.subaccount)
}

export function getICRC1AccountFromAddress(address: string): ICRC1Account {
  if (!address.includes('.')) {
    return {
      owner: address
    }
  }

  const [principalWithChecksum, subaccount] = address.split('.', 2)
  const principalChecksumDivider: number = principalWithChecksum.lastIndexOf('-')
  const principal: string = principalWithChecksum.slice(0, principalChecksumDivider)
  // TODO: check checksum?

  return {
    owner: principal,
    subaccount: padStart(subaccount, 64, '0')
  }
}
