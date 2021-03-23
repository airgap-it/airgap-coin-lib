import { CoinlibError, Domain } from './coinlib-error'

export enum SerializerErrorType {
  SERIALIZER_VERSION_MISMATCH = 'SERIALIZER_VERSION_MISMATCH',
  PROTOCOL_NOT_SUPPORTED = 'PROTOCOL_NOT_SUPPORTED',
  PROTOCOL_VERSION_MISMATCH = 'PROTOCOL_VERSION_MISMATCH',
  TYPE_NOT_SUPPORTED = 'TYPE_NOT_SUPPORTED',
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  INVALID_SCHEMA_TYPE = 'INVALID_SCHEMA_TYPE',
  INVALID_HEX_STRING = 'INVALID_HEX_STRING',
  INVALID_STRING = 'INVALID_STRING',
  SCHEMA_ALREADY_EXISTS = 'SCHEMA_ALREADY_EXISTS',
  SCHEMA_DOES_NOT_EXISTS = 'SCHEMA_DOES_NOT_EXISTS',
  UNEXPECTED_PAYLOAD = 'UNEXPECTED_PAYLOAD',
  PAYLOAD_TYPE_UNKNOWN = 'PAYLOAD_TYPE_UNKNOWN',
  PAYLOAD_TYPE_MISMATCH = 'PAYLOAD_TYPE_MISMATCH',
  PAYLOAD_TYPE_NOT_SUPPORTED = 'PAYLOAD_TYPE_NOT_SUPPORTED',
  PROPERTY_IS_EMPTY = 'PROPERTY_IS_EMPTY',
  PROPERTY_INVALID = 'PROPERTY_INVALID'
}

export enum ProtocolErrorType {
  NETWORK = 'NETWORK',
  CONDITION_VIOLATION = 'CONDITION_VIOLATION',
  UNSUPPORTED = 'UNSUPPORTED',
  NOT_FOUND = 'NOT_FOUND',
  BALANCE = 'BALANCE',
  PROPERTY_UNDEFINED = 'PROPERTY_UNDEFINED',
  OPERATION_FAILED = 'OPERATION_FAILED',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  INVALID_VALUE = 'INVALID_VALUE'
}

/**
 * Gets thrown if an error occurs when making a network request
 */
export class NetworkError extends CoinlibError {
  constructor(domain: Domain, description?: string) {
    super(domain, ProtocolErrorType.NETWORK, description)
  }
}

/**
 * Gets thrown if a value ist expected to fulfill a certain condition such as having a certain length, but the condition is not satisfied
 */
export class ConditionViolationError extends CoinlibError {
  constructor(domain: Domain, description?: string) {
    super(domain, ProtocolErrorType.CONDITION_VIOLATION, description)
  }
}

/**
 * Gets thrown if a variable assumes a value for which an operation is not supported
 */
export class UnsupportedError extends CoinlibError {
  constructor(domain: Domain, description?: string) {
    super(domain, ProtocolErrorType.UNSUPPORTED, description)
  }
}

/**
 * Gets thrown if a variable is unexpectedly undefined
 */
export class NotFoundError extends CoinlibError {
  constructor(domain: Domain, description?: string) {
    super(domain, ProtocolErrorType.NOT_FOUND, description)
  }
}

/**
 * Gets thrown if an account has an insufficient balance to perform a certain kind of operation
 */
export class BalanceError extends CoinlibError {
  constructor(domain: Domain, description?: string) {
    super(domain, ProtocolErrorType.BALANCE, description)
  }
}

/**
 * Gets thrown if an accessed object property is undefined
 */
export class PropertyUndefinedError extends CoinlibError {
  constructor(domain: Domain, description?: string) {
    super(domain, ProtocolErrorType.PROPERTY_UNDEFINED, description)
  }
}

/**
 * Gets thrown if an internal method fails
 */
export class OperationFailedError extends CoinlibError {
  constructor(domain: Domain, description?: string) {
    super(domain, ProtocolErrorType.OPERATION_FAILED, description)
  }
}

/**
 * Gets thrown if a method is executed which is not implemented
 */
export class NotImplementedError extends CoinlibError {
  constructor(domain: Domain, description?: string) {
    super(domain, ProtocolErrorType.NOT_IMPLEMENTED, description)
  }
}

/**
 * Gets thrown if a variable has a value which cannot be handled
 */
export class InvalidValueError extends CoinlibError {
  constructor(domain: Domain, description?: string) {
    super(domain, ProtocolErrorType.INVALID_VALUE, description)
  }
}

export class SerializerError extends CoinlibError {
  constructor(code: string, description?: string) {
    super(Domain.SERIALIZER, code, description)
  }
}

// tslint:disable:max-classes-per-file

/**
 * Gets thrown if the serializer version does not match
 */
export class SerializerVersionMismatch extends SerializerError {
  constructor(description?: string) {
    super(SerializerErrorType.SERIALIZER_VERSION_MISMATCH, description)
  }
}

/**
 * Gets thrown if the serializer cannot handle the specified coin/protocol
 */
export class ProtocolNotSupported extends SerializerError {
  constructor(description?: string) {
    super(SerializerErrorType.PROTOCOL_NOT_SUPPORTED, description)
  }
}

/**
 * Gets thrown if the serializer CAN handle the specified coin/protocol, but not in this version
 */
export class ProtocolVersionMismatch extends SerializerError {
  constructor(description?: string) {
    super(SerializerErrorType.PROTOCOL_VERSION_MISMATCH, description)
  }
}

/**
 * Gets thrown if the specified Type is not supported
 */
export class TypeNotSupported extends SerializerError {
  constructor(description?: string) {
    super(SerializerErrorType.TYPE_NOT_SUPPORTED, description)
  }
}

/**
 * Gets thrown if the schema in the serializer is invalid
 */
export class InvalidSchema extends SerializerError {
  constructor(description?: string) {
    super(SerializerErrorType.INVALID_SCHEMA, description)
  }
}

/**
 * Gets thrown if the 2 types provided are not compatible
 */
export class InvalidSchemaType extends SerializerError {
  constructor(description?: string) {
    super(SerializerErrorType.INVALID_SCHEMA_TYPE, description)
  }
}

/**
 * Gets thrown if the string is not a valid hex string
 */
export class InvalidHexString extends SerializerError {
  constructor(description?: string) {
    super(SerializerErrorType.INVALID_HEX_STRING, description)
  }
}

/**
 * Gets thrown if the string starts with "0x". This causes problems with RLP
 */
export class InvalidString extends SerializerError {
  constructor(description?: string) {
    super(SerializerErrorType.INVALID_STRING, description)
  }
}
