import { mkdirSync, copyFileSync, readdirSync, lstatSync } from 'fs'
import { dirname } from 'path'

const findJsonOnLevel = async (base: string) => {
	const packageJsons: string[] = []
	const files = readdirSync(base)
	for (const file of files) {
		const path = `${base}/${file}`
		const isDirectory = (lstatSync(path)).isDirectory()
		if (isDirectory) {
			packageJsons.push(...await findJsonOnLevel(path))
		} else if ((file as any).endsWith('json')) {
			packageJsons.push(path)
			try {
				mkdirSync(dirname(path), { recursive: true })
			} catch(error) {
				if (error.code === 'EEXIST') {} else {
					throw error
				}
			}
			copyFileSync(path, path.replace('./src', './dist'))
		}
	}
	return packageJsons
}

findJsonOnLevel('./src/dependencies/src').then(() => {}).catch(console.error)

