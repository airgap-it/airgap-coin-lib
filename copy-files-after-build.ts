import { mkdirSync, copyFileSync, readdirSync, lstatSync, existsSync } from 'fs'
import { dirname, join, sep } from 'path'

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
			dirname(path)
				.split(sep)
				.reduce((prevPath, folder) => {
					const currentPath = join(prevPath, folder, sep);
					if (currentPath === 'src/') {
						return 'dist/'
					}

					if (!existsSync(currentPath)){
						mkdirSync(currentPath);
					}
					
					return currentPath;
				}, '');

			copyFileSync(path, path.replace('./src', './dist'))
		}
	}
	return packageJsons
}

findJsonOnLevel('./src/dependencies/src').then(() => {}).catch(console.error)

