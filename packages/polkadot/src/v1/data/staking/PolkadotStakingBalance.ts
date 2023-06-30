import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

export interface PolkadotStakingBalance<_Amount = BigNumber> {
  bonded: _Amount
  unlocking: _Amount
}
