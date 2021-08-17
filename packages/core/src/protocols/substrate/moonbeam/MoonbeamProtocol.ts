import { BigNumber } from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { ConditionViolationError, UnsupportedError } from '../../../errors'
import { Domain } from '../../../errors/coinlib-error'
import { RawSubstrateTransaction } from '../../../serializer/types'
import { assertFields } from '../../../utils/assert'
import { DelegateeDetails, DelegationDetails, DelegatorDetails } from '../../ICoinDelegateProtocol'
import { SubstrateTransactionType } from '../common/data/transaction/SubstrateTransaction'
import { SubstrateAccountId } from '../compat/SubstrateCompatAddress'
import { SubstrateDelegateProtocol } from '../SubstrateDelegateProtocol'
import { SubstrateNetwork } from '../SubstrateNetwork'
import { MoonbeamAddress } from './data/account/MoonbeamAddress'
import { MoonbeamStakingActionType } from './data/staking/MoonbeamStakingActionType'

import { MoonbeamProtocolOptions } from './MoonbeamProtocolOptions'

export abstract class MoonbeamProtocol extends SubstrateDelegateProtocol<SubstrateNetwork.MOONBEAM> {
  public standardDerivationPath: string = `m/44'/60'/0'/0/0`

  public addressValidationPattern: string = '^0x[a-fA-F0-9]{40}$'
  public addressPlaceholder: string = `0xabc...`

  public defaultValidator?: string

  public constructor(public readonly options: MoonbeamProtocolOptions) {
    super(options)
  }

  public async getDefaultDelegatee(): Promise<string> {
    if (this.defaultValidator) {
      return this.defaultValidator
    }
    const collators: MoonbeamAddress[] | null = await this.options.nodeClient.getCollators()

    return collators ? collators[0].getValue() : ''
  }

  public async getCurrentDelegateesForPublicKey(publicKey: string): Promise<string[]> {
    return this.options.accountController.getCurrentCollators(publicKey)
  }

  public async getCurrentDelegateesForAddress(address: string): Promise<string[]> {
    return this.options.accountController.getCurrentCollators(address)
  }

  public async getDelegateeDetails(address: string): Promise<DelegateeDetails> {
    const collatorDetails = await this.options.accountController.getCollatorDetails(address)

    return {
      name: collatorDetails.name ?? '',
      status: collatorDetails.status ?? '',
      address: collatorDetails.address
    }
  }

  public async isPublicKeyDelegating(publicKey: string): Promise<boolean> {
    return this.options.accountController.isNominating(publicKey)
  }

  public async isAddressDelegating(address: string): Promise<boolean> {
    return this.options.accountController.isNominating(address)
  }

  public async getDelegatorDetailsFromPublicKey(publicKey: string): Promise<DelegatorDetails> {
    return this.options.accountController.getNominatorDetails(publicKey)
  }

  public async getDelegatorDetailsFromAddress(address: string): Promise<DelegatorDetails> {
    return this.options.accountController.getNominatorDetails(address)
  }

  public async getDelegationDetailsFromPublicKey(publicKey: string, delegatees: string[]): Promise<DelegationDetails> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegationDetailsFromAddress(address.getValue(), delegatees)
  }

  public async getDelegationDetailsFromAddress(address: string, delegatees: string[]): Promise<DelegationDetails> {
    if (delegatees.length > 1) {
      throw new UnsupportedError(Domain.SUBSTRATE, 'Multiple validators for a single delegation are not supported')
    }

    const collator = delegatees[0]
    const nominationDetails = await this.options.accountController.getNominationDetails(address, collator)

    return {
      delegator: nominationDetails.nominatorDetails,
      delegatees: [nominationDetails.collatorDetails]
    }
  }

  public async prepareDelegatorActionFromPublicKey(publicKey: string, type: any, data?: any): Promise<any[]> {
    if (!data) {
      data = {}
    }

    switch (type) {
      case MoonbeamStakingActionType.NOMINATE:
        assertFields(`${MoonbeamStakingActionType[type]} action`, data, 'collator', 'amount')

        return this.prepareNomination(publicKey, data.tip ?? 0, data.collator, data.amount)
      case MoonbeamStakingActionType.BOND_MORE:
        assertFields(`${MoonbeamStakingActionType[type]} action`, data, 'candidate', 'more')

        return this.prepareNominatorBondMore(publicKey, data.tip ?? 0, data.candidate, data.more)

      case MoonbeamStakingActionType.BOND_LESS:
        assertFields(`${MoonbeamStakingActionType[type]} action`, data, 'candidate', 'less')

        return this.prepareNominatorBondLess(publicKey, data.tip ?? 0, data.candidate, data.less)
      case MoonbeamStakingActionType.CANCEL_NOMINATION:
        assertFields(`${MoonbeamStakingActionType[type]} action`, data, 'collator')

        return this.prepareCancelNomination(publicKey, data.tip ?? 0, data.collator)
      case MoonbeamStakingActionType.CANCEL_ALL_NOMINATIONS:
        return this.prepareCancelAllNominations(publicKey, data.tip ?? 0)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, 'Unsupported delegator action.')
    }
  }

  public async prepareNomination(
    publicKey: string,
    tip: string | number | BigNumber,
    collator: string,
    amount: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const requestedAmount = new BigNumber(amount)
    const minAmount = await this.getMinDelegationAmount(publicKey)
    if (requestedAmount.lt(minAmount)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `The amount is too low, it has to be at least ${minAmount.toString()}`)
    }

    const results = await Promise.all([
      this.options.accountController.getNominatorDetails(publicKey),
      this.options.accountController.getCollatorDetails(collator),
      this.options.nodeClient.getMaxNominatorsPerCollator(),
      this.options.nodeClient.getMaxCollatorsPerNominator(),
      this.getBalanceOfPublicKey(publicKey)
    ])

    const nominatorDetails = results[0]
    const collatorDetails = results[1]
    const maxNominators = results[2]
    const maxCollators = results[3]
    const balance = results[4]

    if (maxNominators?.lte(collatorDetails.nominators)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, 'This collator cannot have more nominators.')
    }

    if (maxCollators?.lte(nominatorDetails.delegatees.length)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, 'This nominator cannot nominate more collators.')
    }

    const available = new BigNumber(balance).minus(amount)
    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, available, [
      {
        type: SubstrateTransactionType.M_NOMINATE,
        tip,
        args: {
          collator,
          amount: new BigNumber(amount),
          collatorNominatorCount: collatorDetails.nominators,
          nominationCount: nominatorDetails.delegatees.length
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareCancelNomination(
    publicKey: string,
    tip: string | number | BigNumber,
    collator: string
  ): Promise<RawSubstrateTransaction[]> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_REVOKE_NOMINATION,
        tip,
        args: {
          collator
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareCancelAllNominations(publicKey: string, tip: string | number | BigNumber): Promise<RawSubstrateTransaction[]> {
    const results = await Promise.all([
      this.options.accountController.getNominatorDetails(publicKey),
      this.getBalanceOfPublicKey(publicKey)
    ])

    const nominatorDetails = results[0]
    const balance = results[1]

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_LEAVE_NOMINATORS,
        tip,
        args: {
          nominationCount: nominatorDetails.delegatees.length
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareNominatorBondMore(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string,
    more: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const available = new BigNumber(balance).minus(more)
    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, available, [
      {
        type: SubstrateTransactionType.M_NOMINATOR_BOND_MORE,
        tip,
        args: {
          candidate,
          more: new BigNumber(more)
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareNominatorBondLess(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string,
    less: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const [balance, nominationDetails] = await Promise.all([
      this.getBalanceOfPublicKey(publicKey),
      this.options.accountController.getNominationDetails(publicKey, candidate)
    ])
    const bondAmount = new BigNumber(nominationDetails.bond)
    const requestedAmount = new BigNumber(less)
    if (requestedAmount.gt(bondAmount)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, 'Bond less amount too high')
    } else if (requestedAmount.eq(bondAmount)) {
      return this.prepareCancelNomination(publicKey, tip, candidate)
    }

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_NOMINATOR_BOND_LESS,
        tip,
        args: {
          candidate,
          less: requestedAmount
        }
      }
    ])

    return [{ encoded }]
  }

  public async getMinDelegationAmount(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<string> {
    return this.options.accountController.getMinNominationAmount(accountId)
  }

  public async getFutureRequiredTransactions(
    accountId: SubstrateAccountId<MoonbeamAddress>,
    intention: 'check' | 'transfer' | 'delegate'
  ): Promise<[SubstrateTransactionType, any][]> {
    const results = await Promise.all([
      this.options.accountController.isNominating(accountId),
      this.options.accountController.getTransferableBalance(accountId),
      this.options.accountController.getTransferableBalance(accountId, false, false)
    ])

    const isNominating = results[0]
    const transferableBalance = results[1]
    const stakingBalance = results[2]

    const requiredTransactions: [SubstrateTransactionType, any][] = []

    if (intention === 'transfer') {
      requiredTransactions.push([
        SubstrateTransactionType.TRANSFER,
        {
          to: MoonbeamAddress.getPlaceholder(),
          value: transferableBalance
        }
      ])
    }
    if (!isNominating && intention === 'delegate') {
      // not delegated
      requiredTransactions.push(
        [
          SubstrateTransactionType.M_NOMINATE,
          {
            collator: MoonbeamAddress.getPlaceholder(),
            amount: stakingBalance,
            collatorNominatorCount: 0,
            nominationCount: 0
          }
        ],
        [
          SubstrateTransactionType.M_REVOKE_NOMINATION,
          {
            collator: MoonbeamAddress.getPlaceholder()
          }
        ]
      )
    }

    if (isNominating && intention === 'delegate') {
      requiredTransactions.push([
        SubstrateTransactionType.M_REVOKE_NOMINATION,
        {
          collator: MoonbeamAddress.getPlaceholder()
        }
      ])
    }

    return requiredTransactions
  }
}
