import { KusamaProtocol } from './src'

export {}

const run = async () => {
  const address = 'EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X'

  const protocol = new KusamaProtocol()
  const transactionResult = await protocol.getTransactionsFromAddresses([address], 2)
  const nextTransactions = await protocol.getTransactionsFromAddresses([address], 2, transactionResult.cursor)

  console.log(JSON.stringify(transactionResult))
  console.log('------------------------------')
  console.log(JSON.stringify(nextTransactions))
}

run()
