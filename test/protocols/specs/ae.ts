import BigNumber from 'bignumber.js'
import { AEProtocol } from '../../../lib'
import { AEProtocolStub } from '../stubs/ae.stub'

const aeProtocol = {
  name: 'Aeternity',
  lib: new AEProtocol(),
  stub: new AEProtocolStub(),
  wallet: {
    privateKey:
      '7c9a774cf8855c0a89a00df3312cb1a3fb47d47829d3c92840e6a31b21434fa72d451a8abe91b3990b958097587de30216ceeb0e08102a4fe77c6ecb1cf9b42a',
    publicKey: '2d451a8abe91b3990b958097587de30216ceeb0e08102a4fe77c6ecb1cf9b42a',
    address: 'ak_LwMsF36UntQgAiQ21UeSuvNw8kbtfAec9C1FW15GQEFLL5pq1',
    tx: {
      amount: new BigNumber('10'),
      fee: new BigNumber('1')
    }
  },
  txs: [
    {
      /*
        HEX of Unsigned TX includes:
        sender_id: 'ak_LwMsF36UntQgAiQ21UeSuvNw8kbtfAec9C1FW15GQEFLL5pq1',
        recipient_id: 'ak_LwMsF36UntQgAiQ21UeSuvNw8kbtfAec9C1FW15GQEFLL5pq1',
        amount: 10,
        fee: 1,
        ttl: 60,
        payload: ''
      */
      unsignedTx: 'tx_51fEeKes4anDaKtLCXfJBhhQZS51o6YzfuypLsz2gkcqkzM9h6J9zBgcCt7HtUfWKNh2u85wgzP2HaL48KqznLNma4jKcjYu6QPAzggtEups6HPdf2',
      signedTx:
        'tx_66dpehQZhw1ptmWdjiWXB1u1Yo7JdEEXshXVkWXYk25ve9bJ2cd7oKVV3qwv3sQoXWnLsEa9yLRo8aK9YZxv86eEHQTqjuAYFYSMgT69aUrgwduHp7uc7Lu7x7VPgpaDbWLzKB3vGm42QDHCwEnw2C3CHADbTK9W5mKeqHHrkwjWLPN8RbvyjMz1TBSS1KQV2ZTgF6CW8qt7pVLA4ALFeBf'
    }
  ]
}

export { aeProtocol }
