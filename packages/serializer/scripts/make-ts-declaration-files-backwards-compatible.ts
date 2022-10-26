import { readFileSync, writeFileSync } from 'fs'

const replaceInFile: (file: string, src: string, dest: string) => void = (file: string, src: string, dest: string): void => {
  const content: string = readFileSync(file, 'utf-8')
  const newContent: string = content.split(src).join(dest)
  writeFileSync(file, newContent)
}

replaceInFile(
  './dist/v2/utils/toBuffer.d.ts',
  'export declare type RLPData = number | string | boolean | BigNumber | Buffer | RLPData[]',
  'export declare type RLPData = number | string | boolean | BigNumber | Buffer'
)
