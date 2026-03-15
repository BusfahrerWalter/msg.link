import * as fsp from 'fs/promises';
import path from 'path';
import type { ServerDataAdapter } from './ServerDataAdapter';

function toFilePath(baseDirectory: string, key: string) {
	return path.join(baseDirectory, `${key}.json`);
}

export class FileServerDataAdapter implements ServerDataAdapter {
	constructor(private readonly baseDirectory: string) {}

	async load<T>(key: string) {
		try {
			const filePath = toFilePath(this.baseDirectory, key);
			const rawValue = await fsp.readFile(filePath, 'utf8');

			return JSON.parse(rawValue) as T;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
				return null;
			}

			throw error;
		}
	}

	async save<T>(key: string, value: T) {
		const filePath = toFilePath(this.baseDirectory, key);

		await fsp.mkdir(path.dirname(filePath), { recursive: true });
		await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
	}

	async remove(key: string) {
		try {
			await fsp.unlink(toFilePath(this.baseDirectory, key));
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
				throw error;
			}
		}
	}
}