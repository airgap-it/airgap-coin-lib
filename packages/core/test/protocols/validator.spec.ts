import { expect } from 'chai'
import 'mocha'

import BigNumber from '../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import { validate } from '../../src/dependencies/src/validate.js-0.13.1/validate'
import { validateSyncScheme } from '../../src/serializer/validators/validators'

describe('Validators', () => {
  describe('custom validators', () => {
    it('should validate BigNumber', async () => {
      const constraints = {
        test: {
          presence: { allowEmpty: false },
          type: 'BigNumber'
        }
      }
      let validationErrors = await validate({ test: 0 }, constraints)
      expect(validationErrors).to.deep.equal({ test: ['Test is not of type "BigNumber"'] })
      validationErrors = await validate({ test: 'test' }, constraints)
      expect(validationErrors).to.deep.equal({ test: ['Test is not of type "BigNumber"'] })
      validationErrors = await validate({ test: 0xa1 }, constraints)
      expect(validationErrors).to.deep.equal({ test: ['Test is not of type "BigNumber"'] })
      validationErrors = await validate({ test: 123 }, constraints)
      expect(validationErrors).to.deep.equal({ test: ['Test is not of type "BigNumber"'] })
      validationErrors = await validate(
        {
          test: {
            isBigNumber() {
              /* */
            }
          }
        },
        constraints
      )
      expect(validationErrors).to.deep.equal({ test: ['Test is not of type "BigNumber"'] })
      validationErrors = await validate({ test: new BigNumber(0) }, constraints)
      expect(validationErrors).to.be.undefined

      const BN = BigNumber.clone({
        FORMAT: {
          groupSize: 3
        }
      })

      validationErrors = await validate({ test: new BN(0) }, constraints)
      expect(validationErrors).to.be.undefined
    })

    it('should validate hex', async () => {
      const constraints = {
        test: {
          presence: { allowEmpty: false },
          type: 'String',
          isHexStringWithPrefix: true
        }
      }
      let validationErrors = await validate({ test: 'test' }, constraints)
      expect(validationErrors).to.deep.equal({ test: ['Test is not hex string'] })
      validationErrors = await validate({ test: '0xH' }, constraints)
      expect(validationErrors).to.deep.equal({ test: ['Test is not hex string'] })
      validationErrors = await validate({ test: 0x23 }, constraints)
      expect(validationErrors).to.deep.equal({ test: ['Test is not of type "String"', 'Test is not hex string'] })
      validationErrors = await validate({ test: '0x' }, constraints)
      expect(validationErrors).to.be.undefined
      validationErrors = await validate({ test: '0xA' }, constraints)
      expect(validationErrors).to.be.undefined
      validationErrors = await validate({ test: '0x1234567890ABCDEFabcdef' }, constraints)
      expect(validationErrors).to.be.undefined
      validationErrors = await validate({ test: '0x85FcC88a7D986AAf192b2A85aa6598BB8e3189C3' }, constraints)
      expect(validationErrors).to.be.undefined
      validationErrors = await validate({ test: '0x02e182c0e22a5d6a641c841ad909105c0e3aa0f1e87ff5bdbe18581da505706125' }, constraints)
      expect(validationErrors).to.be.undefined
      validationErrors = await validate({ test: '0xf82638364fde447c25e41030f12093a15967b887c34e6f938838d0700622e0cf' }, constraints)
      expect(validationErrors).to.be.undefined
    })
  })

  describe('Sync Scheme', () => {
    const validScheme = {
      version: 1,
      type: 1,
      protocol: 'ETH',
      payload: ['test']
    }

    it('should accept validate sync scheme', async () => {
      const validationErrors = await validateSyncScheme(validScheme)
      expect(validationErrors).to.be.undefined
    })

    it('should reject scheme if version is invalid', async () => {
      const myScheme = { ...validScheme }
      const invalidValues: { value: any; expected: any }[] = [
        { value: undefined, expected: { version: ["Version can't be blank"] } },
        { value: 'test', expected: { version: ['Version is not a number'] } },
        { value: new BigNumber(1), expected: { version: ['Version is not a number'] } },
        { value: '1', expected: { version: ['Version is not a number'] } },
        { value: -1, expected: { version: ['Version must be greater than or equal to 0'] } },
        { value: 1.02, expected: { version: ['Version must be an integer'] } }
      ]
      for (const invalidValue of invalidValues) {
        myScheme.version = invalidValue.value
        const validationErrors = await validateSyncScheme(myScheme)
        expect(validationErrors).to.deep.equal(invalidValue.expected)
      }
    })

    it('should reject scheme if type is invalid', async () => {
      const myScheme = { ...validScheme }
      const invalidValues: { value: any; expected: any }[] = [
        { value: undefined, expected: { type: ["Type can't be blank"] } },
        { value: 'test', expected: { type: ['Type is not a number'] } },
        { value: new BigNumber(1), expected: { type: ['Type is not a number'] } },
        { value: '1', expected: { type: ['Type is not a number'] } },
        { value: -1, expected: { type: ['Type must be greater than or equal to 0'] } },
        { value: 1.02, expected: { type: ['Type must be an integer'] } }
      ]
      for (const invalidValue of invalidValues) {
        myScheme.type = invalidValue.value
        const validationErrors = await validateSyncScheme(myScheme)
        expect(validationErrors).to.deep.equal(invalidValue.expected)
      }
    })

    it('should reject scheme if it has no protocol', async () => {
      const myScheme = { ...validScheme }
      delete myScheme.protocol
      const validationErrors = await validateSyncScheme(myScheme)
      expect(validationErrors).to.deep.equal({ protocol: ["Protocol can't be blank"] })
    })

    it('should reject scheme if it has no payload', async () => {
      const myScheme = { ...validScheme }
      delete myScheme.payload
      const validationErrors = await validateSyncScheme(myScheme)
      expect(validationErrors).to.deep.equal({ payload: ["Payload can't be blank"] })
    })
  })
})
