export type CborValue = ArrayBuffer & {
  __brand: "CBOR";
};

const enum MajorType {
  UnsignedInteger = 0,
  SignedInteger = 1,
  ByteString = 2,
  TextString = 3,
  Array = 4,
  Map = 5,
  Tag = 6,
  SimpleValue = 7,
}
const enum MinorType {
  Int8 = 24,
  Int16 = 25,
  Int32 = 26,
  Int64 = 27,
}

const MAX_U64_NUMBER = 0x20000000000000;

function _concat(a: ArrayBuffer, ...args: ArrayBuffer[]): CborValue {
  const newBuffer = new Uint8Array(a.byteLength + args.reduce((acc, b) => acc + b.byteLength, 0));

  newBuffer.set(new Uint8Array(a), 0);
  let i = a.byteLength;
  for (const b of args) {
    newBuffer.set(new Uint8Array(b), i);
    i += b.byteLength;
  }

  return newBuffer.buffer as CborValue;
}

function _serializeValue(major: MajorType, minor: MinorType, value: string): CborValue {
  // Remove everything that's not an hexadecimal character. These are not
  // considered errors since the value was already validated and they might
  // be number decimals or sign.
  value = value.replace(/[^0-9a-fA-F]/g, "");

  // Create the buffer from the value with left padding with 0.
  const length = 2 ** (minor - MinorType.Int8);
  value = value.slice(-length * 2).padStart(length * 2, "0");
  const bytes = [(major << 5) + minor].concat(
    value.match(/../g)!.map((byte) => parseInt(byte, 16))
  );

  return new Uint8Array(bytes).buffer as CborValue;
}

function _serializeNumber(major: MajorType, value: number): CborValue {
  if (value < 24) {
    return new Uint8Array([(major << 5) + value]).buffer as CborValue;
  } else {
    const minor =
      value <= 0xff
        ? MinorType.Int8
        : value <= 0xffff
        ? MinorType.Int16
        : value <= 0xffffffff
        ? MinorType.Int32
        : MinorType.Int64;

    return _serializeValue(major, minor, value.toString(16));
  }
}

function _serializeString(str: string) {
  const utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) {
      utf8.push(charcode);
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      // Surrogate pair
      i++;
      charcode = ((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff);
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }

  return _concat(
    new Uint8Array(_serializeNumber(MajorType.TextString, str.length)),
    new Uint8Array(utf8)
  );
}

/**
 * Tag a value.
 */
export function tagged(tag: number, value: CborValue): CborValue {
  if (tag == 0xd9d9f7) {
    return _concat(new Uint8Array([0xd9, 0xd9, 0xf7]), value);
  }

  if (tag < 24) {
    return _concat(new Uint8Array([(MajorType.Tag << 5) + tag]), value);
  } else {
    const minor =
      tag <= 0xff
        ? MinorType.Int8
        : tag <= 0xffff
        ? MinorType.Int16
        : tag <= 0xffffffff
        ? MinorType.Int32
        : MinorType.Int64;

    const length = 2 ** (minor - MinorType.Int8);
    const value = tag
      .toString(16)
      .slice(-length * 2)
      .padStart(length * 2, "0");
    const bytes = [(MajorType.Tag << 5) + minor].concat(
      value.match(/../g)!.map((byte) => parseInt(byte, 16))
    );

    return new Uint8Array(bytes).buffer as CborValue;
  }
}

/**
 * Set the raw bytes contained by this value. This should only be used with another
 * CborValue, or if you are implementing extensions to CBOR.
 * @param bytes A buffer containing the value.
 */
export function raw(bytes: Uint8Array): CborValue {
  return new Uint8Array(bytes).buffer as CborValue;
}

/**
 * Encode a number that is between [0, 23].
 * @param n
 */
export function uSmall(n: number): CborValue {
  if (isNaN(n)) {
    throw new RangeError("Invalid number.");
  }
  n = Math.min(Math.max(0, n), 23); // Clamp it.
  const bytes = [(MajorType.UnsignedInteger << 5) + n];
  return new Uint8Array(bytes).buffer as CborValue;
}

/**
 * Encode a number that is between [0, 255].
 */
export function u8(u8: number): CborValue;

/**
 * Encode a number that is between [0, 255], passed as a string.
 */
export function u8(u8: string, radix?: number): CborValue;

export function u8(u8: number | string, radix?: number): CborValue {
  // Force u8 into a number, and validate it.
  u8 = parseInt("" + u8, radix);
  if (isNaN(u8)) {
    throw new RangeError("Invalid number.");
  }

  u8 = Math.min(Math.max(0, u8), 0xff); // Clamp it.
  u8 = u8.toString(16);
  return _serializeValue(MajorType.UnsignedInteger, MinorType.Int8, u8);
}

/**
 * Encode a number that is between [0, 65535].
 */
export function u16(u16: number): CborValue;

/**
 * Encode a number that is between [0, 65535], passed as a string.
 */
export function u16(u16: string, radix?: number): CborValue;

export function u16(u16: number | string, radix?: number): CborValue {
  // Force u16 into a number, and validate it.
  u16 = parseInt("" + u16, radix);
  if (isNaN(u16)) {
    throw new RangeError("Invalid number.");
  }

  u16 = Math.min(Math.max(0, u16), 0xffff); // Clamp it.
  u16 = u16.toString(16);
  return _serializeValue(MajorType.UnsignedInteger, MinorType.Int16, u16);
}

/**
 * Encode a number that is between [0, 2^32 - 1].
 */
export function u32(u32: number): CborValue;
/**
 * Encode a number that is between [0, 2^32 - 1], passed as a string.
 */
export function u32(u32: string, radix?: number): CborValue;

export function u32(u32: number | string, radix?: number): CborValue {
  // Force u32 into a number, and validate it.
  u32 = parseInt("" + u32, radix);
  if (isNaN(u32)) {
    throw new RangeError("Invalid number.");
  }

  u32 = Math.min(Math.max(0, u32), 0xffffffff); // Clamp it.
  u32 = u32.toString(16);
  return _serializeValue(MajorType.UnsignedInteger, MinorType.Int32, u32);
}

/**
 * Encode a number that is between [0, 2^64 - 1]. This cannot encode all values and
 * is lossy for very large numbers (above 2^52). Use the string version (with radix 16)
 * to pass direct numbers.
 */
export function u64(u64: number): CborValue;
/**
 * Encode a number that is between [0, 2^64 - 1], passed as a string.
 */
export function u64(u64: string, radix?: number): CborValue;

export function u64(u64: number | string, radix?: number): CborValue {
  // Special consideration for numbers that might be larger than expected.
  if (typeof u64 == "string" && radix == 16) {
    // This is the only case where we guarantee we'll encode the number directly.
    // Validate it's all hexadecimal first.
    if (u64.match(/[^0-9a-fA-F]/)) {
      throw new RangeError("Invalid number.");
    }
    return _serializeValue(MajorType.UnsignedInteger, MinorType.Int64, u64);
  }

  // Force u64 into a number, and validate it.
  u64 = parseInt("" + u64, radix);
  if (isNaN(u64)) {
    throw new RangeError("Invalid number.");
  }

  u64 = Math.min(Math.max(0, u64), MAX_U64_NUMBER); // Clamp it to actual limit.
  u64 = u64.toString(16);
  return _serializeValue(MajorType.UnsignedInteger, MinorType.Int64, u64);
}

/**
 * Encode a negative number that is between [-24, -1].
 */
export function iSmall(n: number): CborValue {
  if (isNaN(n)) {
    throw new RangeError("Invalid number.");
  }
  if (n === 0) {
    return uSmall(0);
  }

  // Negative n, clamped to [1, 24], minus 1 (there's no negative 0).
  n = Math.min(Math.max(0, -n), 24) - 1;
  const bytes = [(MajorType.SignedInteger << 5) + n];
  return new Uint8Array(bytes).buffer as CborValue;
}

/**
 * Encode a negative number that is between [-256, -1].
 */
export function i8(i8: number): CborValue;
export function i8(i8: string, radix?: number): CborValue;
export function i8(i8: number | string, radix?: number): CborValue {
  // Force i8 into a number, and validate it.
  i8 = parseInt("" + i8, radix);
  if (isNaN(i8)) {
    throw new RangeError("Invalid number.");
  }

  // Negative n, clamped, minus 1 (there's no negative 0).
  i8 = Math.min(Math.max(0, -i8 - 1), 0xff);
  i8 = i8.toString(16);
  return _serializeValue(MajorType.SignedInteger, MinorType.Int8, i8);
}

/**
 * Encode a negative number that is between [-65536, -1].
 */
export function i16(i16: number): CborValue;
export function i16(i16: string, radix?: number): CborValue;
export function i16(i16: number | string, radix?: number) {
  // Force i16 into a number, and validate it.
  i16 = parseInt("" + i16, radix);
  if (isNaN(i16)) {
    throw new RangeError("Invalid number.");
  }

  // Negative n, clamped, minus 1 (there's no negative 0).
  i16 = Math.min(Math.max(0, -i16 - 1), 0xffff);
  i16 = i16.toString(16);
  return _serializeValue(MajorType.SignedInteger, MinorType.Int16, i16);
}

/**
 * Encode a negative number that is between [-2^32, -1].
 */
export function i32(i32: number): CborValue;
export function i32(i32: string, radix?: number): CborValue;
export function i32(i32: number | string, radix?: number) {
  // Force i32 into a number, and validate it.
  i32 = parseInt("" + i32, radix);
  if (isNaN(i32)) {
    throw new RangeError("Invalid number.");
  }

  // Negative n, clamped, minus 1 (there's no negative 0).
  i32 = Math.min(Math.max(0, -i32 - 1), 0xffffffff);
  i32 = i32.toString(16);
  return _serializeValue(MajorType.SignedInteger, MinorType.Int32, i32);
}

/**
 * Encode a negative number that is between [-2^64, -1].
 */
export function i64(i64: number): CborValue;
export function i64(i64: string, radix?: number): CborValue;
export function i64(i64: number | string, radix?: number) {
  // Special consideration for numbers that might be larger than expected.
  if (typeof i64 == "string" && radix == 16) {
    if (i64.startsWith("-")) {
      i64 = i64.slice(1);
    } else {
      // Clamp it.
      i64 = "0";
    }

    // This is the only case where we guarantee we'll encode the number directly.
    // Validate it's all hexadecimal first.
    if (i64.match(/[^0-9a-fA-F]/) || i64.length > 16) {
      throw new RangeError("Invalid number.");
    }

    // We need to do -1 to the number.
    let done = false;
    let newI64 = i64.split("").reduceRight((acc, x) => {
      if (done) {
        return x + acc;
      }

      let n = parseInt(x, 16) - 1;
      if (n >= 0) {
        done = true;
        return n.toString(16) + acc;
      } else {
        return "f" + acc;
      }
    }, "");

    if (!done) {
      // This number was 0.
      return u64(0);
    }
    return _serializeValue(MajorType.SignedInteger, MinorType.Int64, newI64);
  }

  // Force i64 into a number, and validate it.
  i64 = parseInt("" + i64, radix);
  if (isNaN(i64)) {
    throw new RangeError("Invalid number.");
  }

  i64 = Math.min(Math.max(0, -i64 - 1), 0x20000000000000); // Clamp it to actual.
  i64 = i64.toString(16);
  return _serializeValue(MajorType.SignedInteger, MinorType.Int64, i64);
}

/**
 * Encode a number using the smallest amount of bytes, by calling the methods
 * above. e.g. If the number fits in a u8, it will use that.
 */
export function number(n: number): CborValue {
  if (n >= 0) {
    if (n < 24) {
      return uSmall(n);
    } else if (n <= 0xff) {
      return u8(n);
    } else if (n <= 0xffff) {
      return u16(n);
    } else if (n <= 0xffffffff) {
      return u32(n);
    } else {
      return u64(n);
    }
  } else {
    if (n >= -24) {
      return iSmall(n);
    } else if (n >= -0xff) {
      return i8(n);
    } else if (n >= -0xffff) {
      return i16(n);
    } else if (n >= -0xffffffff) {
      return i32(n);
    } else {
      return i64(n);
    }
  }
}

/**
 * Encode a byte array. This is different than the `raw()` method.
 */
export function bytes(bytes: ArrayBuffer): CborValue {
  return _concat(_serializeNumber(MajorType.ByteString, bytes.byteLength), bytes);
}

/**
 * Encode a JavaScript string.
 */
export function string(str: string): CborValue {
  return _serializeString(str);
}

/**
 * Encode an array of cbor values.
 */
export function array(items: CborValue[]): CborValue {
  return _concat(_serializeNumber(MajorType.Array, items.length), ...items);
}

/**
 * Encode a map of key-value pairs. The keys are string, and the values are CBOR
 * encoded.
 */
export function map(
  items: Map<string, CborValue> | { [key: string]: CborValue },
  stable = false
): CborValue {
  if (!(items instanceof Map)) {
    items = new Map(Object.entries(items));
  }

  let entries = Array.from(items.entries());
  if (stable) {
    entries = entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  }

  return _concat(
    _serializeNumber(MajorType.Map, items.size),
    ...entries.map(([k, v]) => _concat(_serializeString(k), v))
  );
}

/**
 * Encode a single (32 bits) precision floating point number.
 */
export function singleFloat(f: number): CborValue {
  const single = new Float32Array([f]);
  return _concat(
    new Uint8Array([(MajorType.SimpleValue << 5) + 26]),
    new Uint8Array(single.buffer)
  );
}

/**
 * Encode a double (64 bits) precision floating point number.
 */
export function doubleFloat(f: number): CborValue {
  const single = new Float64Array([f]);
  return _concat(
    new Uint8Array([(MajorType.SimpleValue << 5) + 27]),
    new Uint8Array(single.buffer)
  );
}

export function bool(v: boolean): CborValue {
  return v ? true_() : false_();
}

/**
 * Encode the boolean true.
 */
export function true_(): CborValue {
  return raw(new Uint8Array([(MajorType.SimpleValue << 5) + 21]));
}

/**
 * Encode the boolean false.
 */
export function false_(): CborValue {
  return raw(new Uint8Array([(MajorType.SimpleValue << 5) + 20]));
}

/**
 * Encode the constant null.
 */
export function null_(): CborValue {
  return raw(new Uint8Array([(MajorType.SimpleValue << 5) + 22]));
}

/**
 * Encode the constant undefined.
 */
export function undefined_(): CborValue {
  return raw(new Uint8Array([(MajorType.SimpleValue << 5) + 23]));
}
