
global.fetch = require('node-fetch')
const chai = require('chai')
const expect = chai.expect
const CoinLib = require('../dist/index')
const BigNumber = require('bignumber.js')

describe('Transaction', function () {

  it('should be able to extract an IAirGapTranscation from a Raw Etheruem TX', function () {
    let rawTx = '0xf86b50843b9aca00825208944a1e1d37462a422873bfccb1e705b05cc4bd922e888ac7230489e800008029a0a3707b163b225cd44739922abc08bdfd770295dfd42216c5dd6d98d604c12a7ea0447d54c74ded4ab068bddab6f5ff579a30e007258787679c14c5a0217b1ba93b'
    let coinlib = new CoinLib.EthereumRopstenProtocol()

    let tx = coinlib.getTransactionDetailsFromRaw(null, rawTx)

    expect(tx.from[0]).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'.toLowerCase())
    expect(tx.to[0]).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'.toLowerCase())
    expect(tx.amount.toString()).to.equal('10000000000000000000')
    expect(tx.fee.toString()).to.equal('21000000000000')
    expect(tx.protocolIdentifier).to.equal('eth')
    expect(tx.meta.nonce).to.equal(80)
  })

  it('should be able to extract an IAirGapTranscation from a Raw ERC20-Token Etheruem TX', function () {
    let rawTx = '0xf8a950843b9aca00830249f0942dd847af80418d280b7078888b6a6133083001c980b844a9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000008ac7230489e800002aa078a1df17bfdffceda235a9e3ffed79b9a6585619244249a234cd4f25d75e3066a047b8fafbfc06346c09e1ec4db1690f9fc261ebfc7aa2d7cdd5db55cd87db4bf4'
    let coinlib = new CoinLib.HOPTokenProtocol()

    let tx = coinlib.getTransactionDetailsFromRaw(null, rawTx)

    expect(tx.from[0]).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'.toLowerCase())
    expect(tx.to[0]).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'.toLowerCase())
    expect(tx.amount.toString()).to.equal(new BigNumber(10).shiftedBy(18).toString())
    expect(tx.fee.toString()).to.equal('150000000000000')
    expect(tx.protocolIdentifier).to.equal('eth')
    expect(tx.meta.nonce).to.equal(80)
  })

  it('should be able to extract an IAirGapTranscation from a Raw BTC TX', function () {
    let coinlib = new CoinLib.BitcoinTestnetProtocol()

    let btcTx = {
      ins:
        [{
          txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
          value: 10,
          vout: 0,
          address: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
          derivationPath: '0/0'
        },
        {
          txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
          value: 31513989,
          vout: 1,
          address: 'n2ktv2WJNSzjFxanmtHVxD3SHsQD4VvSSh',
          derivationPath: '1/38'
        }],
      outs:
        [{
          recipient: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
          isChange: false,
          value: 10
        },
        {
          recipient: 'mq77zNZHofNkKB58moumyNqVSLCG4kG1at',
          isChange: true,
          value: 31486989
        }]
    }

    // derived from btxTX above
    let rawTx = '01000000027bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a000000006a47304402206b39f01d5cc19190847f9f52e9bd8f273f4b00abdd7262502af6781d61ed49cc022062f8e88eb4b2aad20c74238c3b3594902442c7d69c85796d63ad36e9c7e937600121024fd3380540fcc9ca541259ecbdf1b6c649d2be04f76d17d685ab63a8e75c4b0effffffff7bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a010000006b483045022100ed15ce553bb3b05dd8813976b18993543bce285d738890e1175a515aa78a583202206112e5f47ae8eb3555d410df2f8b979107b40a613564b0a44e5a7b3875483ada01210289981f75958ad5c0d08b6bed961d38530cb804ea68212aac9dde08aa37170a6fffffffff020a000000000000001976a9141b6d966bb9c605b984151da9bed896145698c44288ac0d74e001000000001976a914692f5e2bc021dedf966e9ba9298df7ad9ae9697988ac00000000'

    let tx = coinlib.getTransactionDetailsFromRaw({
      from: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'],
      to: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'],
      fee: '27000',
      amount: '10'
    }, rawTx)

    // check inputs
    expect(tx.from[0]).to.equal('mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k')

    // check outputs
    expect(tx.to[0]).to.equal('mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k')

    expect(tx.fee.toString()).to.equal('27000')
    expect(tx.amount.toString()).to.equal('10')
    expect(tx.protocolIdentifier).to.equal('btc')
  })

})
