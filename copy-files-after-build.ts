import { promises, mkdirSync, copyFileSync } from 'fs'
import { dirname } from 'path'

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

const copyFiles = () => {
	const files = [
		{
			src: './src/dependencies/src/bip39-2.5.0/wordlists/chinese_simplified.json',
			dest: './dist/dependencies/src/bip39-2.5.0/wordlists/chinese_simplified.json'
		},
		{
			src: './src/dependencies/src/bip39-2.5.0/wordlists/chinese_traditional.json',
			dest: './dist/dependencies/src/bip39-2.5.0/wordlists/chinese_traditional.json'
		},
		{
			src: './src/dependencies/src/bip39-2.5.0/wordlists/english.json',
			dest: './dist/dependencies/src/bip39-2.5.0/wordlists/english.json'
		},
		{
			src: './src/dependencies/src/bip39-2.5.0/wordlists/french.json',
			dest: './dist/dependencies/src/bip39-2.5.0/wordlists/french.json'
		},
		{
			src: './src/dependencies/src/bip39-2.5.0/wordlists/italian.json',
			dest: './dist/dependencies/src/bip39-2.5.0/wordlists/italian.json'
		},
		{
			src: './src/dependencies/src/bip39-2.5.0/wordlists/japanese.json',
			dest: './dist/dependencies/src/bip39-2.5.0/wordlists/japanese.json'
		},
		{
			src: './src/dependencies/src/bip39-2.5.0/wordlists/korean.json',
			dest: './dist/dependencies/src/bip39-2.5.0/wordlists/korean.json'
		},
		{
			src: './src/dependencies/src/bip39-2.5.0/wordlists/spanish.json',
			dest: './dist/dependencies/src/bip39-2.5.0/wordlists/spanish.json'
		}
	]
	for (let file of files) {
		try {
			mkdirSync(dirname(file.dest), { recursive: true })
		} catch(error) {
			if (error.code === 'EEXIST') {} else {
				throw error
			}
		}
		copyFileSync(file.src, file.dest)
	}
}

copyFiles()
