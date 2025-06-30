import { mkdirSync, copyFileSync, readdirSync, lstatSync, existsSync } from 'fs'
import { dirname, join, sep } from 'path'

const findFilesOnLevel = async (base: string) => {
  const files: string[] = []
  const filesInFolder = readdirSync(base)
  for (const file of filesInFolder) {
    const path = `${base}/${file}`
    const isDirectory = lstatSync(path).isDirectory()
    if (isDirectory) {
      files.push(...(await findFilesOnLevel(path)))
    } else if ((file as any).endsWith('json') || (file as any).endsWith('js')) {
      files.push(path)
      dirname(path)
        .split(sep)
        .reduce((prevPath, folder) => {
          const currentPath = join(prevPath, folder, sep)
          if (currentPath === 'src/') {
            return 'dist/'
          }

          if (!existsSync(currentPath)) {
            mkdirSync(currentPath)
          }

          return currentPath
        }, '')

      console.log('Copying file', path.replace('./src', './dist'))

      copyFileSync(path, path.replace('./src', './dist'))
    }
  }
  return files
}

// findFilesOnLevel('./src/v0/serializer/schemas/v2')
//   .then(() => {})
//   .catch(console.error)
// findFilesOnLevel('./src/v0/serializer/schemas/v3')
//   .then(() => {})
//   .catch(console.error)
findFilesOnLevel('./src/v1/serializer/v3/schemas/generated')
  .then(() => {})
  .catch(console.error)

copyFileSync('./package.json', './dist/package.json')
copyFileSync('./readme.md', './dist/readme.md')
