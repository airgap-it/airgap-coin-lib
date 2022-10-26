import { IACMessageType } from './v2/interfaces'
import { IACMessageDefinitionObject, IACMessages as IACMessagesV2, Message } from './v2/message'
import { AccountShareResponse as AccountShareResponseV2 } from './v2/schemas/definitions/account-share-response'
import { MessageSignRequest } from './v2/schemas/definitions/message-sign-request'
import { MessageSignResponse } from './v2/schemas/definitions/message-sign-response'
import { Serializer } from './v2/serializer'
import { generateIdV2 } from './v2/utils/generateId'
import { IACMessageDefinitionObjectV3, IACMessages } from './v3/message'
import { AccountShareResponse } from './v3/schemas/definitions/account-share-response'
import { SerializerV3 } from './v3/serializer'
import { generateId } from './v3/utils/generateId'

export {
  IACMessageType,
  IACMessageDefinitionObject,
  IACMessageDefinitionObjectV3,
  AccountShareResponse,
  MessageSignRequest,
  MessageSignResponse,
  Serializer,
  SerializerV3,
  Message
}

export { generateId, generateIdV2 }

// TODO: Those can be removed when serializer v2 is removed
export { IACMessages, IACMessagesV2, AccountShareResponseV2 }
