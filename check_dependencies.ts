// import Axios, { AxiosError } from './src/dependencies/src/axios-0.19.0/index'
import { readFileSync /* writeFileSync, exists, mkdirSync */ } from 'fs'
import * as semver from 'semver'

const cliCommand: string = process.argv[2]

const validCommands = [undefined, 'check']

if (!validCommands.some(validCommand => validCommand === cliCommand)) {
  throw new Error('invalid command')
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
  version: string
  repository: string
  commitHash: string
  files: string[]
  renameFiles?: [string, string][]
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

const validateDepsJson = (depsFile: DepsFile) => {

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
  // verificationFailed(`version in key doesn't match version in json. ${prop} should end in ${depsFile[prop].version}`)

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
        verificationFailed(
          prop,
          `name in key doesn't match name of repository. ${prop} should start with ${depsFile[prop].name}`
        )
    }

    const pkg = JSON.parse(readFileSync(`./src/dependencies/github/${prop}/package.json`, 'utf-8'))
    if (!pkg) {
      isValid = isValid && verificationFailed(prop, `package.json not found`)
    }
    if (pkg.dependencies) {
      const dependencyKeys = Object.keys(pkg.dependencies)
      for (const dependency of dependencyKeys) {
        const key = keys.find(key => key.startsWith(dependency))
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
          const keyVersion = key.substr(key.lastIndexOf('-') + 1) // TODO: Handle multiple versions
          const isSatisfied = semver.satisfies(keyVersion, pkg.dependencies[dependency])
          if (!isSatisfied) {
            isValid = isValid && verificationFailed(dependency, `version is not satisfied`)
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

    // log('prop', depsFile[prop])
  }
}

// const getPackageJsonForDepsFiles = (depsFile: DepsFile) => {
//       for (const prop of Object.keys(depsFile)) {
//         const localPath = `./src/dependencies/github/${prop}/package.json`
//             exists(localPath, exists => {
//       if (!exists) {
//         console.log('DOES NOT EXIST', prop)
//         const urlCommit: string = `https://raw.githubusercontent.com/${depsFile[prop].repository}/${depsFile[prop].commitHash}/package.json`
//         Axios(urlCommit)
//             .then(response => {
//               mkdirSync(`./src/dependencies/github/${prop}/`, { recursive: true })
//               console.log('DATA', response.data)
//             writeFileSync(localPath, JSON.stringify(response.data, null, 4))
//             log('green', `${prop} (commit): Saved package.json`)
//           })
//           .catch((error: AxiosError) => {
//             console.error(error)
//           })
//       } else {
//         console.log('ALREADY EXISTS')
//       }

//     })

//       }
// }

{
  const dependencies: string = readFileSync('./src/dependencies/deps.json', 'utf-8')

  const deps: DepsFile = JSON.parse(dependencies)

  validateDepsJson(deps)
  // getPackageJsonForDepsFiles(deps)
}

// for (const prop of Object.keys(deps)) {
//   const urlLatestCommits: string = `https://api.github.com/repos/${deps[prop].repository}/commits`

//   Axios(urlLatestCommits)
//     .then(response => {
//       const { data }: { data: { sha: string }[] } = response
//       const isSame: boolean = deps[prop].commitHash === data[0].sha
//       const diffUrl: string = `https://github.com/${deps[prop].repository}/compare/${deps[prop].commitHash.substr(
//         0,
//         7
//       )}..${data[0].sha.substr(0, 7)}`
//       log(isSame ? 'green' : 'red', `${prop} (commit): ${isSame ? 'up to date' : diffUrl}`)
//     })
//     .catch((error: AxiosError) => {
//       console.error(error)
//     })

//   for (const file of deps[prop].files) {
//     try {
//       mkdirSync(`./src/dependencies/src/${prop}/`, { recursive: true })
//     } catch (e) {}

//     const urlCommit: string = `https://raw.githubusercontent.com/${deps[prop].repository}/${deps[prop].commitHash}/${file}`
//     // const urlMaster: string = `https://raw.githubusercontent.com/${deps[prop].repository}/master/${file}`
//     const localPath = `./src/dependencies/src/${prop}/${file}`

//     exists(localPath, exists => {
//       if (!exists) {
//         console.log('DOES NOT EXIST')
//         Axios(urlCommit)
//           .then(response => {
//             writeFileSync(localPath, response.data)
//             log('green', `${prop} (commit): Saved file: ${file}`)
//           })
//           .catch((error: AxiosError) => {
//             console.error(error)
//           })
//       }
//     })
//     /*
//     Axios(urlCommit)
//       .then(response => {
//         const difference: string = getStringDifference(localContent.trim(), response.data.trim())
//         const isSame: boolean = difference.trim().length === 0
//         log(isSame ? 'green' : 'red', `${prop} (commit): ${file} is ${isSame ? 'unchanged' : 'CHANGED'}`)
//       })
//       .catch((error: AxiosError) => {
//         console.error(error)
//       })

//     Axios(urlMaster)
//       .then(response => {
//         const difference: string = getStringDifference(localContent.trim(), response.data.trim())
//         const isSame: boolean = difference.trim().length === 0
//         log(isSame ? 'green' : 'red', `${prop} (master): ${file} is ${isSame ? 'unchanged' : 'CHANGED'}`)
//       })
//       .catch((error: AxiosError) => {
//         console.error(error)
//       })*/
//   }
// }
