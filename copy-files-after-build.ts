import { promises } from 'fs'

const findPackageJsonOnLevel = async (base: string) => {
	const packageJsons: string[] = []
	const files = await promises.readdir(base)
	for (const file of files) {
		const path = `${base}/${file}`
		const isDirectory = (await promises.lstat(path)).isDirectory()
		if (isDirectory) {
			packageJsons.push(...await findPackageJsonOnLevel(path))
		} else if (file === 'package.json') {
			packageJsons.push(path)
			const fileContent = await promises.readFile(path)
			await promises.writeFile(path.replace('./src', './dist'), fileContent)
		}
	}
	return packageJsons
}

findPackageJsonOnLevel('./src').then(() => {}).catch(console.error)