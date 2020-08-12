import { IACMessageType } from './src'

interface SerializerMessage {
  id: number
  name: string
  supportsEncrypted: boolean
  needsProtocol: boolean
  callbackURL: boolean
  initInWallet: boolean
  initInVault: boolean
  handleInWallet: boolean
  handleInVault: boolean
}

const messages: SerializerMessage[] = [
  {
    id: IACMessageType.PairRequest,
    name: 'PairRequest',
    supportsEncrypted: false,
    needsProtocol: false,
    callbackURL: true,
    initInWallet: true,
    initInVault: true,
    handleInWallet: true,
    handleInVault: true
  },
  {
    id: IACMessageType.PairResponse,
    name: 'PairResponse',
    supportsEncrypted: false,
    needsProtocol: false,
    callbackURL: false,
    initInWallet: false,
    initInVault: false,
    handleInWallet: true,
    handleInVault: true
  },
  {
    id: IACMessageType.AccountShareRequest,
    name: 'AccountShareRequest',
    supportsEncrypted: true,
    needsProtocol: false,
    callbackURL: true,
    initInWallet: true,
    initInVault: false,
    handleInWallet: false,
    handleInVault: true
  },
  {
    id: IACMessageType.AccountShareResponse,
    name: 'AccountShareResponse',
    supportsEncrypted: true,
    needsProtocol: true,
    callbackURL: false,
    initInWallet: false,
    initInVault: true,
    handleInWallet: true,
    handleInVault: false
  },
  {
    id: IACMessageType.TransactionSignRequest,
    name: 'TransactionSignRequest',
    supportsEncrypted: false,
    needsProtocol: false,
    callbackURL: false,
    initInWallet: false,
    initInVault: false,
    handleInWallet: false,
    handleInVault: false
  },
  {
    id: IACMessageType.TransactionSignResponse,
    name: 'TransactionSignResponse',
    supportsEncrypted: false,
    needsProtocol: false,
    callbackURL: false,
    initInWallet: false,
    initInVault: false,
    handleInWallet: false,
    handleInVault: false
  },
  {
    id: IACMessageType.MessageSignRequest,
    name: 'MessageSignRequest',
    supportsEncrypted: false,
    needsProtocol: false,
    callbackURL: false,
    initInWallet: false,
    initInVault: false,
    handleInWallet: false,
    handleInVault: false
  },
  {
    id: IACMessageType.MessageSignResponse,
    name: 'MessageSignResponse',
    supportsEncrypted: false,
    needsProtocol: false,
    callbackURL: false,
    initInWallet: false,
    initInVault: false,
    handleInWallet: false,
    handleInVault: false
  },
  {
    id: IACMessageType.MessageVerifyRequest,
    name: 'MessageVerifyRequest',
    supportsEncrypted: false,
    needsProtocol: false,
    callbackURL: false,
    initInWallet: false,
    initInVault: false,
    handleInWallet: false,
    handleInVault: false
  },
  {
    id: IACMessageType.MessageVerifyResponse,
    name: 'MessageVerifyResponse',
    supportsEncrypted: false,
    needsProtocol: false,
    callbackURL: false,
    initInWallet: false,
    initInVault: false,
    handleInWallet: false,
    handleInVault: false
  }
]

const headerArray = [
  'Id',
  'Name',
  'SupportsEncrypted',
  'Protocol Specific',
  'Callback URL',
  'Init In Wallet',
  'Init In Vault',
  'Handle In Wallet',
  'Handle In Vault'
]
console.log(`| ${headerArray.join(' | ')} |`)
console.log(`| ${headerArray.map(() => '------').join(' | ')} |`)

const getCheckmark = (value: boolean) => {
  return value ? ':white_check_mark:' : ':x:'
}

messages.forEach((message: SerializerMessage) => {
  const row: string = [
    message.id,
    message.name,
    getCheckmark(message.supportsEncrypted),
    getCheckmark(message.needsProtocol),
    getCheckmark(message.callbackURL),
    getCheckmark(message.initInWallet),
    getCheckmark(message.initInVault),
    getCheckmark(message.handleInWallet),
    getCheckmark(message.handleInVault)
  ].join(' | ')
  console.log(`| ${row} |`)
})
