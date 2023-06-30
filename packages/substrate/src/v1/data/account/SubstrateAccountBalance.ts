import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

export interface SubstrateAccountBalance {
  total: BigNumber
  existentialDeposit: BigNumber
  transferable: BigNumber // free (non-reserved part of the balance) - frozen (the amount that `free` + `reserved` may not drop below when reducing the balance)
}
