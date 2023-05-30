import { readFileSync, writeFileSync } from 'fs'

const replaceInFile: (file: string, src: string, dest: string) => void = (file: string, src: string, dest: string): void => {
  const content: string = readFileSync(file, 'utf-8')
  const newContent: string = content.split(src).join(dest)
  writeFileSync(file, newContent)
}

replaceInFile('../../node_modules/ethereumjs-util/dist/account.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('../../node_modules/ethereumjs-util/dist/address.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('../../node_modules/ethereumjs-util/dist/bytes.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('../../node_modules/ethereumjs-util/dist/constants.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('../../node_modules/ethereumjs-util/dist/externals.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
replaceInFile('../../node_modules/ethereumjs-util/dist/types.d.ts', "import BN from 'bn.js';", "import * as BN from 'bn.js';")
