import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import axios from 'axios'
import * as sinon from 'sinon'
import { BitcoinTestnetProtocol } from '../../../lib'

export class BitcoinTestnetProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: BitcoinTestnetProtocol) {
    const stub = sinon.stub(axios, 'get')
    stub
      .withArgs(
        `https://test-insight.bitpay.com/api/addrs/mfcd7QevgCuUx3PsHZRGewEsn97AhsSCib,mowfwYBK5dP2CGdxG6s3g7ESbJTJNZYUVs,mxcckJHfuavVMu3vjCM29RqzVQ8gqmb1Vy,mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX,miiQwEJY9fCG6GD1BFtnVuWRS6zaTnNafq,mr5miixaSpUz2vpZhkvtJBk8XqibZBde63,n3b7941xvkDxv7bCfpnbDRwmrbrsRmVXS9,moMGxNkwTqW5NYS9XcMc8Ramehe68AGkN8,mkmw4mSW1hJdUhtBtasKnBYfRaYGwMSuvd,mmhpVH32JdgSAUJiV9msbYjjA4ArbzTfJG,mrQFKMctTBMDcjbHZukyySuUqy41pXbcGX,mmtt8vhhi2a84khuxKMkGD8X4ZMLcHiaV7,mrn2Jw3FNQrwhjsnSwaUR2Rd1vNatqTjrt,mpuUW524TebymrpXZu5WxYWPCRv4fC82Jn,mjEYUHmSyUJ9W449YyDKVEPycosZ8GtLwB,mi7zSqVstQWJJmWPEK1qu97zN5ghL12sUp,n3hwQiBMAJcPFRh1U1LzDNtV26LCrfJquQ,mpUXN66irbQaFJDVMGzHE6Bd7iKWAFzvno,mkdcWYCEu9YMGDHcoeLwHZ9Jk6x8djkBYC,mkFJXFLXX8kDr36h1ouLjasA8WFoAWmZ3L,n2isDk4WGz5EyuAwb3gfvK8cZr2WUd74jk,miyUPewcQnPVeX393HxQhJ4uZ5C6AUgZR8,n3hdHvuWjyDb4qJB7szL2hAiM1rHwsQJbJ,mnBksaXCRedMPD8BBeBTGWX3KhTbevzUu2,mxcDyDG4oiNFkyYfvGmzFpuPuRh6DtBs9A,mvFx2mniFKaSQKsiqZou71JS2o1J5NeFpC,mwjo65PWzavvFGVD7zNTv4cZvu592QUety,mki8MQfuKjyA2TJg1aKbJsPb213wW9ypfG,mstnSxj95Q3E9gYRVPCZqrF5RjPN833pMC,mxPjwwYwhizeAYnoN8kaFTNAkTPM7WtAV9,mkVbo66cES615cuy5Y9SownBN69dJ4xYsD,mvZNHqt6G9KoNb2np3AoqPvQS4uYFomghY,mtgVpJ5yq9dcBsk8PcVrn6BAXwUj8PW6a7,mnuxLZTXST3N9G5fMMzfdC4gRSTmHBceqV,n1T7wGZTHUNAwe3WXgtAHykKtbNgt2usvF,mhGLH7dEMUJm6xn5DUHETuhnkNsqWbyJLB,n3Ke7rugXkcLArNxuCQzV4eYPjXzMYMFFS,myPmFHwmdyBNKCJ9vVnzxpmQnRzjHrAYzP,n2ktv2WJNSzjFxanmtHVxD3SHsQD4VvSSh,mq77zNZHofNkKB58moumyNqVSLCG4kG1at,mxQVczxqkiSkuvokBHMTDKLbbkqyfzvDyN,mv7F231SYjRemk7B4RsHwgmgf1EptVU3P7,n3x5RUDtcDQam1ySdQvKZKjKqEq56iAYZq,miTRCQGif9oBFctUGbWHL8LCiao5p2uLye,n4ESwmS2AUon7TWcw8sNKeXDvZE3usQuwt,mqwfcvSnkXcgD3UcKrYGpuw5LfeyUme5JC,n4RU38UKBeH4L4KrPFErSrvsQ3r41P1PZU,n1CtyHD69XJpaLwj2CrAYdd4ZPdgWJh6U6,mw3MpR3hRuDCQ2KS8yXEFdvbSeD8EpUUfN,mo1sE6VpPCpeLPwqZtAnJhP3w7f7EKVwJg,miKoYScmq3EgbvkL14ih7hgsVdBPem92Up,moXjEPHUwcB1kKppVrNvKbg1pwpTBZmWE1,mgJdgJFKDesRQ3kV3v7FWbukHsDtuZYZj3,mqpp2BFWjS9EGmzrCbwpKeovqCLA65PKrH,mr8fHigEUGmSZyAoYvnTpzkZYX8oUC7Vdw,mwsrGJgnNVbRXs451hkHgE3LKnjCv3bZSQ,mhTBnBfoeAC2pebc78g3HZdWep9BrcoWzU,mqzqVEawKBxtGa6TxMF3ERgyLZeXEvnZH1,mxGinnyizTuUQbtEJavn29d4zQiENERnwT,mz5KT86RKNooQ2sHCam12DZCP92TfqLjHz,n3h8AH1zgpn6oJQPvKAeKx7h11xgVo9MQP,mt4xK5BtnTpxeffNmpSVj4HyupwBfiVv1i,mr1k6hquYQ43XBkxZMkjWZiwRtXRayXp1E,mpaxyWKmiwL7L1Ckgow7YrzbYaZJwU1dky,n2v3JYkS2nmjMGuygwTz76WzAozRoQLjj7,muj16mSzNkcYtrLraQqaRsUDX7uZ3F3eJU,myYw7aDUqUW4wB2946WCJ1rmyyhagkpDGa,n2XcHwXtShrzGdCR9DqkvDXGN6gwWSMgbJ,mmEKTF7PgzpmNJaoHqhKBAz6gwWqLszoNS,mnVD5b3df7YW2SNLoGpFWU4LJKt3e2Vrse,n2U4Ksn9HzmczGzmRSHyB3bdEyhZki1xtd,mzmJp2fhH2SNWsrLekpaZnY7BJbQCdYy4u,mj2bTdQXPp17ZPvneiSwc9pUF4CL9MsvAH,mhBdayrM5CYWtnojtFKoSDwxuYAUNmsztE,mxCdGfR5oyRo4qXxVjNgSjRV6dKd42p4sK,mrDKxZmosFKyMMVmQsAak5u3A1ULm1oap2,mrJHTGqLA9zg5k7qF23Sf3xv3EjB93BsMj,mnLZiVmHF4vSmtYbr5tGgAJoYc3NZZ5Sen,n28sg6EPGaJ7eAxTsTxjuFsCNCvcpEgVyf,n23zQem4g1DoZdFj89LNuVTyQNtBmSzkfK,mvNz3oCZ9zLjrf6YtvG2QEuuUjNtKvkjsV,mvM9pyjNnBbcKHeA6tmeVhErrtbP2M9krQ,mjxNV9NS1WhJiDEYpHi3axhTG1B4vUkwUU,mkCjoH817KjdsC7Att1Ci1xkFxhCJnb63D,mqHVojTojSLtvwF8CeoeWxH2ULnJYQ4RL7,mjYFcrMrts6YC62BczgGfVUfQWbmdcia8A,mxD5KbPn9Y8aaMqsmmTB3jhC7MtuNYUfT5,mgbLhgjgg117XRwMBSwE8bDeL4XgGPkEp5,mgBKkcQJm9e8br7VYGQ6tofQq4m7StVCin,mts18HbFKeQ823VXkmZyjMggMMjEi2cbnU,n1N5Ykg1XYckYbKWxxg369HeQyq9X2VU2B,n3wXBKeABcyaHUAGPgmU3Hf1uSiQatsyLQ,n2Z34qD6J8ayd9wS8uzCtbePd4yeoV87MK,my35WUTZsHS794BFsV4cttRCEYS6v4zDiu,myxwbFCVaCs88dASker4n3mUnU4fAD6JAF,mgo4ueWP5EBtr4Ygpqh36LTkCxqMjzXSrN,mu7pgZUJZnkQshfDupDum3hCHbisGRbHUb,mj7XXGAagshkhgyyzktxp2b4jktYEVZn7U,mrx4AaWBu3Uk87BagAFrHVaLq47iJEFF3K,mxMocCVYEAi3Qo6qqbWijjxo4JxQXrtWGc,mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k,moK2Ws7YvK3LRppzCuLRVfDkpvZiw7T4cu,moCBTJWaexwAyxorcj6yNqjMZ138ZmohPZ,ms24VAuo27H9A54xBMxwK67yVHy5rre2nm,mmLwP8JLFESmSjpEGJtrnWvWLfoPhQPM7S,moe8Xi57znqcg1MexYJoB5cuuGvLBz6Bdy,mfk1gzfWTYuB7xD5QFDRDoh3BRprPxpnAf,myurMneJLG3bbbarRgKupuHH7qLh6nfrUU,mt9TQiyoDthFV49P1FVJ6HqYfAYy1ggwpf,mw8i5exve4yh9tSdm3rsXM13vcssg37ahG,mwKSB6oegaRM7P1nn9HtaKff5cZYtpho5A,n39eKQiHoq5Y4bGpm4uqX3ECseVko14TtG,mpEF54EuD2wWW8ygEERiVY6kNGyGdX7fDX,mfzVnYnAF3Em5VwErvvNxFziaFaGhEW28u,mjUyaeDd9uW4qrzZJoEyrNS1mEY3g9hi76,mz8HnQjc4EE2hvi9imc5botGJopRPqXA5g,mkpu61M6fDnX8GRSe3WszMhVTBfeiemPZy,mj8DzWg8jXn3BkkC324SjEWboJoBgcUw9Z,n2o52TAYiowjGBAx1nWa2xmXkBoYEuiqgw,mitbDK323uhJapXi7DBjhqygaHmzfaEz4i,n4TNBCrwtDpSz72fTxp9ZAVQpccnESr22Q,mhTDtr7CTYnEer5Dtiqnabiq1pDgfe588o,mobHMWGAnK4ptnQ94xRahE3a1hmbd9s8dV,my4V8AUqpeXypcfVovu2aBYw3jQXqwMgqa,moxdkiNCqDMCtXFdtgNSbpLeG8wkmAZv5w,myjvDbN4KaajAB4fZoFnN7J8UaPYRwsatQ,mrCDCeP7HD4PgY69W7s9uMuubqe5WJbAga,mhF4y1FeKzyVWFsp8GsXCtvhP92JEKhjFB,mgfbJ7gJRhVFucYkJGmR9EzP5mLW3GxNJz,mu1uJ46yV7mLPE1Q54YJgk2su4KXu3ozWk,n2ok6wLiid4zPbjzbPHzzhYn7twTnUkWi5,momXSeNeKZKz4f4FAdPQTiV9rWW1bcoHZo,mz65X1mc3XaKiwaYCgL2bhJosZwu1KYMie,mtfRmc8Uy76r91EgSnsDMQzAfBi2JfkXj3,mtx6rmvzcZw7bfL5NtUtm2LqZkuzSFM3DV,mvprZjRMB6BacqLwqMzzyCbaHboqZqgDTr,mxMUVozJWsEzDL3mHAKux5jcSzKkZv2K8P,n3ZVBHtA7CkXK7WpiDTTRFFE3BmoQESWnD,miek8T4RfKvAE68mgUhR4dgJKKmkYP3pZ3,muogutgPUnAmx4bKQbvrQwt6CK5QkDVnPj,mheqfPa7XSqPFaSHNgKXb9Fiz6qW8rwwzv,mzQno9YQNnrpaTgWXVX4Yk4DYVBwhhGEBG,n1apRiAoWdd47RmaatTmwVRxKwjWFLKHi4,n4Mm7yS12txc7WoJwUTwE6RzvFUVFieueY,n3qU4EPptEzzmvqbBpQgUP1Nk2nzKahvo9,mi33foqpakyow9FsrVk6tB5idDxqeeFf2f,mn8Pxt8zhxL4bZZoxVTFuE9fu5JQLv6wqn,n4cSsTzLK1wCfvUUGGvjcvMUeWfWy334Jk,mgPE6QocC88RsbLicoQzmfgGtnTVM48BkR,mxdAuBo9X6YJ8eD29J8SCfUtYWNpDg6yx6,mfeB5aL6MRLj2awvpcfa1w4uehVP5UCbaU,mmobWMQsScdQDjA5X4dd1rM39wb4LC3wLq,n2swb1JFzCBzYNrC9V74uYZ6Bq1oR9cYsf,mvN1B5DeApWXLRMAz7Xp7q8agvnLLeH2XG,mzNtQow5LGxcV8kA9FvizDcdVigxvCR8jh,mrAGmZ4ss83b9Z2JiXpGs6ppmCuZjyBFcn,mjApGi5nBFPNH4yGj2NRBuJcnFNUGoCXPR,mruRShJEpHNESF3CDkW4JnMFNTFvYAz1Wr,moHTyfXo3rSGXjYhv2g8NEwoZowMjWxabq,mtaRfvV8peVZ4ZRG4frS3qMhYbuHbL5v7x,mhbbz3UnExtgbwx7MnMyJEGJFc54Ss8c7A,ms9Z3GyvS1dQqtEPp5khwkywwTjVypGbFB,miT7tUs32ezmvjmTPV6QtRky7w75ez2cR4,muzrkNFwq6CDcP4xF1cQAPym6yWW6NShnS,mqgDztcu9GfvqhrYeNrLvyVAcPm8uznGwA,mnYg8BQYcSe9nuCU4HwN74WsjwoZXfNgnx,n1UU4x3ZBPnB3iFbQ6P1kMGS1vQBhQCt1h,mpBhxocQFLshTkzgkUxsdWaiNRUjcNhJUX,n4d2vY36HDc7JUQPAv4z5pfEq17gVRiEvd,mrmfSg6X2fFThNK3e8yffJWwFWkHnZHKsT,n1U2LefLP7tKviYExPfWDStg2CTim8H6Bs,n4g6gm4XNbpK9KwiLhHmRiUwTd7Ymh25mw,myR74YbFaEogyf7ybgHk8zdNC8k9P8TAYU,mg5hK5KHjJwY1ytJz87nLifKqJ4YZXXXkV,n4qqHRjVPZrsL25Jv17GWrf8h9anp3Vk8H,muazrkjrqifybh5yegSEMxWwLkUzpwWQF5,mnU6kBjM8vqbVMkQUYVDSN3SkSWZL8s4Em,n1L6RwhJrRKqVfzCUqLkpsw1GQojVKYqtp,mzKKdXQACmZa6FYLvCQsZ9vkzuv6q3Qs1r,n1RAjZK1k1AdPdVRL571gaBRKHGtKk5FMe,mqjZsh3iWRsL9jfEuAKNbfjDCWamq28G67,mjLwLNriAHQWAAhnEMJfLt8B4V1Wuwvng2,mmWfyHSTTrT6tnGi3qJw88x89t7Z7hqEtx,mtFzMuUv7B469riDmPkWGH1WD8KTLbXMe7,mwtBx8zfCv197MswR4UFHkh7tECi45njdZ,mwuHkU7Qi4dZQ3YRywituptZF4qrcM4KF7,mi4YnjhArj56FgC5HusoqMoRpMEqJHRpPW,mxLQaAevBKfyJ8k9YpbGAwquAcaHLpugzW,n1RrxPvdud6S6WPSeTtyrBuLWMhH3WFFuN,mmJBi9dB8Nn851tvePEBHJnXAVu1SvaY1k,n34KXaNuq5QJkszASxH6ec7wwCHfikKp87,moK1BfGvS9dUKJHrFNXmxCAbqHUay4EPjh,mxcVgkAhrNynPeWiWVFvv5X341ScX3qLXg,mrKgnwU4oSaZ52gTDjE6QY7ZZ1ohK6byQA,n2A9LwMYD9nEp3fAUeUbLkDbcZ1uGJtu4P,mv8Y7xwTt3x6qHornM6tgBBgpba8kM7C8i,mgrNqXUGKn28ZfhiEvKwa7vWq8EWV1Zbha,mv4RBNB2r79zShi2LDo28QUwLnD6itJmhA,mzK1oXJeJ6D5ZMCFWpsNqRXRTbgFih82Be,mga6UfPBRBfzuyDbwqV7aEby1mPuX7qt2a/utxo`
      )
      .returns(
        Promise.resolve({
          data: [
            {
              address: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
              txid: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
              vout: 0,
              scriptPubKey: '76a9141b6d966bb9c605b984151da9bed896145698c44288ac',
              amount: 1e-7,
              satoshis: 10,
              height: 1353085,
              confirmations: 132951
            },
            {
              address: 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX',
              txid: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              vout: 0,
              scriptPubKey: '76a9141b6d966bb9c605b984151da9bed896145698c44288ac',
              amount: 0.65,
              satoshis: 65000000,
              height: 1296906,
              confirmations: 189130
            }
          ]
        })
      )

    stub
      .withArgs(
        `https://test-insight.bitpay.com/api/addrs/mfcd7QevgCuUx3PsHZRGewEsn97AhsSCib,mowfwYBK5dP2CGdxG6s3g7ESbJTJNZYUVs,mxcckJHfuavVMu3vjCM29RqzVQ8gqmb1Vy,mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX,miiQwEJY9fCG6GD1BFtnVuWRS6zaTnNafq,mr5miixaSpUz2vpZhkvtJBk8XqibZBde63,n3b7941xvkDxv7bCfpnbDRwmrbrsRmVXS9,moMGxNkwTqW5NYS9XcMc8Ramehe68AGkN8,mkmw4mSW1hJdUhtBtasKnBYfRaYGwMSuvd,mmhpVH32JdgSAUJiV9msbYjjA4ArbzTfJG,mrQFKMctTBMDcjbHZukyySuUqy41pXbcGX,mmtt8vhhi2a84khuxKMkGD8X4ZMLcHiaV7,mrn2Jw3FNQrwhjsnSwaUR2Rd1vNatqTjrt,mpuUW524TebymrpXZu5WxYWPCRv4fC82Jn,mjEYUHmSyUJ9W449YyDKVEPycosZ8GtLwB,mi7zSqVstQWJJmWPEK1qu97zN5ghL12sUp,n3hwQiBMAJcPFRh1U1LzDNtV26LCrfJquQ,mpUXN66irbQaFJDVMGzHE6Bd7iKWAFzvno,mkdcWYCEu9YMGDHcoeLwHZ9Jk6x8djkBYC,mkFJXFLXX8kDr36h1ouLjasA8WFoAWmZ3L,n2isDk4WGz5EyuAwb3gfvK8cZr2WUd74jk,miyUPewcQnPVeX393HxQhJ4uZ5C6AUgZR8,n3hdHvuWjyDb4qJB7szL2hAiM1rHwsQJbJ,mnBksaXCRedMPD8BBeBTGWX3KhTbevzUu2,mxcDyDG4oiNFkyYfvGmzFpuPuRh6DtBs9A,mvFx2mniFKaSQKsiqZou71JS2o1J5NeFpC,mwjo65PWzavvFGVD7zNTv4cZvu592QUety,mki8MQfuKjyA2TJg1aKbJsPb213wW9ypfG,mstnSxj95Q3E9gYRVPCZqrF5RjPN833pMC,mxPjwwYwhizeAYnoN8kaFTNAkTPM7WtAV9,mkVbo66cES615cuy5Y9SownBN69dJ4xYsD,mvZNHqt6G9KoNb2np3AoqPvQS4uYFomghY,mtgVpJ5yq9dcBsk8PcVrn6BAXwUj8PW6a7,mnuxLZTXST3N9G5fMMzfdC4gRSTmHBceqV,n1T7wGZTHUNAwe3WXgtAHykKtbNgt2usvF,mhGLH7dEMUJm6xn5DUHETuhnkNsqWbyJLB,n3Ke7rugXkcLArNxuCQzV4eYPjXzMYMFFS,myPmFHwmdyBNKCJ9vVnzxpmQnRzjHrAYzP,n2ktv2WJNSzjFxanmtHVxD3SHsQD4VvSSh,mq77zNZHofNkKB58moumyNqVSLCG4kG1at,mxQVczxqkiSkuvokBHMTDKLbbkqyfzvDyN,mv7F231SYjRemk7B4RsHwgmgf1EptVU3P7,n3x5RUDtcDQam1ySdQvKZKjKqEq56iAYZq,miTRCQGif9oBFctUGbWHL8LCiao5p2uLye,n4ESwmS2AUon7TWcw8sNKeXDvZE3usQuwt,mqwfcvSnkXcgD3UcKrYGpuw5LfeyUme5JC,n4RU38UKBeH4L4KrPFErSrvsQ3r41P1PZU,n1CtyHD69XJpaLwj2CrAYdd4ZPdgWJh6U6,mw3MpR3hRuDCQ2KS8yXEFdvbSeD8EpUUfN,mo1sE6VpPCpeLPwqZtAnJhP3w7f7EKVwJg,miKoYScmq3EgbvkL14ih7hgsVdBPem92Up,moXjEPHUwcB1kKppVrNvKbg1pwpTBZmWE1,mgJdgJFKDesRQ3kV3v7FWbukHsDtuZYZj3,mqpp2BFWjS9EGmzrCbwpKeovqCLA65PKrH,mr8fHigEUGmSZyAoYvnTpzkZYX8oUC7Vdw,mwsrGJgnNVbRXs451hkHgE3LKnjCv3bZSQ,mhTBnBfoeAC2pebc78g3HZdWep9BrcoWzU,mqzqVEawKBxtGa6TxMF3ERgyLZeXEvnZH1,mxGinnyizTuUQbtEJavn29d4zQiENERnwT,mz5KT86RKNooQ2sHCam12DZCP92TfqLjHz,n3h8AH1zgpn6oJQPvKAeKx7h11xgVo9MQP,mt4xK5BtnTpxeffNmpSVj4HyupwBfiVv1i,mr1k6hquYQ43XBkxZMkjWZiwRtXRayXp1E,mpaxyWKmiwL7L1Ckgow7YrzbYaZJwU1dky,n2v3JYkS2nmjMGuygwTz76WzAozRoQLjj7,muj16mSzNkcYtrLraQqaRsUDX7uZ3F3eJU,myYw7aDUqUW4wB2946WCJ1rmyyhagkpDGa,n2XcHwXtShrzGdCR9DqkvDXGN6gwWSMgbJ,mmEKTF7PgzpmNJaoHqhKBAz6gwWqLszoNS,mnVD5b3df7YW2SNLoGpFWU4LJKt3e2Vrse,n2U4Ksn9HzmczGzmRSHyB3bdEyhZki1xtd,mzmJp2fhH2SNWsrLekpaZnY7BJbQCdYy4u,mj2bTdQXPp17ZPvneiSwc9pUF4CL9MsvAH,mhBdayrM5CYWtnojtFKoSDwxuYAUNmsztE,mxCdGfR5oyRo4qXxVjNgSjRV6dKd42p4sK,mrDKxZmosFKyMMVmQsAak5u3A1ULm1oap2,mrJHTGqLA9zg5k7qF23Sf3xv3EjB93BsMj,mnLZiVmHF4vSmtYbr5tGgAJoYc3NZZ5Sen,n28sg6EPGaJ7eAxTsTxjuFsCNCvcpEgVyf,n23zQem4g1DoZdFj89LNuVTyQNtBmSzkfK,mvNz3oCZ9zLjrf6YtvG2QEuuUjNtKvkjsV,mvM9pyjNnBbcKHeA6tmeVhErrtbP2M9krQ,mjxNV9NS1WhJiDEYpHi3axhTG1B4vUkwUU,mkCjoH817KjdsC7Att1Ci1xkFxhCJnb63D,mqHVojTojSLtvwF8CeoeWxH2ULnJYQ4RL7,mjYFcrMrts6YC62BczgGfVUfQWbmdcia8A,mxD5KbPn9Y8aaMqsmmTB3jhC7MtuNYUfT5,mgbLhgjgg117XRwMBSwE8bDeL4XgGPkEp5,mgBKkcQJm9e8br7VYGQ6tofQq4m7StVCin,mts18HbFKeQ823VXkmZyjMggMMjEi2cbnU,n1N5Ykg1XYckYbKWxxg369HeQyq9X2VU2B,n3wXBKeABcyaHUAGPgmU3Hf1uSiQatsyLQ,n2Z34qD6J8ayd9wS8uzCtbePd4yeoV87MK,my35WUTZsHS794BFsV4cttRCEYS6v4zDiu,myxwbFCVaCs88dASker4n3mUnU4fAD6JAF,mgo4ueWP5EBtr4Ygpqh36LTkCxqMjzXSrN,mu7pgZUJZnkQshfDupDum3hCHbisGRbHUb,mj7XXGAagshkhgyyzktxp2b4jktYEVZn7U,mrx4AaWBu3Uk87BagAFrHVaLq47iJEFF3K,mxMocCVYEAi3Qo6qqbWijjxo4JxQXrtWGc,mm3JNWeMUnFtGCqxphh4RAgXSAnhNz6LV5/txs`
      )
      .returns(
        Promise.resolve({
          data: {
            totalItems: 22,
            from: 0,
            to: 10,
            items: [
              {
                txid: '7f7d8436332723d02f823a4e4af47123bed8ce8d2546d1df64a6578ba12f25c8',
                version: 1,
                locktime: 0,
                vin: [
                  {
                    txid: '6d90a1325da494543e67e78e02c0962f265c85f8b2f0a9a4c67f1676bd02936d',
                    vout: 0,
                    sequence: 4294967295,
                    n: 0,
                    scriptSig: {
                      hex:
                        '473044022021dcb408de999e8ba5a8262f2af890c04f144959c5d873629d438465a899b75d022074e7f7a09902db68985045ea564bdfdb776a8a126e13815aa3c193c2cd7110910121024fd3380540fcc9ca541259ecbdf1b6c649d2be04f76d17d685ab63a8e75c4b0e',
                      asm:
                        '3044022021dcb408de999e8ba5a8262f2af890c04f144959c5d873629d438465a899b75d022074e7f7a09902db68985045ea564bdfdb776a8a126e13815aa3c193c2cd711091[ALL] 024fd3380540fcc9ca541259ecbdf1b6c649d2be04f76d17d685ab63a8e75c4b0e'
                    },
                    addr: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
                    valueSat: 10,
                    value: 1e-7,
                    doubleSpentTxID: null
                  },
                  {
                    txid: '6d90a1325da494543e67e78e02c0962f265c85f8b2f0a9a4c67f1676bd02936d',
                    vout: 1,
                    sequence: 4294967295,
                    n: 1,
                    scriptSig: {
                      hex:
                        '483045022100f0f0c9b8c56c6e5c15ad960eeeda50877c2bcd43d4a3dbe52997bb9a2ddf70b402202a063c47b727d5787dce524f5f2f575ca6ed05b7f16e3a5d86306521dda2c1e00121021a0dbaea73b48e85c1276abe015cac37462ec9d719163ed0431bf178fd32fd0b',
                      asm:
                        '3045022100f0f0c9b8c56c6e5c15ad960eeeda50877c2bcd43d4a3dbe52997bb9a2ddf70b402202a063c47b727d5787dce524f5f2f575ca6ed05b7f16e3a5d86306521dda2c1e0[ALL] 021a0dbaea73b48e85c1276abe015cac37462ec9d719163ed0431bf178fd32fd0b'
                    },
                    addr: 'n2isDk4WGz5EyuAwb3gfvK8cZr2WUd74jk',
                    valueSat: 31959989,
                    value: 0.31959989,
                    doubleSpentTxID: null
                  }
                ],
                vout: [
                  {
                    value: '0.00000010',
                    n: 0,
                    scriptPubKey: {
                      hex: '76a9141b6d966bb9c605b984151da9bed896145698c44288ac',
                      asm: 'OP_DUP OP_HASH160 1b6d966bb9c605b984151da9bed896145698c442 OP_EQUALVERIFY OP_CHECKSIG',
                      addresses: ['mm3JNWeMUnFtGCqxphh4RAgXSAnhNz6LV5'],
                      type: 'pubkeyhash'
                    },
                    spentTxId: '97255cd7b3ae211aff3a3f67d3fadb38cc1f3f28cd63dcf5fef6d166fbf56ac4',
                    spentIndex: 0,
                    spentHeight: 1346781
                  }
                ],
                blockhash: '0000000000000aa4e2b57e51100dce6ab255b8057af2299d05e400600b432294',
                blockheight: 1346781,
                confirmations: 139256,
                time: 1530262297,
                blocktime: 1530262297,
                valueOut: 0.31932999,
                size: 373,
                valueIn: 0.31959999,
                fees: 0.00027
              }
            ]
          }
        })
      )
  }
  noBalanceStub() {
    //
  }
}
