import { EthereumProtocol } from '../../../../packages/ethereum/src'

const address = '0x73494BCb0865a72fD03cb3242e4C7b48688c0fEb'
const protocol = new EthereumProtocol()

protocol.getBalanceOfAddresses([address]).then((balance) => {
  console.log('Balance: ' + balance)
})
