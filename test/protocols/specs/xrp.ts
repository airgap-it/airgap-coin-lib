import BigNumber from 'bignumber.js'
import { XrpProtocolStub } from '../stubs/xrp.stub'
import { XrpProtocol } from '../../../lib'
import { TestProtocolSpec } from '../implementations'

export class XrpTestProtocolSpec extends TestProtocolSpec {
  name = 'XRP'
  lib = new XrpProtocol()
  stub = new XrpProtocolStub()
  validAddresses = [
    'rPqinHN9D82L6TvpFNyFRH3AUvPSigAJ7r',
    'r3m9qXwzLMLsBZc7E6pgRFC41jxiBhmGz2',
    'rBE3pP9UjYHeMYWHpWQZi4e3nA2VNnAJGZ',
    'rBy2iAQMWCkrExgsA5tQyu5ziMMrH4yHaK',
    'rfHd7RpgQjw4MFJuCEwVT3fefx6sB8vpsv',
    'rhJym6u7Rk21SSpKtiUjUqKzUCPEDsCDi6',
    'rUzGbZe2sUYWevAb5v18DgeYGjx4LkhJuf',
    'rU2C5J4RJAbZrz4aGeFWg5m2WpgwNAYDKb',
    'rNdpX3Zr6A4eyNTPV6Q6tkqb1DHqCqtrir',
    'rn4fc8j7rqLdqX9L26ACjVCNwPD74huT4Q'
  ]
  wallet = {
    privateKey: '59fcbe4c2471d9fda3c9695e3cbed1be86a2e34ad8d8dd2b425e1fc2161b88a7',
    publicKey: '036b4b11ade765968ffd1e602b469ea3b7f1db7614663e4de05df986b3054920d8',
    addresses: ['r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT']
  }
  txs = [
    // ???: Currently the tests always take the first transaction input data -> so use just one simple transaction without destination tag
    // TODO: Change/refactor ?
    {
      amount: new BigNumber(20000),
      fee: new BigNumber(0.1),
      to: ['r3m9qXwzLMLsBZc7E6pgRFC41jxiBhmGz2'],
      from: ['r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT'],
      unsignedTx: {
        fee: 0.1,
        account: 'r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT',
        amount: 20000,
        destination: 'r3m9qXwzLMLsBZc7E6pgRFC41jxiBhmGz2',
        destinationTag: undefined,
        sequence: 1,
        transactionType: 'Payment',
        maxLedgerVersion: 142,
        memos: []
      },
      signedTx:
        '12000022800000002400000001201B0000008E6140000004A817C8006840000000000186A07321036B4B11ADE765968FFD1E602B469EA3B7F1DB7614663E4DE05DF986B3054920D874463044022063695F968769B2E51DC2A675AF6D2C9ECB3D57A62864E33D772254C6644CEA3002201DFB4B2A799445B3E683748C1B8EFCB76DAFD2898893AB208E3CD663C9F428F38114EDF980AA3378DD0D1D927A14C7DBDE1B0F803C4D831455228F271541AF23A67905B561B3FC69F5A9BABF'
    }
    // // transaction with destinagtion tag
    // {
    //   amount: new BigNumber(124),
    //   fee: new BigNumber(0.4),
    //   to: ['rBE3pP9UjYHeMYWHpWQZi4e3nA2VNnAJGZ'],
    //   from: ['r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT'],
    //   unsignedTx: {
    //     fee: 0.4,
    //     account: 'r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT',
    //     amount: 124,
    //     destination: 'rBE3pP9UjYHeMYWHpWQZi4e3nA2VNnAJGZ',
    //     destinationTag: 42,
    //     sequence: 1,
    //     transactionType: 'Payment',
    //     maxLedgerVersion: 142,
    //     memos: []
    //   },
    //   signedTx:
    //     '12000022800000002400000001201B0000008E6140000004A817C8006840000000000F42407321036B4B11ADE765968FFD1E602B469EA3B7F1DB7614663E4DE05DF986B3054920D87447304502210099DF6D6F9759768353B18D4190A01362C627FDBD90624FB632E25996378511B602206476C77065F4E69ED9C462D92EE1EB457B19A434182FB6B7E4F1700C227F2DF98114EDF980AA3378DD0D1D927A14C7DBDE1B0F803C4D831455228F271541AF23A67905B561B3FC69F5A9BABF'
    // },
    // // transaction with memos
    // {
    //   amount: new BigNumber(100),
    //   fee: new BigNumber(0.00001),
    //   to: ['r3m9qXwzLMLsBZc7E6pgRFC41jxiBhmGz2'],
    //   from: ['r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT'],
    //   unsignedTx: {
    //     fee: 0.00001,
    //     account: 'r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT',
    //     amount: 100,
    //     destination: 'r3m9qXwzLMLsBZc7E6pgRFC41jxiBhmGz2',
    //     destinationTag: undefined,
    //     sequence: 1,
    //     transactionType: 'Payment',
    //     maxLedgerVersion: 142,
    //     memos: [
    //       {
    //         data: "the revolution will be televised right here on Jungle Inc.",
    //         format: "text/plain",
    //         type: "truth"
    //       },
    //       {
    //         data: "for getting me that pizza",
    //         format: undefined,
    //         type: undefined
    //       }
    //   ]
    //   },
    //   signedTx:
    //     '12000022800000002400000001201B0000008E6140000004A817C8006840000000000F42407321036B4B11ADE765968FFD1E602B469EA3B7F1DB7614663E4DE05DF986B3054920D87447304502210099DF6D6F9759768353B18D4190A01362C627FDBD90624FB632E25996378511B602206476C77065F4E69ED9C462D92EE1EB457B19A434182FB6B7E4F1700C227F2DF98114EDF980AA3378DD0D1D927A14C7DBDE1B0F803C4D831455228F271541AF23A67905B561B3FC69F5A9BABF'
    // },
    // transaction with memos and destination tag
    // {
    //   amount: new BigNumber(100),
    //   fee: new BigNumber(0.00001),
    //   to: ['r3m9qXwzLMLsBZc7E6pgRFC41jxiBhmGz2'],
    //   from: ['r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT'],
    //   unsignedTx: {
    //     fee: 0.00001,
    //     account: 'r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT',
    //     amount: 100,
    //     destination: 'r3m9qXwzLMLsBZc7E6pgRFC41jxiBhmGz2',
    //     destinationTag: 42,
    //     sequence: 1,
    //     transactionType: 'Payment',
    //     maxLedgerVersion: 142,
    //     memos: [
    //       {
    //         data: "the revolution will be televised right here on Jungle Inc.",
    //         format: "text/plain",
    //         type: "truth"
    //       },
    //       {
    //         data: "for getting me that pizza",
    //         format: undefined,
    //         type: undefined
    //       }
    //   ]
    //   },
    //   signedTx:
    //     '120000228000000024000000012E0000002A201B0000008E614000000005F5E10068400000000000000A7321036B4B11ADE765968FFD1E602B469EA3B7F1DB7614663E4DE05DF986B3054920D87446304402207DF223BCEB966296168420B627A7074DFAA6274685D0AF71B15AAC18CCFB9DD50220423A71A14A44FE540CF5CE1B31418613F3CE263AA65610A5FB249C202735BBE18114EDF980AA3378DD0D1D927A14C7DBDE1B0F803C4D831455228F271541AF23A67905B561B3FC69F5A9BABF'
    // }
  ]
}
