import { readFileSync, writeFileSync } from 'fs'

const pkg: {
  testDependencies: { [key: string]: string }
  buildDependencies: { [key: string]: string }
  devDependencies: { [key: string]: string }
} = JSON.parse(readFileSync('./package.json', 'utf-8'))

pkg.devDependencies = { ...pkg.buildDependencies, ...pkg.testDependencies }

writeFileSync('./package.json', JSON.stringify(pkg, undefined, 2))
