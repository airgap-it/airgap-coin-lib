import { IACMessageType } from './v2/interfaces'
import { IACMessageDefinitionObject, IACMessages as IACMessagesV2, Message } from './v2/message'
import { AccountShareResponse as AccountShareResponseV2 } from './v2/schemas/definitions/account-share-response'
import { MessageSignRequest } from './v2/schemas/definitions/message-sign-request'
import { MessageSignResponse } from './v2/schemas/definitions/message-sign-response'
import { Serializer } from './v2/serializer'
import { TransactionSignRequest as TransactionSignRequestV2 } from './v2/transactions/transaction-sign-request'
import { TransactionSignResponse as TransactionSignResponseV2 } from './v2/transactions/transaction-sign-response'
import { generateIdV2 } from './v2/utils/generateId'
import {
  TransactionValidator as TransactionValidatorV2,
  TransactionValidatorFactory as TransactionValidatorFactoryV2
} from './v2/validators/transactions.validator'
import { validateSyncScheme as validateSyncSchemeV2 } from './v2/validators/validators'
import { IACMessageDefinitionObjectV3, IACMessages } from './v3/message'
import { AccountShareResponse } from './v3/schemas/definitions/account-share-response'
import { SerializerV3 } from './v3/serializer'
import { TransactionSignRequest } from './v3/transactions/transaction-sign-request'
import { TransactionSignResponse } from './v3/transactions/transaction-sign-response'
import { generateId } from './v3/utils/generateId'
import { TransactionValidator, TransactionValidatorFactory } from './v3/validators/transactions.validator'
import { validateSyncScheme } from './v3/validators/validators'

export {
  IACMessageType,
  IACMessageDefinitionObject,
  IACMessageDefinitionObjectV3,
  AccountShareResponse,
  MessageSignRequest,
  MessageSignResponse,
  TransactionSignRequest,
  TransactionSignResponse,
  Serializer,
  SerializerV3,
  Message,
  TransactionValidator,
  TransactionValidatorFactory
}

export { generateId, generateIdV2, validateSyncScheme, validateSyncSchemeV2 }

// TODO: Those can be removed when serializer v2 is removed
export {
  IACMessages,
  IACMessagesV2,
  AccountShareResponseV2,
  TransactionSignRequestV2,
  TransactionSignResponseV2,
  TransactionValidatorV2,
  TransactionValidatorFactoryV2
}
