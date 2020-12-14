import { TezosFA2Protocol, TezosProtocolNetwork, TezosFA2ProtocolConfig, SubProtocolSymbols, TezosFA2ProtocolOptions, NetworkType } from "../../../../src"

(
    async () => {
        const network = new TezosProtocolNetwork('delphinet', NetworkType.TESTNET, 'https://tezos-delphinet-node.qa.gke.papers.tech')
        const config = new TezosFA2ProtocolConfig('myTz', 'TestFA2', 'myTz', 'xtz-generic-fa2' as SubProtocolSymbols, 'KT1Eso7AdpjrHd4rCz9rGxf92tSm3fEDAkdx', { low: '0.001420', medium: '0.001520', high: '0.003000' }, 6)
        const options = new TezosFA2ProtocolOptions(network, config)
        const fa2 = new TezosFA2Protocol(options);
        const publicKey = await fa2.getPublicKeyFromMnemonic('MY MNEMONIC', 'm/44h/1729h/0h/0h');
        const secretKey = await fa2.getPrivateKeyFromMnemonic('MY MNEMONIC', 'm/44h/1729h/0h/0h');
        // get balance
        const balance = await fa2.balanceOf([{
            address: 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT',
            tokenID: 0
        }])
        // prepare a transfer:
        const transferRequests = [{
            from: 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT',
            txs: [
                {
                    to: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L',
                    amount: '100',
                    tokenID: 0
                }
            ]
        }]
        const transfer = await fa2.transfer(transferRequests, '1520', publicKey)
        // sign the transfer
        const transaction = await fa2.signWithPrivateKey(secretKey, transfer)
        // broadcast the transfer
        const transactionHash = await fa2.broadcastTransaction(transaction)
    }
)()

