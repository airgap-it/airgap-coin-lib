import { StellarAssetMetadata } from '../types/protocol'

export const stellarAssets: Record<string, StellarAssetMetadata> = {
  'stellar-asset-usdc': {
    assetCode: 'USDC',
    name: 'Stellar USD Coin',
    marketSymbol: 'usdc',
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    decimals: 7,
    identifier: 'stellar-asset-usdc'
  },
  'stellar-asset-eurc': {
    assetCode: 'EURC',
    name: 'Stellar Euro Coin',
    marketSymbol: 'eurc',
    issuer: 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2',
    decimals: 7,
    identifier: 'stellar-asset-eurc'
  },
  'stellar-asset-velo': {
    assetCode: 'VELO',
    name: 'Velo Token',
    marketSymbol: 'velo',
    issuer: 'GDM4RQUQQUVSKQA7S6EM7XBZP3FCGH4Q7CL6TABQ7B2BEJ5ERARM2M5M',
    decimals: 7,
    identifier: 'stellar-asset-velo'
  },
  'stellar-asset-shx': {
    assetCode: 'SHX',
    name: 'Stronghold Token',
    marketSymbol: 'shx',
    issuer: 'GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH',
    decimals: 7,
    identifier: 'stellar-asset-shx'
  },
  'stellar-asset-aqua': {
    assetCode: 'AQUA',
    name: 'Aqua Token',
    marketSymbol: 'aqua',
    issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
    decimals: 7,
    identifier: 'stellar-asset-aqua'
  }
}

export const stellarAssetsIdentifiers: string[] = Object.keys(stellarAssets)
