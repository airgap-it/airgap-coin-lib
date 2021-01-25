// tslint:disable:no-console
// tslint:disable:no-any

import { ICoinProtocol } from '../../../packages/core/src'

export const send: (protocol: ICoinProtocol, mnemonic: string, recipient: string, amount: string, fee: string) => Promise<string> = async (
  protocol: ICoinProtocol,
  mnemonic: string,
  recipient: string,
  amount: string,
  fee: string
): Promise<string> => {
  const publicKey: string = await protocol.getPublicKeyFromMnemonic(mnemonic, protocol.standardDerivationPath)
  const address: string = await protocol.getAddressFromPublicKey(publicKey)

  console.log(`Our own address is ${address}: ${await protocol.getBlockExplorerLinkForAddress(address)}`)

  const privateKey: Buffer = await protocol.getPrivateKeyFromMnemonic(mnemonic, protocol.standardDerivationPath)
  const unsignedTx: any = await protocol.prepareTransactionFromPublicKey(publicKey, [recipient], [amount], fee)
  // console.log(`Unsigned transaction: ${JSON.stringify(unsignedTx, null, 2)}`)
  const signedTx: string = await protocol.signWithPrivateKey(privateKey, unsignedTx)
  // console.log(`Signed transaction: ${signedTx}`)

  return signedTx

  // The broadcasting of the signed transaction has been commented out to prevent accidental spending

  // const txHash: string = await protocol.broadcastTransaction(signedTx)
  // const blockexplorer: string = await protocol.getBlockExplorerLinkForTxId(txHash)

  // console.log(`Broadcast successfully: ${blockexplorer}`)

  // return txHash
}
