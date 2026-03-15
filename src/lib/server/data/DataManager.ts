import path from 'path';
import type { ServerDataAdapter } from './ServerDataAdapter';
import { FileServerDataAdapter } from './FileServerDataAdapter';

export class ServerDataManager {
	constructor(
		private readonly adapter: ServerDataAdapter
	) {}

	public async load<T>(key: string, fallbackValue: T) {
		const storedValue = await this.adapter.load<T>(key);
		return storedValue ?? fallbackValue;
	}

	public async loadOptional<T>(key: string) {
		return this.adapter.load<T>(key);
	}

	public async save<T>(key: string, value: T) {
		await this.adapter.save(key, value);
	}

	public async remove(key: string) {
		await this.adapter.remove(key);
	}
}

export const dataManager = new ServerDataManager(
	new FileServerDataAdapter(path.join(process.cwd(), '.app-data'))
);