import { CosmosProtocol, IACMessageDefinitionObject, IACMessageType, MainProtocolSymbols, Serializer } from '../../../../packages/core/src'
import BigNumber from '../../../../packages/core/src/dependencies/src/bignumber.js-9.0.0/bignumber'
import * as BIP39 from '../../../../packages/core/src/dependencies/src/bip39-2.5.0/index'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

const seed: string = BIP39.mnemonicToSeed(mnemonic).toString('hex')

  (async () => {
    try {
      const protocol = new CosmosProtocol()
      // const secKey = await protocol.getPrivateKeyFromHexSecret(seed, protocol.standardDerivationPath)
      const pubKey = await protocol.getPublicKeyFromHexSecret(seed, protocol.standardDerivationPath)
      const address = await protocol.getAddressFromPublicKey(pubKey)
      let availableBalance = await protocol.getAvailableBalanceOfAddresses([address])
      availableBalance = (new BigNumber(availableBalance)).minus(10000).toFixed()
      const transaction = await protocol.prepareTransactionFromPublicKey(pubKey, ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6'], [availableBalance], new BigNumber(protocol.feeDefaults.medium).shiftedBy(protocol.decimals).toFixed())
      console.log(transaction)

      const signTransactionRequest: IACMessageDefinitionObject = {
        id: 'asdfdfgsdfgsdfgsdfg',
        type: IACMessageType.TransactionSignRequest,
        protocol: MainProtocolSymbols.COSMOS,
        payload: {
          transaction: transaction,
          publicKey: '1',
          callbackURL: '2'
        }
      }

      const serializer = new Serializer()
      const result = serializer.serialize([signTransactionRequest])
      console.log(result)

    } catch (error) {
      console.log(error)
    }
  })()
