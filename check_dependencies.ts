import { existsSync, readFileSync } from 'fs'
import { request } from 'https'
import * as semver from 'semver'

import { copyFileAndCreateFolder, createFolderIfNotExists, writeFileAndCreateFolder } from './check_dependencies_fs'

function httpGet(params) {
  return new Promise((resolve, reject) => {
    const req = request(params, res => {
      // reject on bad status
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        return reject(new Error('statusCode=' + res.statusCode))
      }

      // cumulate data
      let body: any[] = []
      res.on('data', chunk => {
        body.push(chunk)
      })
      // resolve on end
      res.on('end', () => {
        try {
          body = JSON.parse(Buffer.concat(body).toString())
        } catch (e) {
          body = Buffer.concat(body).toString() as any
        }
        resolve(body)
      })
    })
    // reject on request error
    req.on('error', err => {
      // This is not a "Second reject", just a different sort of failure
      reject(err)
    })
    // IMPORTANT
    req.end()
  })
}

const cliCommand: string = process.argv[2]

const validCommands = [undefined, 'check']

if (!validCommands.some(validCommand => validCommand === cliCommand)) {
  throw new Error('invalid command')
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

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
  name: string // Name of the module
  entrypoint: string
  version: string
  repository: string
  commitHash: string
  files: string[]
  renameFiles?: [string, string][]
  replaceInFiles?: { filename: string; replacements: { from: string; to: string; expectedReplacements: number }[] }[]
  deps?: string[]
  ignoredDeps: { module: string; reason: string }[]
}

interface DepsFile {
  [key: string]: Dependency
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
    console.log(color, ...message)
  }
}

export const validateDepsJson = async (depsFile: DepsFile) => {
  log(`
#############################
##                         ##
## VALIDATING DEPENDENCIES ##
##                         ##
#############################
`)

  const verificationFailed = (prop: string, reason: string) => {
    log('red', `${prop} is invalid because ${reason}`)

    return false
  }

  const packageJson = JSON.parse(readFileSync(`./package.json`, 'utf-8'))

  const topLevelPackages = Object.keys(packageJson.localDependencies).map(tlp => `${tlp}-${packageJson.localDependencies[tlp]}`)
  topLevelPackages.forEach(pkgName => {
    if (depsFile[pkgName]) {
      log('green', `${pkgName} is in deps file`)
    } else {
      log('red', `${pkgName} is NOT in deps file`)
    }
  })

  const keys = Object.keys(depsFile)
  for (const prop of keys) {
    log('blue', `--- ${prop} ---`)
    let isValid = true

    if (!prop.endsWith(depsFile[prop].version)) {
      isValid =
        isValid && verificationFailed(prop, `version in key doesn't match version in json. ${prop} should end in ${depsFile[prop].version}`)
    }

    if (!prop.startsWith(depsFile[prop].name)) {
      isValid =
        isValid &&
        verificationFailed(prop, `name in key doesn't match name of repository. ${prop} should start with ${depsFile[prop].name}`)
    }

    const pkg = JSON.parse(readFileSync(`./src/dependencies/github/${prop}/package.json`, 'utf-8'))
    if (!pkg) {
      isValid = isValid && verificationFailed(prop, `package.json not found`)
    }
    if (pkg.dependencies) {
      const dependencyKeys = Object.keys(pkg.dependencies)
      for (const dependency of dependencyKeys) {
        const key = keys.find(key => key.startsWith(dependency + '-')) // TODO: Handle packages that start with the same name
        if (!key) {
          if (depsFile[prop].ignoredDeps) {
            const x = depsFile[prop].ignoredDeps.find(ignoredDep => ignoredDep.module === dependency)
            if (x) {
              log('green', `Ignored "${dependency}" because ${x.reason}`)
            } else {
              isValid = isValid && verificationFailed(prop, `${dependency} not found`)
            }
          } else {
            isValid = isValid && verificationFailed(prop, `${dependency} not found`)
          }
        } else {
          const packageDeps = depsFile[prop].deps
          if (!(packageDeps && packageDeps.some(dep => dep.startsWith(dependency + '-')))) {
            isValid = isValid && verificationFailed(dependency, `is not in deps!`)
          } else {
            const keyVersion = key.substr(key.lastIndexOf('-') + 1) // TODO: Handle multiple versions
            const isSatisfied = semver.satisfies(keyVersion, pkg.dependencies[dependency])
            if (!isSatisfied) {
              console.log('FAIL', keyVersion, pkg.dependencies[dependency])
              isValid = isValid && verificationFailed(dependency, `version is not satisfied`)
            }
          }
        }
      }
    }

    const deps = depsFile[prop].deps
    if (deps) {
      deps.forEach(dep => {
        if (!depsFile[dep]) {
          isValid = isValid && verificationFailed(prop, `dependency ${dep} doesn't exist`)
        }
      })
    }

    const renameFiles = depsFile[prop].renameFiles
    if (renameFiles) {
      renameFiles.forEach(([source, destination]) => {
        if (!depsFile[prop].files.includes(source)) {
          isValid = isValid && verificationFailed(prop, `renaming file that does not exist in files array ${source}`)
        }
      })
    }

    const parentPackages = keys.filter(key => {
      const deps = depsFile[key].deps
      if (deps) {
        return deps.includes(prop)
      }

      return false
    })

    if (parentPackages.length === 0) {
      // Check if it's a top level package
      if (!topLevelPackages.includes(prop)) {
        isValid = isValid && verificationFailed(prop, `is not used in any other package`)
      }
    }

    if (isValid) {
      log('green', `${prop} is valid`)
    } else {
      log('blue', `--- ${prop} ---`)
    }
  }
}

const simpleHash = (s: string): string => {
  let h = 0xdeadbeef
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 2654435761)
  }

  const code = (h ^ (h >>> 16)) >>> 0
  const buff = Buffer.from(code.toString())

  return buff
    .toString('base64')
    .split('=')
    .join('')
}

const downloadFile = async (url: string) => {
  const cachePath = './src/dependencies/cache/'
  const cacheFile = `${cachePath}${simpleHash(url)}`

  const fileExists = existsSync(cacheFile)

  if (fileExists) {
    log('cyan', `Using cache ${url}`)

    return readFileSync(cacheFile, 'utf-8')
  } else {
    try {
      log('magenta', `Downloading ${url}`)

      const response: any = await httpGet(url)
      writeFileAndCreateFolder(cacheFile, response)

      return response
    } catch (error) {
      if (error.response && error.response.status) {
        log('red', `Error: ${error.config.url} ${error.response.status}`)
      } else {
        throw error
      }
    }
  }
}

// export const checkCacheAndDownload = (cachePath: string, localPath: string, remotePath: string) => {
//   return new Promise((resolve, reject) => {
//     exists(cachePath, exists => {
//       if (!exists) {
//         console.log('DOES NOT EXIST', localPath)
//         downloadFile(remotePath)
//           .then(data => {
//             createFolderIfNotExists(localPath)

//             resolve(data)
//           })
//           .catch((error: AxiosError) => {
//             reject(error)
//           })
//       } else {
//         console.log('ALREADY EXISTS')
//       }
//     })
//   })
// }

export const getPackageJsonForDepsFiles = async (depsFile: DepsFile) => {
  for (const prop of Object.keys(depsFile)) {
    createFolderIfNotExists(`./src/dependencies/github/${prop}/`)
    const localPath = `./src/dependencies/github/${prop}/package.json`
    const fileExists = existsSync(localPath)
    if (!fileExists) {
      console.log('DOES NOT EXIST', prop)
      const urlCommit: string = `https://raw.githubusercontent.com/${depsFile[prop].repository}/${depsFile[prop].commitHash}/package.json`
      const data = await downloadFile(urlCommit)
      writeFileAndCreateFolder(localPath, data)
      log('green', `${prop} (commit): Saved package.json`)
    } else {
      console.log(`ALREADY EXISTS: ${prop}`)
    }
  }
}

export const getFilesForDepsFile = async (depsFile: DepsFile) => {
  for (const prop of Object.keys(depsFile)) {
    // const urlLatestCommits: string = `https://api.github.com/repos/${depsFile[prop].repository}/commits`

    // Axios(urlLatestCommits)
    //   .then(response => {
    //     const { data }: { data: { sha: string }[] } = response
    //     const isSame: boolean = depsFile[prop].commitHash === data[0].sha
    //     const diffUrl: string = `https://github.com/${depsFile[prop].repository}/compare/${depsFile[prop].commitHash.substr(
    //       0,
    //       7
    //     )}..${data[0].sha.substr(0, 7)}`
    //     log(isSame ? 'green' : 'red', `${prop} (commit): ${isSame ? 'up to date' : diffUrl}`)
    //   })
    //   .catch((error: AxiosError) => {
    //     console.error(error)
    //   })

    for (const file of depsFile[prop].files) {
      const urlCommit: string = `https://raw.githubusercontent.com/${depsFile[prop].repository}/${depsFile[prop].commitHash}/${file}`
      // const urlMaster: string = `https://raw.githubusercontent.com/${depsFile[prop].repository}/master/${file}`

      // Rename files when copying
      let renamedFile = file
      const renamedFiles = depsFile[prop].renameFiles
      if (renamedFiles) {
        const replaceArray = renamedFiles.find(replace => replace[0] === file)
        if (replaceArray) {
          renamedFile = replaceArray[1]
        }
      }

      const localPath = `./src/dependencies/src/${prop}/${renamedFile}`
      const localCache = `./src/dependencies/github/${prop}/${file}`

      const cacheExists = existsSync(localCache)
      if (!cacheExists) {
        const data = await downloadFile(urlCommit)

        if (!data) {
          return
        }

        writeFileAndCreateFolder(localCache, data)
        log('green', `${prop} (commit): Cached file: ${file}`)
      }

      // const fileExists = existsSync(localPath)
      // if (!fileExists) {
      //   console.log('DOES NOT EXIST, CHECKING CACHE ' + localPath)

      copyFileAndCreateFolder(localCache, localPath)

      // }

      /*
      downloadFile(urlCommit)
        .then(data => {
          const difference: string = getStringDifference(localContent.trim(), data.trim())
          const isSame: boolean = difference.trim().length === 0
          log(isSame ? 'green' : 'red', `${prop} (commit): ${file} is ${isSame ? 'unchanged' : 'CHANGED'}`)
        })
        .catch((error: AxiosError) => {
          
        })
  
      downloadFile(urlMaster)
        .then(data => {
          const difference: string = getStringDifference(localContent.trim(), data.trim())
          const isSame: boolean = difference.trim().length === 0
          log(isSame ? 'green' : 'red', `${prop} (master): ${file} is ${isSame ? 'unchanged' : 'CHANGED'}`)
        })
        .catch((error: AxiosError) => {
          
        })*/
    }
  }
}

const replaceWithinContainer = (content: string, before: string, after: string) => {
  const containers = [`require("PLACEHOLDER")`, `require('PLACEHOLDER')`, ` from "PLACEHOLDER"`, ` from 'PLACEHOLDER'`]
  for (const container of containers) {
    const searchString = container.split('PLACEHOLDER').join(before)
    const replaceString = container.split('PLACEHOLDER').join(after)
    content = content.split(searchString).join(replaceString)
  }

  return content
}

const replaceImports = async (depsFile: DepsFile) => {
  for (const prop of Object.keys(depsFile)) {
    const predefinedReplacements = depsFile[prop].replaceInFiles
    for (const file of depsFile[prop].files) {
      // Rename files
      let renamedFile = file
      const renamedFiles = depsFile[prop].renameFiles
      if (renamedFiles) {
        const replaceArray = renamedFiles.find(replace => replace[0] === file)
        if (replaceArray) {
          renamedFile = replaceArray[1]
        }
      }

      const localPath = `./src/dependencies/src/${prop}/${renamedFile}`

      let fileContent = readFileSync(localPath, 'utf-8')

      // INCLUDE DEFINED REPLACEMENTS
      if (predefinedReplacements) {
        const replacements = predefinedReplacements.find(predefinedReplacement => predefinedReplacement.filename === renamedFile)
        if (replacements) {
          replacements.replacements.forEach(replacement => {
            const count = (fileContent.match(new RegExp(escapeRegExp(replacement.from), 'g')) || []).length
            if (count === replacement.expectedReplacements) {
              fileContent = fileContent.split(replacement.from).join(replacement.to)
            } else {
              log('red', `EXPECTED ${replacement.expectedReplacements} MATCHES BUT HAVE ${count}`)
            }
          })
        }
      }

      const dependencies = depsFile[prop].deps

      if (dependencies) {
        for (const dependency of dependencies) {
          const dependencyDefinition = depsFile[dependency]
          if (!dependencyDefinition) {
            console.log('WOOPS', dependency)
          } else {
            const levels = (file.match(/\//g) || []).length
            const levelUpString = '../'

            if (dependencyDefinition.entrypoint === '') {
              dependencyDefinition.entrypoint = 'index'
            }
            const relativePath = `${levelUpString.repeat(levels + 1)}${dependencyDefinition.name}-${dependencyDefinition.version}/${
              dependencyDefinition.entrypoint
            }`

            fileContent = replaceWithinContainer(fileContent, dependencyDefinition.name, relativePath)
          }
        }
      }

      writeFileAndCreateFolder(localPath, fileContent)
    }
  }
}

{
  const dependencies: string = readFileSync('./src/dependencies/deps.json', 'utf-8')

  const deps: DepsFile = JSON.parse(dependencies)

  createFolderIfNotExists(`./src/dependencies/cache/`)
  createFolderIfNotExists(`./src/dependencies/github/`)
  createFolderIfNotExists(`./src/dependencies/src/`)

  console.log('START')
  getFilesForDepsFile(deps).then(() => {
    console.log('MID')

    getPackageJsonForDepsFiles(deps).then(() => {
      console.log('END')
      validateDepsJson(deps).then(() => {
        console.log('VALIDATED')
        replaceImports(deps).then(() => {
          console.log('REPLACED IMPORTS')
        })
      })
    })
  })
}
