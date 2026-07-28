import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Balance, UnsignedTransaction } from '@airgap/module-kit'
import { expect } from 'chai'

import { IntegrationBalanceExpectation, IntegrationCoin, IntegrationPrepareFixture } from './types'

export function assertBalanceShape(balance: Balance<string>): void {
  expect(balance).to.have.property('total')
  expect(balance.total).to.have.property('value')
  expect(balance.total).to.have.property('unit')
}

export function assertBalanceValue(balance: Balance<string>, expectation: IntegrationBalanceExpectation, live: boolean): void {
  assertBalanceShape(balance)

  const value = new BigNumber(balance.total.value)

  if (!live && expectation.exact !== undefined) {
    expect(balance.total.value).to.equal(expectation.exact)
    return
  }

  const min = new BigNumber(expectation.min ?? '0')
  expect(value.gte(min), `balance ${balance.total.value} should be >= ${min.toString(10)}`).to.equal(true)
}

export function assertPreparedTx(
  preparedTx: UnsignedTransaction,
  coin: IntegrationCoin,
  fixture: IntegrationPrepareFixture,
  live: boolean
): void {
  expect(preparedTx).to.have.property('type', 'unsigned')

  switch (coin) {
    case 'btc':
      expect(preparedTx).to.have.property('ins')
      expect(preparedTx).to.have.property('outs')
      if (!live && fixture.unsignedTx !== undefined) {
        expect(preparedTx).to.deep.include(fixture.unsignedTx)
      }
      break
    case 'eth':
      expect(preparedTx).to.have.property('ethereumType')
      expect(preparedTx).to.have.property('to')
      expect(preparedTx).to.have.property('value')
      if (!live && fixture.unsignedTx !== undefined) {
        expect(preparedTx).to.deep.include(fixture.unsignedTx)
      }
      break
    case 'polkadot':
    case 'acurast':
      expect(preparedTx).to.have.property('encoded')
      expect((preparedTx as { encoded?: string }).encoded).to.be.a('string').that.is.not.empty
      if (!live && fixture.unsignedTx !== undefined) {
        expect(preparedTx).to.deep.include(fixture.unsignedTx)
      }
      break
    default:
      throw new Error(`Unsupported coin: ${coin}`)
  }
}
