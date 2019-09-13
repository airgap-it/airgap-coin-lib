// import { EthereumNodeClient } from './NodeClient'
// import * as Web3 from 'web3'
// import { BigNumber } from 'bignumber.js'

// export class Web3NodeClient extends EthereumNodeClient {

//   private static contractABI = [
//     {
//       constant: true,
//       inputs: [
//         {
//           name: '_owner',
//           type: 'address'
//         }
//       ],
//       name: 'balanceOf',
//       outputs: [
//         {
//           name: 'balance',
//           type: 'uint256'
//         }
//       ],
//       payable: false,
//       type: 'function'
//     },
//     {
//       constant: false,
//       inputs: [
//         {
//           name: '_to',
//           type: 'address'
//         },
//         {
//           name: '_value',
//           type: 'uint256'
//         }
//       ],
//       name: 'transfer',
//       outputs: [
//         {
//           name: 'success',
//           type: 'bool'
//         }
//       ],
//       payable: false,
//       type: 'function'
//     }
//   ]

//   private web3: any

//   constructor(baseURL: string) {
//     super(baseURL)
//     this.web3 = new Web3(new Web3.providers.HttpProvider(this.baseURL))
//   }

//   public async fetchBalance(address: string): Promise<BigNumber> {
//     const result = await this.web3.eth.getBalance(address)
//     return new BigNumber(result)
//   }

//   public async fetchTransactionCount(address: string): Promise<number> {
//     return await this.web3.eth.getTransactionCount(address)
//   }

//   public async sendSignedTransaction(transaction: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//       this.web3.eth
//         .sendSignedTransaction(`0x${transaction}`)
//         .then(receipt => {
//           resolve(receipt.transactionHash)
//         })
//         .catch(err => {
//           reject(err)
//         })
//     })
//   }

//   public async callBalanceOf(contractAddress: string, address: string): Promise<BigNumber> {
//     const contract = new this.web3.eth.Contract(Web3NodeClient.contractABI as any, contractAddress)
//     return new BigNumber(await contract.methods.balanceOf(address).call())
//   }

//   public async estimateTransferGas(contractAddress: string, fromAddress: string, toAddress: string, hexAmount: string): Promise<number> {
//     const contract = new this.web3.eth.Contract(Web3NodeClient.contractABI as any, contractAddress)
//     return await contract.methods.transfer(toAddress, hexAmount).estimateGas({from: fromAddress})
//   }
// }
