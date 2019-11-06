import { copyFileSync, mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'

export const createFolderIfNotExists = (path: string): void => {
  const dir: string = dirname(path)

  try {
    mkdirSync(dir, { recursive: true })
  } catch (e) {
    if (e.code === 'ENOENT') {
      createFolderIfNotExists(dir)
      createFolderIfNotExists(dir + '/whyYouNoWork')
    } else if (e.code === 'EEXIST') {
      // do nothing
    } else {
      throw e
    }
  }
}

export const copyFileAndCreateFolder = (src: string, dest: string): void => {
  createFolderIfNotExists(dest)
  copyFileSync(src, dest)
}

export const writeFileAndCreateFolder = (path: string, data: any): void => {
  createFolderIfNotExists(path)

  const content: string = typeof data === 'string' ? data : JSON.stringify(data, null, 4)

  writeFileSync(path, content)
}
