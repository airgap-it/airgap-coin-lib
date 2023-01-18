import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

export interface SubstrateAccountBalance {
  total: BigNumber
  existentialDeposit: BigNumber
  transferable: BigNumber // free (non-reserved part of the balance) - misc_frozen (the amount that free may not drop below when withdrawing for anything except transaction fee payment)
  transferableCoveringFees: BigNumber // free - fee_frozen (the amount that free may not drop below when withdrawing specifically for transaction fee payment)
}
