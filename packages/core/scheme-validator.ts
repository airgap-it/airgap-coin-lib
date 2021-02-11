const accountShareResponse = require('./src/serializer/v2/schemas/generated/account-share-response.json')
const data = {}

let Ajv = require('ajv')
let ajv = new Ajv({ allErrors: true }) // options can be passed, e.g. {allErrors: true}
let validate = ajv.compile(accountShareResponse)
console.log('valid', validate)

let valid = validate(data)
console.log('valid', valid)
