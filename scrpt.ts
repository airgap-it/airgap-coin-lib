import { ICoinProtocol } from './dist/protocols/ICoinProtocol.d'
import { AirGapMarketWallet } from './src/wallet/AirGapMarketWallet'
import { CosmosProtocol } from './src/protocols/cosmos/CosmosProtocol'
import { AirGapWalletPriceService, TimeUnit, MarketDataSample } from './dist/wallet/AirGapMarketWallet'
import { BigNumber } from './src/dependencies/src/big-integer-1.6.45/BigInteger'

const protocol = new CosmosProtocol()

class AirGapPriceService implements AirGapWalletPriceService {
  public async getCurrentMarketPrice(protocol: ICoinProtocol, baseSymbol: string): Promise<BigNumber> {
    throw new Error('Method not implemented.')
  }
  public async getMarketPricesOverTime(
    protocol: ICoinProtocol,
    timeUnit: TimeUnit,
    numberOfMinutes: number,
    date: Date,
    baseSymbol: string
  ): Promise<MarketDataSample[]> {
    throw new Error('Method not implemented.')
  }
}

const run = async () => {
  const getWalletWithAddresses = () => {
    const wallet = new AirGapMarketWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath,
      new AirGapPriceService()
    )
    wallet.addresses = ['0x5e4e92788a7aE425100D869657aE91891af019BC']
    return wallet
  }
}

run()
