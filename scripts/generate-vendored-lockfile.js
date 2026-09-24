/**
 * Generates a synthetic npm lockfile describing the vendored dependencies in
 * `packages/core/src/dependencies/deps.json`, so that they can be fed to a vulnerability scanner.
 *
 * Those dependencies are checked into the repository as source rather than installed from npm.
 * They therefore appear in no lockfile, and `npm audit`, Dependabot and a plain `trivy fs` run are
 * all blind to them. This script reconstructs the manifest a scanner needs.
 *
 * Output: `.vendored-scan/{package.json,package-lock.json}`, describing each vendored package at
 * the version recorded in `deps.json`.
 *
 * Usage: node scripts/generate-vendored-lockfile.js [outDir]
 *
 * What the scan can and cannot see, and how this script keeps it honest:
 *
 *  - Versions come from `deps.json`. Where the vendored tree also carries the upstream
 *    `package.json` (`src/<key>/package.json`), the two are cross-checked and a mismatch FAILS the
 *    run — otherwise editing one character in a version string would turn the gate green.
 *  - Entries pinned to a bare commit hash have no comparable version. They must declare
 *    `scanAsVersion` (the upstream release the commit corresponds to) or the run FAILS; a package
 *    the scanner cannot see must never be a silent exit 0. `scanAsName` additionally overrides the
 *    name when the directory name differs from the published package (`hd-wallet-js` is published
 *    as `@aeternity/hd-wallet`).
 *  - Forks are registered under the fork's own name (`groestlcoinjs-lib`, `bip32grs`, ...), which
 *    advisory databases know nothing about. Entries carrying `forkOf` are ALSO emitted under the
 *    upstream name at the same version, so advisories against the upstream reach them.
 *  - Every directory under `src/` must be either a `deps.json` entry or listed in
 *    `FIRST_PARTY_DIRECTORIES` with a reason, or the run FAILS. Vendored code that is not in
 *    `deps.json` is not scanned, and that must be a deliberate, recorded decision.
 */

const fs = require('fs')
const path = require('path')

const DEPENDENCIES_DIR = path.join(__dirname, '..', 'packages', 'core', 'src', 'dependencies')
const DEPS_FILE = path.join(DEPENDENCIES_DIR, 'deps.json')
const SOURCES_DIR = path.join(DEPENDENCIES_DIR, 'src')
const DEFAULT_OUT_DIR = path.join(__dirname, '..', '.vendored-scan')

const SEMVER = /^\d+\.\d+\.\d+([-+].*)?$/

/**
 * Directories under `src/` that are deliberately not `deps.json` entries. Each needs a reason: it
 * is either first-party code that merely lives next to the vendored packages, or something that
 * genuinely has no upstream release to scan against.
 */
const FIRST_PARTY_DIRECTORIES = {
  cosmjs: 'First-party ts-proto output for the Cosmos SDK tx protobufs (index.ts only); not a vendored npm package.'
}

function fail(message) {
  console.error(`\nERROR: ${message}`)
  process.exitCode = 1
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

/** Every `src/<name>` or `src/@scope/<name>` directory, as the key `deps.json` would use. */
function listSourceDirectories() {
  const result = []
  for (const entry of fs.readdirSync(SOURCES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }
    if (entry.name.startsWith('@')) {
      for (const scoped of fs.readdirSync(path.join(SOURCES_DIR, entry.name), { withFileTypes: true })) {
        if (scoped.isDirectory()) {
          result.push(`${entry.name}/${scoped.name}`)
        }
      }
    } else {
      result.push(entry.name)
    }
  }

  return result
}

/**
 * Cross-checks a `deps.json` entry against the upstream `package.json` vendored next to the sources,
 * when there is one. Monorepo roots (the `@stablelib/*` and `@taquito/*` packages ship the
 * workspace root's package.json) carry a different name and are skipped with a note rather than
 * failing, because they say nothing about the package's version.
 *
 * A package.json whose name was deliberately stripped by `replaceInFiles` (a nameless package.json
 * keeps Angular's DedupeModuleResolvePlugin from folding the vendored copy into an app's same-name
 * copy) is NOT a monorepo root: its version still describes the upstream package, so it is
 * cross-checked like a normally named one. Only a *differing* name means the version is unrelated.
 */
function verifyAgainstDisk(key, entry, version, notes) {
  const packageJson = path.join(SOURCES_DIR, key, 'package.json')
  if (!fs.existsSync(packageJson)) {
    return
  }

  let pkg
  try {
    pkg = readJson(packageJson)
  } catch (error) {
    fail(`${key}: could not parse ${packageJson}: ${error.message}`)

    return
  }

  if (pkg.name === undefined || pkg.name === null || pkg.name === '') {
    notes.push(`${key}: on-disk package.json is intentionally unnamed; version cross-checked`)
  } else if (pkg.name !== entry.name) {
    notes.push(`${key}: on-disk package.json is "${pkg.name}" (monorepo root?), version not cross-checked`)

    return
  }

  if (String(pkg.version) !== version) {
    fail(`${key}: deps.json says ${entry.name}@${version} but ${packageJson} says ${pkg.version}. Fix deps.json or re-vendor.`)
  }
}

function main() {
  const outDir = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_OUT_DIR
  const deps = readJson(DEPS_FILE)

  const versionsByName = new Map()
  const notes = []
  const aliases = []

  const addVersion = (name, version) => {
    const versions = versionsByName.get(name) || new Set()
    versions.add(version)
    versionsByName.set(name, versions)
  }

  for (const [key, entry] of Object.entries(deps)) {
    let version = String(entry.version)
    const name = entry.scanAsName || entry.name

    if (!SEMVER.test(version)) {
      if (entry.scanAsVersion && SEMVER.test(String(entry.scanAsVersion))) {
        version = String(entry.scanAsVersion)
        notes.push(`${key}: pinned to commit ${String(entry.commitHash).slice(0, 12)}, scanned as ${name}@${version} (scanAsVersion)`)
      } else {
        fail(
          `${key} is pinned to a commit hash and declares no "scanAsVersion". ` +
            `Add "scanAsVersion": "<upstream release the commit corresponds to>" to its deps.json entry so it can be scanned.`
        )
        continue
      }
    }

    verifyAgainstDisk(key, entry, version, notes)
    addVersion(name, version)

    if (entry.forkOf) {
      addVersion(entry.forkOf, version)
      aliases.push(`${name}@${version} -> also scanned as ${entry.forkOf}@${version}`)
    }
  }

  // Every vendored directory must be accounted for.
  const keys = new Set(Object.keys(deps))
  for (const dir of listSourceDirectories()) {
    if (keys.has(dir)) {
      continue
    }
    if (FIRST_PARTY_DIRECTORIES[dir]) {
      notes.push(`${dir}: not scanned — ${FIRST_PARTY_DIRECTORIES[dir]}`)
      continue
    }
    fail(
      `${SOURCES_DIR}/${dir} exists but is not a deps.json entry. Register it (so it is scanned) or add it to FIRST_PARTY_DIRECTORIES with a reason.`
    )
  }

  // A lockfile can only hold one version of a package per directory. Where the same package is
  // vendored at several versions (e.g. secp256k1 3.7.1 and 4.0.2), the extras are nested under
  // synthetic parents so that every copy is scanned rather than silently deduplicated away.
  const packages = {}
  const rootDependencies = {}

  for (const [name, versionSet] of versionsByName) {
    const versions = Array.from(versionSet).sort()

    versions.forEach((version, index) => {
      const resolved = `https://registry.npmjs.org/${name}/-/${name.replace(/^@[^/]+\//, '')}-${version}.tgz`

      if (index === 0) {
        packages[`node_modules/${name}`] = { version, resolved }
        rootDependencies[name] = version

        return
      }

      const parent = `_vendored_dup_${index}`
      packages[`node_modules/${parent}`] = packages[`node_modules/${parent}`] || {
        version: '1.0.0',
        dependencies: {}
      }
      packages[`node_modules/${parent}`].dependencies[name] = version
      packages[`node_modules/${parent}/node_modules/${name}`] = { version, resolved }
      rootDependencies[parent] = '1.0.0'
    })
  }

  packages[''] = { name: 'airgap-coin-lib-vendored', version: '1.0.0', dependencies: rootDependencies }

  const lockfile = {
    name: 'airgap-coin-lib-vendored',
    version: '1.0.0',
    lockfileVersion: 3,
    requires: true,
    packages
  }

  if (process.exitCode) {
    console.error('\nNot writing a lockfile: the checks above failed. A partial manifest would let the scan pass while missing packages.')

    return
  }

  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, 'package.json'),
    JSON.stringify({ name: 'airgap-coin-lib-vendored', version: '1.0.0', dependencies: rootDependencies }, undefined, 2)
  )
  fs.writeFileSync(path.join(outDir, 'package-lock.json'), JSON.stringify(lockfile, undefined, 2))

  const scanned = Array.from(versionsByName.values()).reduce((total, versions) => total + versions.size, 0)
  console.log(`Wrote ${outDir}`)
  console.log(`Scannable vendored packages: ${scanned}`)

  if (aliases.length > 0) {
    console.log('\nForks also scanned under their upstream name:')
    for (const alias of aliases) {
      console.log(`  ${alias}`)
    }
  }
  if (notes.length > 0) {
    console.log('\nNotes:')
    for (const note of notes) {
      console.log(`  ${note}`)
    }
  }
}

main()
