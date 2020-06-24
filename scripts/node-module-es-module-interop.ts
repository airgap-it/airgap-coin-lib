import { readFileSync, writeFileSync } from 'fs'

const replaceInFile: (file: string, src: string, dest: string) => void = (file: string, src: string, dest: string): void => {
  const content: string = readFileSync(file, 'utf-8')
  const newContent: string = content.split(src).join(dest)
  writeFileSync(file, newContent)
}

replaceInFile(`./node_modules/@polkadot/util/bn/max.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/bn/consts.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/bn/min.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/bn/sqrt.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/bn/toBn.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/bn/toHex.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/bn/toU8a.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/compact/fromU8a.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/compact/toU8a.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/format/formatBalance.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/format/formatElapsed.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/format/formatNumber.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/hex/toBn.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/is/bn.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)
replaceInFile(`./node_modules/@polkadot/util/u8a/toBn.d.ts`, `import BN from 'bn.js';`, `import * as BN from 'bn.js';`)

replaceInFile(`./node_modules/@polkadot/util/types.d.ts`, `import type BN from 'bn.js';`, `import * as BN from 'bn.js';`)
