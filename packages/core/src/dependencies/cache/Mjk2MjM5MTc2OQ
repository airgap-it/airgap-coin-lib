import * as cbor from "./value";
import { CborValue } from "./value";

export interface CborEncoder<T> {
  readonly name: string;
  readonly priority: number;

  match(value: any): boolean;
  encode(value: T): cbor.CborValue;
}

const BufferClasses = [
  ArrayBuffer,
  Uint8Array,
  Uint16Array,
  Uint32Array,
  Int8Array,
  Int16Array,
  Int32Array,
  Float32Array,
  Float64Array,
];

export class JsonDefaultCborEncoder implements CborEncoder<any> {
  // @param _serializer The CBOR Serializer to use.
  // @param _stable Whether or not keys from objects should be sorted (stable). This is
  //     particularly useful when testing encodings between JSON objects.
  constructor(private _serializer: CborSerializer, private _stable = false) {}

  readonly name = "jsonDefault";
  readonly priority = -100;

  match(value: any) {
    return ["undefined", "boolean", "number", "string", "object"].indexOf(typeof value) != -1;
  }
  encode(value: any): cbor.CborValue {
    switch (typeof value) {
      case "undefined":
        return cbor.undefined_();
      case "boolean":
        return cbor.bool(value);
      case "number":
        if (Math.floor(value) === value) {
          return cbor.number(value);
        } else {
          return cbor.doubleFloat(value);
        }
      case "string":
        return cbor.string(value);
      case "object":
        if (value === null) {
          return cbor.null_();
        } else if (Array.isArray(value)) {
          return cbor.array(value.map((x) => this._serializer.serializeValue(x)));
        } else if (BufferClasses.find((x) => value instanceof x)) {
          return cbor.bytes(value.buffer);
        } else if (Object.getOwnPropertyNames(value).indexOf("toJSON") !== -1) {
          return this.encode(value.toJSON());
        } else if (value instanceof Map) {
          const m = new Map<string, cbor.CborValue>();
          for (const [key, item] of value.entries()) {
            m.set(key, this._serializer.serializeValue(item));
          }
          return cbor.map(m, this._stable);
        } else {
          const m = new Map<string, cbor.CborValue>();
          for (const [key, item] of Object.entries(value)) {
            m.set(key, this._serializer.serializeValue(item));
          }
          return cbor.map(m, this._stable);
        }
      default:
        throw new Error("Invalid value.");
    }
  }
}

export class ToCborEncoder implements CborEncoder<{ toCBOR(): cbor.CborValue }> {
  readonly name = "cborEncoder";
  readonly priority = -90;

  match(value: any) {
    return typeof value == "object" && typeof value["toCBOR"] == "function";
  }
  encode(value: { toCBOR(): cbor.CborValue }): cbor.CborValue {
    return value.toCBOR();
  }
}

export class CborSerializer {
  private _encoders = new Set<CborEncoder<any>>();

  static withDefaultEncoders(stable = false) {
    const s = new this();

    s.addEncoder(new JsonDefaultCborEncoder(s, stable));
    s.addEncoder(new ToCborEncoder());

    return s;
  }

  removeEncoder(name: string) {
    // Has to make an extra call to values() to ensure it doesn't break on iteration.
    for (const encoder of this._encoders.values()) {
      if (encoder.name == name) {
        this._encoders.delete(encoder);
      }
    }
  }
  addEncoder<T = any>(encoder: CborEncoder<T>) {
    this._encoders.add(encoder);
  }

  getEncoderFor<T = any>(value: any): CborEncoder<T> {
    let chosenEncoder: CborEncoder<any> | null = null;

    for (const encoder of this._encoders) {
      if (!chosenEncoder || encoder.priority > chosenEncoder.priority) {
        if (encoder.match(value)) {
          chosenEncoder = encoder;
        }
      }
    }

    if (chosenEncoder === null) {
      throw new Error("Could not find an encoder for value.");
    }

    return chosenEncoder;
  }

  serializeValue(value: any): CborValue {
    return this.getEncoderFor(value).encode(value);
  }

  serialize(value: any): ArrayBuffer {
    return this.serializeValue(value);
  }
}

export class SelfDescribeCborSerializer extends CborSerializer {
  serialize(value: any): ArrayBuffer {
    return cbor.raw(
      new Uint8Array([
        // Self describe CBOR.
        ...new Uint8Array([0xd9, 0xd9, 0xf7]),
        ...new Uint8Array(super.serializeValue(value)),
      ])
    );
  }
}
