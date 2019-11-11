import { CoinlibError, Domain } from "./coinlib-error";

export class SerializerError extends CoinlibError {
	constructor(code: string, description?: string) {
		super(Domain.SERIALIZER, code, description)
	}
}

/**
 * Gets thrown if the serializer version does not match
 */
export class SerializerVersionMismatch extends SerializerError {
	constructor(description?: string) {
		super('SERIALIZER_VERSION_MISMATCH', description)
	}
}

/**
 * Gets thrown if the serializer cannot handle the specified coin/protocol
 */
export class ProtocolNotSupported extends SerializerError {
	constructor(description?: string) {
		super('PROTOCOL_NOT_SUPPORTED', description)
	}
}

/**
 * Gets thrown if the serializer CAN handle the specified coin/protocol, but not in this version
 */
export class ProtocolVersionMismatch extends SerializerError {
	constructor(description?: string) {
		super('PROTOCOL_VERSION_MISMATCH', description)
	}
}

/**
 * Gets thrown if the specified Type is not supported
 */
export class TypeNotSupported extends SerializerError {
	constructor(description?: string) {
		super('TYPE_NOT_SUPPORTED', description)
	}
}

/**
 * Gets thrown if the schema in the serializer is invalid
 */
export class InvalidSchema extends SerializerError {
	constructor(description?: string) {
		super('INVALID_SCHEMA', description)
	}
}

/**
 * Gets thrown if the 2 types provided are not compatible
 */
export class InvalidSchemaType extends SerializerError {
	constructor(description?: string) {
		super('INVALID_SCHEMA_TYPE', description)
	}
}
