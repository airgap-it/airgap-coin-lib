import { KeyPair } from '../../../../data/KeyPair'
import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '../../../../dependencies/src/bip39-2.5.0/index'
import * as bitcoinJS from '../../../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { OperationFailedError } from '../../../../errors'
import { Domain } from '../../../../errors/coinlib-error'
import { DelegatorAction } from '../../../ICoinDelegateProtocol'
import { SubstrateAccountController } from '../../common/SubstrateAccountController'
import { SubstrateAccountId } from '../../compat/SubstrateCompatAddress'
import { SubstrateNetwork } from '../../SubstrateNetwork'
import { MoonbeamAddress } from '../data/account/MoonbeamAddress'
import { MoonbeamBond } from '../data/staking/MoonbeamBond'
import { MoonbeamCollatorStatus } from '../data/staking/MoonbeamCollator'
import { MoonbeamCollatorDetails } from '../data/staking/MoonbeamCollatorDetails'
import { MoonbeamNominationDetails } from '../data/staking/MoonbeamNominationDetails'
import { MoonbeamNominatorStatus } from '../data/staking/MoonbeamNominator'
import { MoonbeamNominatorDetails } from '../data/staking/MoonbeamNominatorDetails'
import { MoonbeamStakingActionType } from '../data/staking/MoonbeamStakingActionType'
import { MoonbeamNodeClient } from '../node/MoonbeamNodeClient'

export class MoonbeamAccountController extends SubstrateAccountController<SubstrateNetwork.MOONBEAM, MoonbeamNodeClient> {
  public async createKeyPairFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<KeyPair> {
    const secret = mnemonicToSeed(mnemonic || '', password)

    return this.createKeyPairFromHexSecret(Buffer.from(secret).toString('hex'), derivationPath)
  }

  public async createKeyPairFromHexSecret(secret: string, derivationPath: string): Promise<KeyPair> {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, bitcoinJS.networks.bitcoin)
    const hdNode = ethereumNode.derivePath(derivationPath)

    return {
      privateKey: hdNode.keyPair.d.toBuffer(32),
      publicKey: hdNode.neutered().getPublicKeyBuffer().toString('hex')
    }
  }

  public async createAddressFromPublicKey(publicKey: string): Promise<MoonbeamAddress> {
    return MoonbeamAddress.from(publicKey)
  }

  public async isNominating(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<boolean> {
    const nominatorState = await this.nodeClient.getNominatorState(MoonbeamAddress.from(accountId))

    return nominatorState ? nominatorState.nominations.elements.length > 0 : false
  }

  public async getMinNominationAmount(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<string> {
    const isNominating = await this.isNominating(accountId)
    const minAmount = isNominating ? await this.nodeClient.getMinNomination() : await this.nodeClient.getMinNominatorStake()
    if (!minAmount) {
      throw new OperationFailedError(Domain.SUBSTRATE, 'Could not fetch network constants')
    }

    return minAmount.toFixed()
  }

  public async getCurrentCollators(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<string[]> {
    const nominatorState = await this.nodeClient.getNominatorState(MoonbeamAddress.from(accountId))
    if (nominatorState) {
      return nominatorState.nominations.elements.map((collatorDetails) => collatorDetails.owner.asAddress())
    }

    return []
  }

  public async getNominatorDetails(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<MoonbeamNominatorDetails> {
    const address = MoonbeamAddress.from(accountId)
    const results = await Promise.all([this.getBalance(address), this.nodeClient.getNominatorState(address)])

    const balance = results[0]
    const nominatorState = results[1]

    if (!balance) {
      return Promise.reject('Could not fetch nominator details.')
    }

    const totalBond = nominatorState?.total.value ?? new BigNumber(0)

    let status: MoonbeamNominatorDetails['status']
    switch (nominatorState?.status.value) {
      case MoonbeamNominatorStatus.ACTIVE:
        status = 'Active'
        break
      case MoonbeamNominatorStatus.LEAVING:
        status = 'Leaving'
        break
    }

    return {
      address: address.getValue(),
      balance: balance.toString(),
      totalBond: totalBond.toString(),
      delegatees: nominatorState?.nominations.elements.map((bond) => bond.owner.asAddress()) ?? [],
      availableActions: await this.getStakingActions(nominatorState?.nominations.elements ?? []),
      status
    }
  }

  public async getCollatorDetails(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<MoonbeamCollatorDetails> {
    const address = MoonbeamAddress.from(accountId)
    const results = await Promise.all([this.nodeClient.getCollatorState(address), this.nodeClient.getCollatorCommission()])

    const collatorState = results[0]
    const commission = results[1]

    if (!collatorState || !commission) {
      return Promise.reject('Could not fetch collator details.')
    }

    let status: MoonbeamCollatorDetails['status']
    switch (collatorState.status.value) {
      case MoonbeamCollatorStatus.ACTIVE:
        status = 'Active'
        break
      case MoonbeamCollatorStatus.IDLE:
        status = 'Idle'
        break
      case MoonbeamCollatorStatus.LEAVING:
        status = 'Leaving'
    }

    // top nominators are already sorted (https://github.com/PureStake/moonbeam/blob/v0.13.2/pallets/parachain-staking/src/lib.rs#L152)
    const topNominations = collatorState.topNominators.elements.map((bond) => bond.amount.value)

    return {
      address: address.getValue(),
      status,
      minEligibleBalance: topNominations[topNominations.length - 1].toString(),
      ownStakingBalance: collatorState.bond.toString(),
      totalStakingBalance: collatorState.totalBacking.toString(),
      commission: commission.dividedBy(1_000_000_000).toString(), // commission is Perbill (parts per billion)
      nominators: collatorState.nominators.elements.length
    }
  }

  public async getNominationDetails(
    accountId: SubstrateAccountId<MoonbeamAddress>,
    collator: SubstrateAccountId<MoonbeamAddress>
  ): Promise<MoonbeamNominationDetails> {
    const address = MoonbeamAddress.from(accountId)
    const results = await Promise.all([
      this.getBalance(address),
      this.nodeClient.getNominatorState(address),
      this.getCollatorDetails(collator)
    ])

    const balance = results[0]
    const nominatorState = results[1]
    const collatorDetails = results[2]

    if (!balance || !collatorDetails) {
      return Promise.reject('Could not fetch nomination details.')
    }

    const bond = nominatorState?.nominations.elements.find((bond) => bond.owner.compare(collator) === 0)?.amount.value ?? new BigNumber(0)
    const totalBond = nominatorState?.total.value ?? new BigNumber(0)

    let status: MoonbeamNominatorDetails['status']
    switch (nominatorState?.status.value) {
      case MoonbeamNominatorStatus.ACTIVE:
        status = 'Active'
        break
      case MoonbeamNominatorStatus.LEAVING:
        status = 'Leaving'
        break
    }

    const nominatorDetails = {
      address: address.getValue(),
      balance: balance.toString(),
      totalBond: totalBond.toString(),
      delegatees: nominatorState?.nominations.elements.map((bond) => bond.owner.asAddress()) ?? [],
      availableActions: await this.getStakingActions(nominatorState?.nominations.elements ?? [], collatorDetails),
      status
    }

    return {
      nominatorDetails,
      collatorDetails,
      bond: bond.toString()
    }
  }

  private async getStakingActions(nominations: MoonbeamBond[], collator?: MoonbeamCollatorDetails): Promise<DelegatorAction[]> {
    const actions: DelegatorAction[] = []

    const maxCollators = await this.nodeClient.getMaxCollatorsPerNominator()

    const canNominateCollator =
      maxCollators?.gt(nominations.length) && collator && !nominations.some((bond) => bond.owner.compare(collator.address) === 0)

    const isNominatingCollator = collator && nominations.some((bond) => bond.owner.compare(collator.address) === 0)

    if (canNominateCollator) {
      actions.push({
        type: MoonbeamStakingActionType.NOMINATE,
        args: ['collator', 'amount']
      })
    }

    if (nominations.length > 0) {
      actions.push({
        type: MoonbeamStakingActionType.CANCEL_ALL_NOMINATIONS
      })

      if (isNominatingCollator) {
        actions.push(
          {
            type: MoonbeamStakingActionType.BOND_MORE,
            args: ['candidate', 'more']
          },
          {
            type: MoonbeamStakingActionType.BOND_LESS,
            args: ['candidate', 'less']
          },
          {
            type: MoonbeamStakingActionType.CANCEL_NOMINATION,
            args: ['collator']
          }
        )
      }
    }

    return actions
  }
}
