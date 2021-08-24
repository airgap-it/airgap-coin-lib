import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { SCALEAccountId } from '../../common/data/scale/type/SCALEAccountId'
import { SCALEArray } from '../../common/data/scale/type/SCALEArray'
import { SCALEInt } from '../../common/data/scale/type/SCALEInt'
import { SubstrateNodeClient } from '../../common/node/SubstrateNodeClient'
import { SubstrateNetwork } from '../../SubstrateNetwork'
import { MoonbeamAddress } from '../data/account/MoonbeamAddress'
import { MoonbeamCollator } from '../data/staking/MoonbeamCollator'
import { MoonbeamNominator } from '../data/staking/MoonbeamNominator'

export class MoonbeamNodeClient extends SubstrateNodeClient<SubstrateNetwork.MOONBEAM> {
  public async getCollators(): Promise<MoonbeamAddress[] | null> {
    return this.fromStorage('ParachainStaking', 'SelectedCandidates').then((items) =>
      items
        ? SCALEArray.decode(this.network, this.runtimeVersion, items, (network, _, hex) =>
            SCALEAccountId.decode(network, hex, 20)
          ).decoded.elements.map((encoded) => encoded.address)
        : null
    )
  }

  public async getNominatorState(address: MoonbeamAddress): Promise<MoonbeamNominator | null> {
    return this.fromStorage('ParachainStaking', 'NominatorState2', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? MoonbeamNominator.decode(this.runtimeVersion, item) : null
    )
  }

  public async getCollatorState(address: MoonbeamAddress): Promise<MoonbeamCollator | null> {
    return this.fromStorage('ParachainStaking', 'CollatorState2', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? MoonbeamCollator.decode(this.runtimeVersion, item) : null
    )
  }

  public async getCollatorCommission(): Promise<BigNumber | null> {
    return this.fromStorage('ParachainStaking', 'CollatorCommission').then((item) =>
      item ? SCALEInt.decode(item, 32).decoded.value : null
    )
  }

  public async getMaxNominatorsPerCollator(): Promise<BigNumber | null> {
    return this.getConstant('ParachainStaking', 'MaxNominatorsPerCollator').then((item) =>
      item ? SCALEInt.decode(item, 32).decoded.value : null
    )
  }

  public async getMaxCollatorsPerNominator(): Promise<BigNumber | null> {
    return this.getConstant('ParachainStaking', 'MaxCollatorsPerNominator').then((item) =>
      item ? SCALEInt.decode(item, 32).decoded.value : null
    )
  }

  public async getMinNomination(): Promise<BigNumber | null> {
    return this.getConstant('ParachainStaking', 'MinNomination').then((item) => (item ? SCALEInt.decode(item).decoded.value : null))
  }

  public async getMinNominatorStake(): Promise<BigNumber | null> {
    return this.getConstant('ParachainStaking', 'MinNominatorStk').then((item) => (item ? SCALEInt.decode(item).decoded.value : null))
  }
}
