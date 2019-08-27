// tslint:disable:cyclomatic-complexity
import BigNumber from 'bignumber.js'
import * as https from 'https'

import { EncodedType, SyncProtocolUtils, TezosKtProtocol } from '../src'

export interface Protocol {
  name: string
  hash: string
}

export interface TestProtocol {
  name: string
  hash: string
}

export interface Baker {
  tz: string
}

export interface HeadResponse {
  hash: string
  predecessor_hash: string
  fitness: string
  timestamp: Date
  validation_pass: number
  operations: any[][]
  protocol: Protocol
  test_protocol: TestProtocol
  network: string
  test_network: string
  test_network_expiration: string
  baker: Baker
  nb_operations: number
  priority: number
  level: number
  commited_nonce_hash: string
  pow_nonce: string
  proto: number
  data: string
  signature: string
  volume: number
  fees: number
  distance_level: number
}

export interface RewardsResponse {
  delegate_staking_balance: string
  delegators_nb: number
  delegators_balance: any[]
  blocks_rewards: number
  endorsements_rewards: number
  fees: number
  future_blocks_rewards: number
  future_endorsements_rewards: number
  gain_from_denounciation_baking: number
  lost_deposit_from_denounciation_baking: number
  lost_rewards_denounciation_baking: number
  lost_fees_denounciation_baking: number
  revelation_rewards: number
  lost_revelation_rewards: number
  lost_revelation_fees: number
}

function openUrl<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, resp => {
        let data = ''

        // A chunk of data has been recieved.
        resp.on('data', chunk => {
          data += chunk
        })

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          resolve(JSON.parse(data))
        })
      })
      .on('error', err => {
        reject('Error: ' + err.message)
      })
  })
}

function getRandomInt(min: number, max: number): number {
  const roundedMin: number = Math.ceil(min)
  const roundedMax: number = Math.floor(max)

  return Math.floor(Math.random() * (roundedMax - roundedMin + 1)) + roundedMin
}

const ARG_CYCLE: string = '135'

async function getCurrentCycleInfo(api_url_head: string) {
  const data = await openUrl<HeadResponse>(api_url_head)

  const level = data.level
  const cycle = Math.floor((level - 1) / 4096)
  const cycle_progress = Math.round(((level - 1) / 4096 - cycle) * 10000) / 100

  return { level, cycle, cycle_progress }
}

function toXTZ(value: BigNumber, precision: number): string {
  return value.div(1000000).toFormat(precision)
}

interface Payouts {
  amount: BigNumber
  recipient: string
}

const payouts: Payouts[] = []
;(async () => {
  try {
    const baker_address = 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ' // the address of the baker
    const baker_alias = 'baker_account' // alias of the baker wallet
    const hot_wallet_address = '' // if payouts are made from a non-baker address, enter it here (could be either tz1 or KT1)
    const wallet_alias = '' // alias of the hot wallet
    const default_fee_percent = 10 // default delegation service fee
    const special_addresses = [] // special accounts that get a different fee, set to '' if none
    const special_fee_percent = 0 // delegation service fee for special accounts
    // tx_fee = 0.000001 // transaction fee on payouts
    const precision = 6 // Tezos supports up to 6 decimal places of precision
    // use the minimum payout threshold to guarantee you don't spend more in transaction fees than you earned from the delegate
    const minimum_payout_threshold = 0 // gross reward must be at least this high for payout to occur

    /////////////////////////////////////////////////////////
    // You shouldn't need to edit anything below this line //
    /////////////////////////////////////////////////////////

    // get a random number to randomize which TzScan API mirror we use
    const api_mirror = getRandomInt(1, 5)

    // TzScan API URLs
    const api_url_head = `https://api${api_mirror}.tzscan.io/v2/head` // info about current status
    const api_url_rewards = `https://api${api_mirror}.tzscan.io/v2/rewards_split/` // info about rewards at specific cycle

    // get current cycle info
    const { level, cycle, cycle_progress } = await getCurrentCycleInfo(api_url_head)

    // display some info about status of current cycle and ETA until next cycle begins
    console.log(`Currently ${cycle_progress}% through cycle ${cycle}.`)
    const next_cycle = cycle + 1
    // calculate how many minutes, hours, days until next cycle begins
    let eta_minutes = 4096 * next_cycle - level + 1
    let eta_hours = eta_minutes / 60
    let eta_days = eta_hours / 24

    // make sure hours and minutes aren't greater than next larger unit of time
    eta_days = Math.round(eta_days)
    eta_hours = Math.round(eta_hours % 24)
    eta_minutes = Math.round(eta_minutes % 60)

    // prepare to print the ETA until the next cycle in a nice way
    let status_text = `ETA until cycle ${next_cycle} begins is `
    if (eta_days > 0) {
      status_text += `${eta_days} day`
    }
    if (eta_days > 1) {
      status_text += 's'
    }
    status_text += ' '
    if (eta_hours > 0) {
      status_text += `${eta_hours} hour`
    }
    if (eta_hours > 1) {
      status_text += 's'
    }
    status_text += ' '
    if (eta_minutes > 0) {
      status_text += `${eta_minutes} minute`
    }
    if (eta_minutes > 1) {
      status_text += 's'
    }
    // actually print the ETA info
    status_text += '.\n'
    console.log(status_text)

    /*

# determine which cycle to use to calculate payouts
if len(sys.argv) != 2:
    cycle -= 6
    print 'No cycle passed in. Using most-recently unlocked rewards (cycle N-6) from cycle {}.'.format(cycle)
else:
    # a few sanity checks for the passed-in value
    is_valid = True
    error_txt = ''
    # make sure the value passed in is an integer
    if sys.argv[1].isdigit():
        # parameter is an int, now make sure we can use it
        tmp_cycle = int(sys.argv[1])
        if tmp_cycle > cycle: # cycle is in the future
            is_valid = False
            error_txt = 'ERROR: Cycle {} hasn\'t happened yet! We\'re still on cycle {}!\n'.format(tmp_cycle, cycle)
            error_txt += 'What do you think I am? Some kind of time traveler?'
        elif tmp_cycle == cycle: # cycle is in progress
            error_txt = 'WARNING: Cycle {} hasn\'t finished yet, so this data may not reflect final results.'.format(cycle)
    else:
        # value is not an int (or is negative, which looks like a string to the parser)
        is_valid = False
        error_txt = 'ERROR: The value passed in ({}) is not an integer, or is negative!'.format(sys.argv[1])

    # print the error message if necessary
    if error_txt != '':
        print ''
        print '==================================================================================='
        print error_txt
        print '==================================================================================='
        print ''
        # quit if the value is invalid
        if is_valid == False:
            sys.exit()

    cycle = tmp_cycle
    print 'Calculating earnings and payouts for cycle {}.'.format(cycle)
*/

    // get rewards data
    let page = 0
    let data: RewardsResponse = await openUrl<RewardsResponse>(`${api_url_rewards}${baker_address}?cycle=${ARG_CYCLE}&number=50&p=${page}`)

    console.log(`${api_url_rewards}${baker_address}?cycle=${ARG_CYCLE}&number=50&p=${page}`)

    const total_delegators = data.delegators_nb
    if (total_delegators == 0) {
      console.log(`No non-baker delegators for cycle ${ARG_CYCLE}.`)
    }

    const pages = total_delegators / 50

    let paid_delegators = 0

    const total_staking_balance = new BigNumber(data.delegate_staking_balance)

    let baker_balance = total_staking_balance

    const total_rewards = new BigNumber(data.blocks_rewards)
      .plus(data.endorsements_rewards)
      .plus(data.fees)
      .plus(data.future_blocks_rewards)
      .plus(data.future_endorsements_rewards)
      .plus(data.gain_from_denounciation_baking)
      .minus(data.lost_deposit_from_denounciation_baking)
      .minus(data.lost_fees_denounciation_baking)
      .minus(data.lost_rewards_denounciation_baking)

    console.log('totalRewards', total_rewards)

    // make sure there's actually something to pay out
    if (total_rewards.lte(0)) {
      console.log(`WARNING: Total rewards this cycle is ${total_rewards}, so there\'s nothing to pay out. :(`)
      process.exit()
    }

    let total_payouts_gross = new BigNumber(0)
    let total_payouts = new BigNumber(0)
    let total_fees = new BigNumber(0)
    let net_earnings = total_rewards

    let loopActive = true
    // start a loop to load all pages of results
    while (loopActive) {
      // calculate and print out payment commands
      for (const del_balance of data.delegators_balance) {
        const delegator_address = del_balance[0].tz
        const bal = new BigNumber(del_balance[1])

        // TzScan orders addresses by amount staked, so skip all the rest if we encounter a 0 balance
        if (bal.eq(0)) {
          page = pages
          break
        }

        baker_balance = baker_balance.minus(bal)
        let fee_percent = default_fee_percent

        // handle any special addresses
        for (const address of special_addresses) {
          if (delegator_address == address) {
            fee_percent = special_fee_percent
            break
          }
        }

        // don't include your hot wallet when calculating payouts (in case your hot wallet is a KT1 address delegated to yourself)
        if (delegator_address == hot_wallet_address) {
          continue
        }

        // calculate gross payout amount
        const payout_gross = new BigNumber(bal).dividedBy(total_staking_balance).times(total_rewards)
        total_payouts_gross = total_payouts_gross.plus(payout_gross)
        // subtract fee
        let payout = payout_gross.times(100 - fee_percent).dividedBy(100)
        total_fees = total_fees.plus(payout_gross.minus(payout))
        net_earnings = net_earnings.minus(payout)
        // convert from mutes (0.000001 XTZ) to XTZ
        payout = payout.dividedBy(1000000) // TODO CHECK IF CORRECT
        // display the payout command to pay this delegator, filtering out any too-small payouts
        if (payout.gte(minimum_payout_threshold)) {
          total_payouts = total_payouts.plus(payout)
          paid_delegators += 1
          const payout_string = payout.toFormat(precision) // force tiny values to show all digits
          const payout_alias = wallet_alias ? wallet_alias : baker_alias

          console.log(`./tezos-client transfer ${payout_string} from ${payout_alias} to ${delegator_address}`)

          payouts.push({ amount: payout, recipient: delegator_address })
        }
      }

      // load the next page of results if necessary
      if (page < pages) {
        page += 1
        data = await openUrl<RewardsResponse>(`${api_url_rewards}${baker_address}?cycle=${ARG_CYCLE}&number=50&p=${page}`)
      } else {
        loopActive = false
      }
    }

    // print some information about all payouts made for this cyle
    if (total_payouts.gt(0)) {
      let result_txt = `\nTotal payouts made: ${total_payouts.toFormat(6)} to ${paid_delegators} delegator`
      if (paid_delegators > 1) {
        result_txt += 's\n' // pluralize it!
      }
      console.log(result_txt)

      // display the command to transfer total payout amount to the hot wallet
      if (hot_wallet_address) {
        console.log(`./tezos-client transfer ${total_payouts} from ${baker_alias} to ${hot_wallet_address}`)
      }
    }

    // convert the amounts to a human readable format
    const total_rewards_view = toXTZ(total_rewards, precision) // round(total_rewards / 1000000, precision)
    const net_earnings_view = toXTZ(net_earnings, precision) // round(net_earnings / 1000000, precision)
    const share_of_gross_view = net_earnings
      .dividedBy(total_rewards)
      .times(100)
      .toFormat(2) // round(net_earnings / total_rewards * 100, 2)
    const total_fees_view = toXTZ(total_fees, precision) // round(total_fees / 1000000, precision)
    const total_staking_balance_view = toXTZ(total_staking_balance, precision) // round(float(total_staking_balance) / 1000000, precision)
    const baker_balance_view = toXTZ(baker_balance, precision) // round(float(baker_balance) / 1000000, precision)
    const baker_percentage_view = baker_balance
      .dividedBy(total_staking_balance)
      .times(100)
      .toFormat(2) // round(baker_balance / total_staking_balance * 100, 2)

    // print out stats for this cycle's payouts
    console.log(``)
    console.log(`===============================================`)
    console.log(`Stats for cycle ${ARG_CYCLE}`)
    console.log(`Total staked balance: ${total_staking_balance_view}`)
    console.log(`Baker staked balance: ${baker_balance_view} (${baker_percentage_view}% of total)`)
    console.log(`Total (gross) earnings for cycle: ${total_rewards_view}`)
    if (total_payouts.gt(0)) {
      console.log(
        `Total (net) baker earnings: ${net_earnings_view} (${share_of_gross_view}% of gross) (that is, ${toXTZ(
          net_earnings.minus(total_fees),
          precision
        )} + ${total_fees_view} as fees charged)`
      )
    }

    console.log(payouts)

    const tezosProtocol = new TezosKtProtocol()

    // const privateKey = ''
    const publicKey = '700d993c90aa176d3513d32c8ba411258631d8b15856dbec7b1b45398092c718'

    // tezosProtocol.getAddressFromPublicKey(publicKey).then(address => console.log(address))

    const recipients = payouts.map(payout => payout.recipient)
    const amounts = payouts.map(payout => payout.amount.times(1000000).integerValue())

    tezosProtocol
      .prepareTransactionFromPublicKey(publicKey, recipients, amounts, new BigNumber(1420), { addressIndex: 0 })
      .then(tx => {
        tezosProtocol.getTransactionDetails({ publicKey, transaction: tx }).then(res => {
          console.log(res)
        })

        const syncProtocol = new SyncProtocolUtils()

        syncProtocol
          .serialize({
            version: 1,
            protocol: 'xtz',
            type: EncodedType.UNSIGNED_TRANSACTION,
            payload: {
              publicKey,
              transaction: tx,
              callback: 'airgap-wallet://?d='
            }
          })
          .then(res => console.log('airgap-vault://?d=' + res))
        /*
    tezosProtocol
      .signWithPrivateKey(Buffer.from(privateKey, 'hex'), tx)
      .then(signedTx => {
        tezosProtocol
          .getTransactionDetailsFromSigned1({
            accountIdentifier: '',
            transaction: signedTx
          })
          .then(details => {
            details.forEach(detail => {
              const newDetail: any = detail
              newDetail.amount = detail.amount.toFixed()
              newDetail.fee = detail.fee.toFixed()
              console.log(newDetail)
            })

            console.log('broadcasting')

          })
          .catch(err => {
            console.log(err)
          })
      })
      .catch(err => {
        console.log('sign error', err)
      })*/
      })
      .catch(err => {
        console.log(err)
      })
  } catch (e) {
    console.error(e)
    // Deal with the fact the chain failed
  }
})().catch()
