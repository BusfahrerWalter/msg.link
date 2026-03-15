export interface ServerDataAdapter {
	load<T>(key: string): Promise<T | null>;
	save<T>(key: string, value: T): Promise<void>;
	remove(key: string): Promise<void>;
}