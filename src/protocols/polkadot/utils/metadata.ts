import { TransactionMetadata } from "../data/metadata/TransactionMetadata";

export function parseTransactionMetadata(metadata: string | null): Map<string, TransactionMetadata> {
    const extrinsicMetadataMap = new Map()

    // TODO: parse metadata
    extrinsicMetadataMap['balances_transfer'] = {
        moduleIndex: 4,
        callIndex: 0
    }
    extrinsicMetadataMap['democracy_delegate'] = {
        moduleIndex: 14,
        callIndex: 15
    }

    return extrinsicMetadataMap
}