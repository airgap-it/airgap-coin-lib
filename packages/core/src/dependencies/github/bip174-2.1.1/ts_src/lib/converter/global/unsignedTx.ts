import { KeyValue, Transaction } from '../../interfaces';
import { GlobalTypes } from '../../typeFields';

export function encode(data: Transaction): KeyValue {
  return {
    key: Buffer.from([GlobalTypes.UNSIGNED_TX]),
    value: data.toBuffer(),
  };
}
