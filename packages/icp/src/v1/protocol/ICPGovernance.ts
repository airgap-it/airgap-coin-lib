import { AirGapTransaction, newAmount } from '@airgap/module-kit'

import { ICPProtocolNetwork, ICPUnits } from '../module'
import { ICPActionType, ICPTransaction } from '../types/transaction'
import { AccountIdentifier } from '../utils/account'
import * as Cbor from '../utils/cbor'
import { arrayBufferToHexString, hexStringToArrayBuffer } from '../utils/convert'
import * as IDL from '../utils/idl'
import { idlDecodedToJsonStringifiable } from '../utils/json'
import { Principal } from '../utils/principal'

import {
  createUnsignedTransaction,
  getAddressFromPublicKey,
  getDetailsFromSignedTransactionTransfer,
  getFixedSubaccountFromPrivateKey,
  getFixedSubaccountFromPublicKey,
  getInfoFromUnsignedTransaction,
  getPrincipalFromPublicKey,
  signTransaction,
  signTransactionTransfer
} from './ICPImplementation'

// GET_NEURON_INFO

// CANISTER   : (name: NNS Governance, identifier: rrkah-fqaaa-aaaaa-aaaaq-cai)
// METHOD     : (name: list_neurons, type: query)
// PAYLOAD    : (neuron_ids : {}, include_neurons_readable_by_caller : true)
// RESPONSE   :
// root : {
//   neuron_infos : [
//     [
//       neuronId : float,
//       {
//         dissolve_delay_seconds: int,
//         recent_ballots: [],
//         created_timestamp_seconds: int,
//         state: int,
//         stake_e8s: int,
//         joined_community_fund_timestamp_seconds: [],
//         retrieved_at_timestamp_seconds: int,
//         known_neuron_data:[],
//         voting_power: int,
//         age_seconds: int
//       }
//     ]
//   ],
//   full_neurons : [
//     {
//       id: [],
//       staked_maturity_e8s_equivalent: [],
//       controller: [],
//       recent_ballots: [],
//       kyc_verified: bool,
//       not_for_profit: bool,
//       maturity_e8s_equivalent: int,
//       cached_neuron_stake_e8s: int,
//       created_timestamp_seconds: int,
//       auto_stake_maturity: [],
//       aging_since_timestamp_seconds: float,
//       hot_keys: [],
//       account: {},
//       joined_community_fund_timestamp_seconds: [],
//       dissolve_state: [],
//       followees: [],
//       neuron_fees_e8s: int,
//       transfer: [],
//       known_neuron_data: [],
//       spawn_at_timestamp_seconds: []
//     }
//   ]
// }
export async function prepareGetNeuronInfo(): Promise<ICPTransaction[]> {
  // Does not need to create a transaction as it is only a call to the governance token
  return [
    {
      actionType: ICPActionType.GET_NEURON_INFO,
      encoded: ''
    }
  ]
}

export function getDetailsFromUnsignedGetNeuronInfo(publicKey: string, network: ICPProtocolNetwork): AirGapTransaction<ICPUnits>[] {
  // Does not need info from transaction because it is only a call to the governance canister
  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.GET_NEURON_INFO
    }
  ]
}
export async function signGetNeuronInfo(_unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8)
  })

  const { subAccount } = getFixedSubaccountFromPrivateKey(privateKey)

  const args = IDL.encode([NeuronIdOrSubaccount], [{ Subaccount: subAccount.toUint8Array() }])

  const signedTransaction = signTransaction(privateKey, canisterId, args, 'get_full_neuron_by_id_or_subaccount', 'query')
  return signedTransaction
}

export function getDetailsFromSignedGetNeuronInfo(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8)
  })

  const cborDecoded: any = Cbor.decode(hexStringToArrayBuffer(encoded))
  const neuronIdOrSubaccount = IDL.decode([NeuronIdOrSubaccount], cborDecoded.content.arg)[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.GET_NEURON_INFO,
      json: {
        ...cborDecoded.content,
        arg: idlDecodedToJsonStringifiable(neuronIdOrSubaccount)
      }
    }
  ]
}

// TRANSFER_TO_SUBACCOUNT

// CANISTER   : (name: NNS Ledger, identifier: ryjl3-tyaaa-aaaaa-aaaba-cai)
// METHOD     : (name: transfer, type: update)
// PAYLOAD    : (to : {}, fee : {e8s: int}, memo: int, from_subaccount: [], created_at_time: [{timestamp_nanos : float}], amount: {e8s: int})
// RESPONSE   : (Ok : int)

export async function prepareTransferToSubaccount(
  publicKey: string,
  canisterId: string,
  amount: bigint,
  fee: bigint
): Promise<ICPTransaction[]> {
  // Create subaccount from publicKey
  const { subAccount, nonce } = getFixedSubaccountFromPublicKey(publicKey)

  const accountIdentifier = AccountIdentifier.fromPrincipal({
    principal: Principal.from(canisterId),
    subAccount: subAccount
  })

  const unsignedTransfer = createUnsignedTransaction({
    memo: nonce,
    amount,
    to: accountIdentifier.toHex(),
    fee
  })

  return [
    {
      actionType: ICPActionType.TRANSFER_TO_SUBACCOUNT,
      encoded: unsignedTransfer
    }
  ]
}

export function getDetailsFromUnsignedTransferToSubaccount(
  unsignedTransaction: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  const info = getInfoFromUnsignedTransaction(unsignedTransaction)

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [info.to],
      isInbound: false,
      amount: newAmount(info.amount.toString(), 'blockchain'),
      fee: newAmount(info.fee.toString(), 'blockchain'),
      network,
      type: ICPActionType.TRANSFER_TO_SUBACCOUNT,
      json: idlDecodedToJsonStringifiable(info.json)
    }
  ]
}
export async function signTransferToSubaccount(unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  return signTransactionTransfer(unsignedTransaction, privateKey, canisterId)
}
export function getDetailsFromSignedTransferToSubaccount(
  signedTransaction: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  const info = getDetailsFromSignedTransactionTransfer(signedTransaction, publicKey, network)

  return info.map((tx) => ({
    ...tx,
    type: ICPActionType.TRANSFER_TO_SUBACCOUNT
  }))
}

// CLAIM_GOVERNANCE ?

// CANISTER   : (name: NNS Governance, identifier: rrkah-fqaaa-aaaaa-aaaaq-cai)
// METHOD     : (name: claim_or_refresh_neuron_from_account, type: call)

export async function prepareClaimOrRefreshNeuron(publicKey: string): Promise<ICPTransaction[]> {
  // Create subaccount from publicKey
  const { nonce } = getFixedSubaccountFromPublicKey(publicKey)

  // Get Principal from public key
  const principal = getPrincipalFromPublicKey(publicKey)

  // IDL for ManageNeuron
  const NeuronId = IDL.Record({ id: IDL.Nat64 })

  const ClaimOrRefreshNeuronFromAccount = IDL.Record({
    controller: IDL.Opt(IDL.Principal),
    memo: IDL.Nat64
  })

  const By = IDL.Variant({
    NeuronIdOrSubaccount: IDL.Record({}),
    MemoAndController: ClaimOrRefreshNeuronFromAccount,
    Memo: IDL.Nat64
  })

  const ClaimOrRefresh = IDL.Record({ by: IDL.Opt(By) })

  const Command = IDL.Variant({
    ClaimOrRefresh: ClaimOrRefresh
  })

  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })

  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  // Encode
  const unsignedTransactionBuffer = IDL.encode(
    [ManageNeuron],
    [
      {
        id: [],
        command: [
          {
            ClaimOrRefresh: {
              by: [
                {
                  MemoAndController: { controller: [principal], memo: nonce }
                }
              ]
            }
          }
        ],
        neuron_id_or_subaccount: []
      }
    ]
  )

  return [
    {
      actionType: ICPActionType.CLAIM_GOVERNANCE,
      encoded: arrayBufferToHexString(unsignedTransactionBuffer)
    }
  ]
}

export function getDetailsFromUnsignedClaimGovernance(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for ManageNeuron
  const NeuronId = IDL.Record({ id: IDL.Nat64 })

  const ClaimOrRefreshNeuronFromAccount = IDL.Record({
    controller: IDL.Opt(IDL.Principal),
    memo: IDL.Nat64
  })

  const By = IDL.Variant({
    NeuronIdOrSubaccount: IDL.Record({}),
    MemoAndController: ClaimOrRefreshNeuronFromAccount,
    Memo: IDL.Nat64
  })

  const ClaimOrRefresh = IDL.Record({ by: IDL.Opt(By) })

  const Command = IDL.Variant({
    ClaimOrRefresh: ClaimOrRefresh
  })

  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })

  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const manageNeuron = IDL.decode([ManageNeuron], hexStringToArrayBuffer(encoded))[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.CLAIM_GOVERNANCE,
      json: {
        ManageNeuron: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

export async function signClaimGovernance(unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  // unsignedTransaction has already the arguments needed for signing, just need to be in a Buffer
  const args = hexStringToArrayBuffer(unsignedTransaction)

  // Sign transaction
  const signedTransaction = signTransaction(privateKey, canisterId, args, 'manage_neuron', 'call')

  return signedTransaction
}

export function getDetailsFromSignedClaimGovernance(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for ManageNeuron
  const NeuronId = IDL.Record({ id: IDL.Nat64 })

  const ClaimOrRefreshNeuronFromAccount = IDL.Record({
    controller: IDL.Opt(IDL.Principal),
    memo: IDL.Nat64
  })

  const By = IDL.Variant({
    NeuronIdOrSubaccount: IDL.Record({}),
    MemoAndController: ClaimOrRefreshNeuronFromAccount,
    Memo: IDL.Nat64
  })

  const ClaimOrRefresh = IDL.Record({ by: IDL.Opt(By) })

  const Command = IDL.Variant({
    ClaimOrRefresh: ClaimOrRefresh
  })

  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })

  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const cborDecoded: any = Cbor.decode(hexStringToArrayBuffer(encoded))
  const manageNeuron = IDL.decode([ManageNeuron], cborDecoded.content.arg)[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.CLAIM_GOVERNANCE,
      json: {
        ...cborDecoded.content,
        arg: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

// INCREASE_DISSOLVE_DELAY

// CANISTER   : (name: NNS Governance, identifier: rrkah-fqaaa-aaaaa-aaaaq-cai)
// METHOD     : (name: manage_neuron, type: update)
// PAYLOAD    : (id : [{id : float}], command : [{Configure : {operation : [{IncreaseDissolveDelay : {additional_dissolve_delay_seconds : int}}]}}], neuron_id_or_subaccount : [])
// RESPONSE   : (command : [{configure : {}}])

export async function prepareIncreaseDissolveDelay(publicKey: string, additionalDissolveDelay: bigint): Promise<ICPTransaction[]> {
  // Create subaccount from publicKey
  const { subAccount, nonce: _ } = getFixedSubaccountFromPublicKey(publicKey)

  // IDL for IncreaseDissolveDelay
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const IncreaseDissolveDelay = IDL.Record({
    additional_dissolve_delay_seconds: IDL.Nat32
  })
  const Operation = IDL.Variant({
    IncreaseDissolveDelay: IncreaseDissolveDelay
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  // Encode
  const unsignedTransactionBuffer = IDL.encode(
    [ManageNeuron],
    [
      {
        id: [],
        command: [
          {
            Configure: {
              operation: [
                {
                  IncreaseDissolveDelay: { additional_dissolve_delay_seconds: additionalDissolveDelay }
                }
              ]
            }
          }
        ],
        neuron_id_or_subaccount: [{ Subaccount: subAccount.toUint8Array() }]
      }
    ]
  )

  return [
    {
      actionType: ICPActionType.INCREASE_DISSOLVE_DELAY,
      encoded: arrayBufferToHexString(unsignedTransactionBuffer)
    }
  ]
}

export function getDetailsFromUnsignedIncreaseDissolveDelay(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for IncreaseDissolveDelay
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const IncreaseDissolveDelay = IDL.Record({
    additional_dissolve_delay_seconds: IDL.Nat32
  })
  const Operation = IDL.Variant({
    IncreaseDissolveDelay: IncreaseDissolveDelay
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const manageNeuron = IDL.decode([ManageNeuron], hexStringToArrayBuffer(encoded))[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.INCREASE_DISSOLVE_DELAY,
      json: {
        ManageNeuron: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

export async function signIncreaseDissolveDelay(unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  // unsignedTransaction has already the arguments needed for signing, just need to be in a Buffer
  const args = hexStringToArrayBuffer(unsignedTransaction)

  // Sign transaction
  const signedTransaction = signTransaction(privateKey, canisterId, args, 'manage_neuron', 'call')

  return signedTransaction
}

export function getDetailsFromSignedIncreaseDissolveDelay(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for IncreaseDissolveDelay
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const IncreaseDissolveDelay = IDL.Record({
    additional_dissolve_delay_seconds: IDL.Nat32
  })
  const Operation = IDL.Variant({
    IncreaseDissolveDelay: IncreaseDissolveDelay
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const cborDecoded: any = Cbor.decode(hexStringToArrayBuffer(encoded))
  const manageNeuron = IDL.decode([ManageNeuron], cborDecoded.content.arg)[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.INCREASE_DISSOLVE_DELAY,
      json: {
        ...cborDecoded.content,
        arg: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

// START_DISSOLVING

// CANISTER   : (name: NNS Governance, identifier: rrkah-fqaaa-aaaaa-aaaaq-cai)
// METHOD     : (name: manage_neuron, type: update)
// PAYLOAD    : (id : [{id : float}], command : [{Configure : {operation : [{StartDissolving : {}}]}}], neuron_id_or_subaccount : [])
// RESPONSE   : (command : [{configure : {}}])

export async function prepareStartDissolving(publicKey: string): Promise<ICPTransaction[]> {
  // Create subaccount from publicKey
  const { subAccount, nonce: _ } = getFixedSubaccountFromPublicKey(publicKey)

  // IDL for StartDissolving
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const StartDissolving = IDL.Record({})
  const Operation = IDL.Variant({
    StartDissolving: StartDissolving
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  // Encode
  const unsignedTransactionBuffer = IDL.encode(
    [ManageNeuron],
    [
      {
        id: [],
        command: [{ Configure: { operation: [{ StartDissolving: {} }] } }],
        neuron_id_or_subaccount: [{ Subaccount: subAccount.toUint8Array() }]
      }
    ]
  )

  return [
    {
      actionType: ICPActionType.START_DISSOLVING,
      encoded: arrayBufferToHexString(unsignedTransactionBuffer)
    }
  ]
}

export function getDetailsFromUnsignedStartDissolving(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for StartDissolving
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const StartDissolving = IDL.Record({})
  const Operation = IDL.Variant({
    StartDissolving: StartDissolving
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const manageNeuron = IDL.decode([ManageNeuron], hexStringToArrayBuffer(encoded))[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.START_DISSOLVING,
      json: {
        ManageNeuron: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

export async function signStartDissolving(unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  // unsignedTransaction has already the arguments needed for signing, just need to be in a Buffer
  const args = hexStringToArrayBuffer(unsignedTransaction)

  // Sign transaction
  const signedTransaction = signTransaction(privateKey, canisterId, args, 'manage_neuron', 'call')

  return signedTransaction
}

export function getDetailsFromSignedStartDissolving(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for StartDissolving
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const StartDissolving = IDL.Record({})
  const Operation = IDL.Variant({
    StartDissolving: StartDissolving
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const cborDecoded: any = Cbor.decode(hexStringToArrayBuffer(encoded))
  const manageNeuron = IDL.decode([ManageNeuron], cborDecoded.content.arg)[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.START_DISSOLVING,
      json: {
        ...cborDecoded.content,
        arg: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

// STOP_DISSOLVING

// CANISTER   : (name: NNS Governance, identifier: rrkah-fqaaa-aaaaa-aaaaq-cai)
// METHOD     : (name: manage_neuron, type: update)
// PAYLOAD    : (id : [{id : float}], command : [{Configure : {operation : [{StopDissolving : {}}]}}], neuron_id_or_subaccount : [])
// RESPONSE   : (command : [{configure : {}}])

export async function prepareStopDissolving(publicKey: string): Promise<ICPTransaction[]> {
  // Create subaccount from publicKey
  const { subAccount, nonce: _ } = getFixedSubaccountFromPublicKey(publicKey)

  // IDL for StopDissolving
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const StopDissolving = IDL.Record({})
  const Operation = IDL.Variant({
    StopDissolving: StopDissolving
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  // Encode
  const unsignedTransactionBuffer = IDL.encode(
    [ManageNeuron],
    [
      {
        id: [],
        command: [{ Configure: { operation: [{ StopDissolving: {} }] } }],
        neuron_id_or_subaccount: [{ Subaccount: subAccount.toUint8Array() }]
      }
    ]
  )

  return [
    {
      actionType: ICPActionType.STOP_DISSOLVING,
      encoded: arrayBufferToHexString(unsignedTransactionBuffer)
    }
  ]
}

export function getDetailsFromUnsignedStopDissolving(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for StopDissolving
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const StopDissolving = IDL.Record({})
  const Operation = IDL.Variant({
    StopDissolving: StopDissolving
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const manageNeuron = IDL.decode([ManageNeuron], hexStringToArrayBuffer(encoded))[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.STOP_DISSOLVING,
      json: {
        ManageNeuron: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

export async function signStopDissolving(unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  // unsignedTransaction has already the arguments needed for signing, just need to be in a Buffer
  const args = hexStringToArrayBuffer(unsignedTransaction)

  // Sign transaction
  const signedTransaction = signTransaction(privateKey, canisterId, args, 'manage_neuron', 'call')

  return signedTransaction
}

export function getDetailsFromSignedStopDissolving(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for StopDissolving
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const StopDissolving = IDL.Record({})
  const Operation = IDL.Variant({
    StopDissolving: StopDissolving
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const cborDecoded: any = Cbor.decode(hexStringToArrayBuffer(encoded))
  const manageNeuron = IDL.decode([ManageNeuron], cborDecoded.content.arg)[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.STOP_DISSOLVING,
      json: {
        ...cborDecoded.content,
        arg: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

// AUTO_STAKE_MATURITY

export async function prepareAutoStakeMaturity(publicKey: string): Promise<ICPTransaction[]> {
  // Create subaccount from publicKey
  const { subAccount, nonce: _ } = getFixedSubaccountFromPublicKey(publicKey)

  // IDL for ChangeAutoStakeMaturity
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const ChangeAutoStakeMaturity = IDL.Record({
    requested_setting_for_auto_stake_maturity: IDL.Bool
  })
  const Operation = IDL.Variant({
    ChangeAutoStakeMaturity: ChangeAutoStakeMaturity
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  // Encode
  const unsignedTransactionBuffer = IDL.encode(
    [ManageNeuron],
    [
      {
        id: [],
        command: [
          {
            Configure: {
              operation: [
                {
                  ChangeAutoStakeMaturity: {
                    requested_setting_for_auto_stake_maturity: true
                  }
                }
              ]
            }
          }
        ],
        neuron_id_or_subaccount: [{ Subaccount: subAccount.toUint8Array() }]
      }
    ]
  )

  return [
    {
      actionType: ICPActionType.AUTO_STAKE_MATURITY,
      encoded: arrayBufferToHexString(unsignedTransactionBuffer)
    }
  ]
}

export function getDetailsFromUnsignedAutoStakeMaturity(
  encoded,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for ChangeAutoStakeMaturity
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const ChangeAutoStakeMaturity = IDL.Record({
    requested_setting_for_auto_stake_maturity: IDL.Bool
  })
  const Operation = IDL.Variant({
    ChangeAutoStakeMaturity: ChangeAutoStakeMaturity
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const manageNeuron = IDL.decode([ManageNeuron], hexStringToArrayBuffer(encoded))[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.AUTO_STAKE_MATURITY,
      json: {
        ManageNeuron: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

export async function signAutoStakeMaturity(unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  // unsignedTransaction has already the arguments needed for signing, just need to be in a Buffer
  const args = hexStringToArrayBuffer(unsignedTransaction)

  // Sign transaction
  const signedTransaction = signTransaction(privateKey, canisterId, args, 'manage_neuron', 'call')

  return signedTransaction
}

export function getDetailsFromSignedAutoStakeMaturity(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for ChangeAutoStakeMaturity
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const ChangeAutoStakeMaturity = IDL.Record({
    requested_setting_for_auto_stake_maturity: IDL.Bool
  })
  const Operation = IDL.Variant({
    ChangeAutoStakeMaturity: ChangeAutoStakeMaturity
  })
  const Configure = IDL.Record({ operation: IDL.Opt(Operation) })
  const Command = IDL.Variant({
    Configure: Configure
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const cborDecoded: any = Cbor.decode(hexStringToArrayBuffer(encoded))
  const manageNeuron = IDL.decode([ManageNeuron], cborDecoded.content.arg)[0]

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.AUTO_STAKE_MATURITY,
      json: {
        ...cborDecoded.content,
        arg: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

// FOLLOW_NEURON

// CANISTER   : (name: NNS Governance, identifier: rrkah-fqaaa-aaaaa-aaaaq-cai)
// METHOD     : (name: manage_neuron, type: update)
// PAYLOAD    : (id : [{id : float}], command : [{Follow : {topic : int, followees : [{id: int}]}}], neuron_id_or_subaccount : [])
// RESPONSE   : (command : [{Follow : {}}])

const TOPICS: { id: number; name: string }[] = [
  { id: 0, name: 'All Except Governance, and SNS & Community Fund' },
  { id: 4, name: 'Governance' },
  { id: 14, name: 'SNS & Community Fund' }
]

export async function prepareFollowNeuron(publicKey: string, neuronId: bigint | undefined): Promise<ICPTransaction[]> {
  // Create subaccount from publicKey
  const { subAccount, nonce: _ } = getFixedSubaccountFromPublicKey(publicKey)

  // IDL for FollowNeuron
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const Follow = IDL.Record({
    topic: IDL.Int32,
    followees: IDL.Vec(NeuronId)
  })
  const Command = IDL.Variant({
    Follow: Follow
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  return TOPICS.map(({ id }) => {
    // Encode
    const unsignedTransactionBuffer = IDL.encode(
      [ManageNeuron],
      [
        {
          id: [],
          command: [{ Follow: { topic: id, followees: neuronId !== undefined ? [{ id: neuronId }] : [] } }],
          neuron_id_or_subaccount: [{ Subaccount: subAccount.toUint8Array() }]
        }
      ]
    )

    return {
      actionType: ICPActionType.FOLLOW_NEURON,
      encoded: arrayBufferToHexString(unsignedTransactionBuffer)
    }
  })
}

export function getDetailsFromUnsignedFollowNeuron(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for FollowNeuron
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const Follow = IDL.Record({
    topic: IDL.Int32,
    followees: IDL.Vec(NeuronId)
  })
  const Command = IDL.Variant({
    Follow: Follow
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const manageNeuron = IDL.decode([ManageNeuron], hexStringToArrayBuffer(encoded))[0]
  const topicId = (manageNeuron as any).command[0].Follow.topic
  const topic = TOPICS.find(({ id }) => id.toString() === topicId.toString())

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.FOLLOW_NEURON,
      json: {
        ManageNeuron: idlDecodedToJsonStringifiable(manageNeuron)
      },
      extra: {
        labeled: topic ? { topic: topic.name } : undefined
      }
    }
  ]
}

export async function signFollowNeuron(unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  // unsignedTransaction has already the arguments needed for signing, just need to be in a Buffer
  const args = hexStringToArrayBuffer(unsignedTransaction)

  // Sign transaction
  const signedTransaction = signTransaction(privateKey, canisterId, args, 'manage_neuron', 'call')

  return signedTransaction
}

export function getDetailsFromSignedFollowNeuron(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for FollowNeuron
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const Follow = IDL.Record({
    topic: IDL.Int32,
    followees: IDL.Vec(NeuronId)
  })
  const Command = IDL.Variant({
    Follow: Follow
  })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const cborDecoded: any = Cbor.decode(hexStringToArrayBuffer(encoded))
  const manageNeuron = IDL.decode([ManageNeuron], cborDecoded.content.arg)[0]
  const topicId = (manageNeuron as any).command[0].Follow.topic
  const topic = TOPICS.find(({ id }) => id.toString() === topicId.toString())

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [network.governanceCanisterId],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.FOLLOW_NEURON,
      json: {
        ...cborDecoded.content,
        arg: idlDecodedToJsonStringifiable(manageNeuron)
      },
      extra: {
        labeled: topic ? { topic: topic.name } : undefined
      }
    }
  ]
}

// DISBURSE

// Cannot extrapolate method from call since we have to wait 6 months to do so

export async function prepareDisburse(publicKey: string): Promise<ICPTransaction[]> {
  // Create subaccount from publicKey
  const { subAccount, nonce: _ } = getFixedSubaccountFromPublicKey(publicKey)

  // IDL for Disburse
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const AccountIdentifier = IDL.Record({ hash: IDL.Vec(IDL.Nat8) })
  const Amount = IDL.Record({ e8s: IDL.Nat64 })

  const Disburse = IDL.Record({
    to_account: IDL.Opt(AccountIdentifier),
    amount: IDL.Opt(Amount)
  })

  const Command = IDL.Variant({
    Disburse: Disburse
  })

  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })

  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  // Encode
  const unsignedTransactionBuffer = IDL.encode(
    [ManageNeuron],
    [
      {
        id: [],
        command: [
          {
            Disburse: {
              to_account: [],
              amount: []
            }
          }
        ],
        neuron_id_or_subaccount: [{ Subaccount: subAccount.toUint8Array() }]
      }
    ]
  )

  return [
    {
      actionType: ICPActionType.DISBURSE,
      encoded: arrayBufferToHexString(unsignedTransactionBuffer)
    }
  ]
}

export function getDetailsFromUnsignedDisburse(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for Disburse
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const AccountIdentifier = IDL.Record({ hash: IDL.Vec(IDL.Nat8) })
  const Amount = IDL.Record({ e8s: IDL.Nat64 })

  const Disburse = IDL.Record({
    to_account: IDL.Opt(AccountIdentifier),
    amount: IDL.Opt(Amount)
  })

  const Command = IDL.Variant({
    Disburse: Disburse
  })

  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })

  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const manageNeuron = IDL.decode([ManageNeuron], hexStringToArrayBuffer(encoded))[0]

  return [
    {
      from: [network.governanceCanisterId],
      to: [getAddressFromPublicKey(publicKey)],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.DISBURSE,
      json: {
        ManageNeuron: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}

export async function signDisburse(unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  // unsignedTransaction has already the arguments needed for signing, just need to be in a Buffer
  const args = hexStringToArrayBuffer(unsignedTransaction)

  // Sign transaction
  const signedTransaction = signTransaction(privateKey, canisterId, args, 'manage_neuron', 'call')

  return signedTransaction
}

export function getDetailsFromSignedDisburse(
  encoded: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  // IDL for Disburse
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const AccountIdentifier = IDL.Record({ hash: IDL.Vec(IDL.Nat8) })
  const Amount = IDL.Record({ e8s: IDL.Nat64 })

  const Disburse = IDL.Record({
    to_account: IDL.Opt(AccountIdentifier),
    amount: IDL.Opt(Amount)
  })

  const Command = IDL.Variant({
    Disburse: Disburse
  })

  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })

  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const cborDecoded: any = Cbor.decode(hexStringToArrayBuffer(encoded))
  const manageNeuron = IDL.decode([ManageNeuron], cborDecoded.content.arg)[0]

  return [
    {
      from: [network.governanceCanisterId],
      to: [getAddressFromPublicKey(publicKey)],
      isInbound: false,
      amount: newAmount('0', 'blockchain'),
      fee: newAmount('0', 'blockchain'),
      network,
      type: ICPActionType.DISBURSE,
      json: {
        ...cborDecoded.content,
        arg: idlDecodedToJsonStringifiable(manageNeuron)
      }
    }
  ]
}
