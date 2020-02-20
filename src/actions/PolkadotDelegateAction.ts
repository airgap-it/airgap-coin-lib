import { AirGapMarketWallet } from "../wallet/AirGapMarketWallet"
import { Action } from "./Action"
import { IAirGapTransaction } from "../interfaces/IAirGapTransaction"
import BigNumber from "../dependencies/src/bignumber.js-9.0.0/bignumber"
import { Serializer } from "../serializer/serializer"
import { IACMessageType } from "../serializer/interfaces"
import { PolkadotProtocol } from "../protocols/polkadot/PolkadotProtocol"
import { PolkadotTransactionType } from "../protocols/polkadot/transaction/PolkadotTransaction"
import { PolkadotRewardDestination } from "../protocols/polkadot/staking/PolkadotRewardDestination"
import { RawPolkadotTransaction } from "../serializer/types"

function serializeTx(
    wallet: AirGapMarketWallet,
    transactions: RawPolkadotTransaction[]
): Promise<string[]> {
    const serializer = new Serializer()

    return serializer.serialize(transactions.map(transaction => (
        {
            protocol: wallet.coinProtocol.identifier,
            type: IACMessageType.TransactionSignRequest,
            payload: {
                publicKey: wallet.publicKey,
                transaction,
                callback: 'airgap-wallet://?d='
            }
        }  
    )))
}

export interface PolkadotDelegateActionContext {
    wallet: AirGapMarketWallet,
    controller: string,
    targets: string[],
    value: number | BigNumber,
    payee: string | PolkadotRewardDestination,
    fee: string | number | BigNumber
}

export interface PolkadotDelegateActionResult {
    rawTxs: RawPolkadotTransaction[],
    serializedTx: string[],
    airGapTxs: IAirGapTransaction[] | void,
    dataUrl: string
}

export class PolkadotDelegateAction<Context extends PolkadotDelegateActionContext> extends Action<PolkadotDelegateActionResult, Context> {
    
    protected async perform(): Promise<PolkadotDelegateActionResult> {
        if (this.context.wallet.protocolIdentifier === 'polkadot') {
            const protocol = new PolkadotProtocol()

            try {
                const txs = await protocol.prepareTransactionsFromPublicKey(
                    this.context.wallet.publicKey,
                    [{ 
                        type: PolkadotTransactionType.BOND,
                        fee: this.context.fee,
                        args: {
                            controller: this.context.controller,
                            value: this.context.value,
                            payee: this.context.payee
                        }
                    }, {
                        type: PolkadotTransactionType.NOMINATE,
                        fee: this.context.fee,
                        args: {
                            targets: this.context.targets
                        }
                    }]
                )

                const serializedTx = await serializeTx(this.context.wallet, txs)
                
                const airGapTxs = (await Promise.all(
                    txs.map(async tx => await protocol.getTransactionDetails({ 
                        publicKey: this.context.wallet.publicKey,
                        transaction: tx 
                    }))
                )).reduce((flattened, toFlatten) => flattened.concat(toFlatten), [])

                return {
                    rawTxs: txs,
                    serializedTx,
                    airGapTxs,
                    dataUrl: `airgap-vault://?d=${serializedTx.join(',')}`
                }
            } catch (error) {
                return Promise.reject(error)
            }
        } else {
            return Promise.reject('Invalid identifier')
        }
    }
}