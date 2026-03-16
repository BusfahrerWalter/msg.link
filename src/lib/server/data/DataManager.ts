import * as fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

export class ServerDataManager {
	private readonly database: DatabaseSync;

	constructor(databasePath: string) {
		fs.mkdirSync(path.dirname(databasePath), { recursive: true });

		this.database = new DatabaseSync(databasePath);
		this.database.exec(`
			PRAGMA journal_mode = WAL;
			CREATE TABLE IF NOT EXISTS users (
				username TEXT PRIMARY KEY NOT NULL,
				passwordHash TEXT NOT NULL,
				urlSuffix TEXT UNIQUE NOT NULL
			);
			CREATE TABLE IF NOT EXISTS sessions (
				tokenHash TEXT PRIMARY KEY NOT NULL,
				username TEXT NOT NULL,
				expiresAt TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS texts (
				id TEXT PRIMARY KEY NOT NULL,
				text TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS settings (
				id TEXT PRIMARY KEY NOT NULL,
				type TEXT NOT NULL,
				content TEXT NOT NULL,
				color TEXT NOT NULL,
				background TEXT NOT NULL,
				fontSize TEXT NOT NULL,
				font TEXT NOT NULL
			);
		`);
	}

	public loadText(urlSuffix: string) {
		const row = this.database.prepare(`
			SELECT text FROM texts WHERE id = ?
		`).get(urlSuffix) as { text: string } | undefined;

		return row ? row.text : null;
	}

	public saveText(urlSuffix: string, text: string) {
		this.database.prepare(`
			INSERT INTO texts (id, text) VALUES (?, ?)
			ON CONFLICT(id) DO UPDATE SET text = excluded.text
		`).run(urlSuffix, text);
	}

	public updateSuffix(oldSuffix: string, newSuffix: string) {
		this.database.prepare(`
			UPDATE texts SET id = ? WHERE id = ?
		`).run(newSuffix, oldSuffix);
	}

	public loadSettings(username: string) {
		const row = this.database.prepare(`
			SELECT id, type, content, color, background, fontSize, font
			FROM settings
			WHERE id = ?
		`).get(username) as Data.StoredMessageSettings | undefined;

		return row ? {
			type: row.type,
			content: row.content,
			color: row.color,
			background: row.background,
			fontSize: row.fontSize,
			font: row.font
		} : null;
	}

	public saveSettings(username: string, settings: Data.StoredMessageSettings) {
		this.database.prepare(`
			INSERT INTO settings (id, type, content, color, background, fontSize, font)
			VALUES (?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				type = excluded.type,
				content = excluded.content,
				color = excluded.color,
				background = excluded.background,
				fontSize = excluded.fontSize,
				font = excluded.font
		`).run(
			username,
			settings.type,
			settings.content,
			settings.color,
			settings.background,
			settings.fontSize,
			settings.font
		);
	}

	public saveUser(user: Data.StoredUser) {
		this.database.prepare(`
			INSERT INTO users (username, passwordHash, urlSuffix)
			VALUES (?, ?, ?)
		`).run(user.username, user.passwordHash, user.urlSuffix);
	}

	public loadUser(username: string) {
		const row = this.database.prepare(`
			SELECT username, passwordHash, urlSuffix FROM users WHERE username = ?
		`).get(username) as Data.StoredUser | undefined;

		return row ?? null;
	}

	public isSuffixInUse(suffix: string) {
		const row = this.database.prepare(`
			SELECT username FROM users WHERE urlSuffix = ?
		`).get(suffix) as { username: string } | undefined;

		return Boolean(row);
	}

	public loadSession(tokenHash: string) {
		const row = this.database.prepare(`
			SELECT tokenHash, username, expiresAt FROM sessions WHERE tokenHash = ?
		`).get(tokenHash) as Data.StoredSession | undefined;

		return row ?? null;
	}

	public saveSession(session: Data.StoredSession) {
		this.database.prepare(`
			INSERT INTO sessions (tokenHash, username, expiresAt)
			VALUES (?, ?, ?)
			ON CONFLICT(tokenHash) DO UPDATE SET
				username = excluded.username,
				expiresAt = excluded.expiresAt
		`).run(session.tokenHash, session.username, session.expiresAt);
	}

	public removeSession(tokenHash: string) {
		this.database.prepare(`
			DELETE FROM sessions WHERE tokenHash = ?
		`).run(tokenHash);
	}
}

export const dataManager = new ServerDataManager(
	path.join(process.cwd(), '.app-data', 'app.db')
);