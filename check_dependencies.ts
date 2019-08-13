import Axios, { AxiosError } from './src/dependencies/src/axios-0.19.0/index'
import { readFileSync, writeFileSync, exists, mkdirSync } from 'fs'
/*
function getStringDifference(a: string, b: string): string {
  let i: number = 0
  let j: number = 0
  let result: string = ''

  while (j < b.length) {
    if (a[i] !== b[j] || i === a.length) {
      result += b[j]
    } else {
      i++
    }
    j++
  }

  return result
}
*/

interface Dependency {
  version: string
  repository: string
  commitHash: string
  files: string[]
}

function log(color: string, ...message: any[]): void {
  const colors: { [key: string]: string } = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  }

  const hasColor: string = colors[color]

  if (hasColor) {
    console.log(`${colors[color]}%s\x1b[0m`, ...message)
  } else {
    console.log(...message)
  }
}

const dependencies: string = readFileSync('./src/dependencies/deps.json', 'utf-8')

const deps: { [key: string]: Dependency } = JSON.parse(dependencies)

for (const prop of Object.keys(deps)) {
  const urlLatestCommits: string = `https://api.github.com/repos/${deps[prop].repository}/commits`

  Axios(urlLatestCommits)
    .then(response => {
      const { data }: { data: { sha: string }[] } = response
      const isSame: boolean = deps[prop].commitHash === data[0].sha
      const diffUrl: string = `https://github.com/${deps[prop].repository}/compare/${deps[prop].commitHash.substr(
        0,
        7
      )}..${data[0].sha.substr(0, 7)}`
      log(isSame ? 'green' : 'red', `${prop} (commit): ${isSame ? 'up to date' : diffUrl}`)
    })
    .catch((error: AxiosError) => {
      console.error(error)
    })

  for (const file of deps[prop].files) {
    try {
      mkdirSync(`./src/dependencies/src/${prop}/`, { recursive: true })
    } catch (e) {}

    const urlCommit: string = `https://raw.githubusercontent.com/${deps[prop].repository}/${deps[prop].commitHash}/${file}`
    // const urlMaster: string = `https://raw.githubusercontent.com/${deps[prop].repository}/master/${file}`
    const localPath = `./src/dependencies/src/${prop}/${file}`

    exists(localPath, exists => {
      if (!exists) {
        console.log('DOES NOT EXIST')
        Axios(urlCommit)
          .then(response => {
            writeFileSync(localPath, response.data)
            log('green', `${prop} (commit): Saved file: ${file}`)
          })
          .catch((error: AxiosError) => {
            console.error(error)
          })
      }
    })
    /*
    Axios(urlCommit)
      .then(response => {
        const difference: string = getStringDifference(localContent.trim(), response.data.trim())
        const isSame: boolean = difference.trim().length === 0
        log(isSame ? 'green' : 'red', `${prop} (commit): ${file} is ${isSame ? 'unchanged' : 'CHANGED'}`)
      })
      .catch((error: AxiosError) => {
        console.error(error)
      })

    Axios(urlMaster)
      .then(response => {
        const difference: string = getStringDifference(localContent.trim(), response.data.trim())
        const isSame: boolean = difference.trim().length === 0
        log(isSame ? 'green' : 'red', `${prop} (master): ${file} is ${isSame ? 'unchanged' : 'CHANGED'}`)
      })
      .catch((error: AxiosError) => {
        console.error(error)
      })*/
  }
}
