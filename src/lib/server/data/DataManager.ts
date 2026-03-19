import * as fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

type PreparedStatement = ReturnType<DatabaseSync['prepare']>;

export class ServerDataManager {
	private readonly database: DatabaseSync;
	private readonly statements: {
		loadText: PreparedStatement;
		saveText: PreparedStatement;
		updateSuffix: PreparedStatement;
		loadSettings: PreparedStatement;
		saveSettings: PreparedStatement;
		saveUser: PreparedStatement;
		loadUser: PreparedStatement;
		loadUsers: PreparedStatement;
		loadUserBySuffix: PreparedStatement;
		deleteUser: PreparedStatement;
		loadSession: PreparedStatement;
		saveSession: PreparedStatement;
		removeSession: PreparedStatement;
		removeSessionsByUsername: PreparedStatement;
		removeSettingsByUsername: PreparedStatement;
		removeTextBySuffix: PreparedStatement;
		recordPageVisit: PreparedStatement;
		loadRecentPageVisits: PreparedStatement;
	};

	constructor(databasePath: string) {
		fs.mkdirSync(path.dirname(databasePath), { recursive: true });

		this.database = new DatabaseSync(databasePath);
		this.database.exec(`
			PRAGMA foreign_keys = ON;
			PRAGMA journal_mode = WAL;
			CREATE TABLE IF NOT EXISTS users (
				username TEXT PRIMARY KEY NOT NULL,
				passwordHash TEXT NOT NULL,
				urlSuffix TEXT UNIQUE NOT NULL,
				isAdmin BOOLEAN NOT NULL DEFAULT 0 CHECK (isAdmin IN (0, 1)),
				theme TEXT NOT NULL DEFAULT 'light',
				language TEXT NOT NULL DEFAULT 'en'
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
				color TEXT NOT NULL,
				background TEXT NOT NULL,
				fontSize TEXT NOT NULL,
				font TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS page_visit_statistics (
				username TEXT NOT NULL,
				day TEXT NOT NULL,
				visitCount INTEGER NOT NULL DEFAULT 1 CHECK (visitCount > 0),
				PRIMARY KEY (username, day),
				FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
			);
		`);

		this.statements = {
			loadText: this.database.prepare(`
				SELECT text FROM texts WHERE id = ?
			`),
			saveText: this.database.prepare(`
				INSERT INTO texts (id, text) VALUES (?, ?)
				ON CONFLICT(id) DO UPDATE SET text = excluded.text
			`),
			updateSuffix: this.database.prepare(`
				UPDATE texts SET id = ? WHERE id = ?
			`),
			loadSettings: this.database.prepare(`
				SELECT id, type, color, background, fontSize, font
				FROM settings
				WHERE id = ?
			`),
			saveSettings: this.database.prepare(`
				INSERT INTO settings (id, type, color, background, fontSize, font)
				VALUES (?, ?, ?, ?, ?, ?)
				ON CONFLICT(id) DO UPDATE SET
					type = excluded.type,
					color = excluded.color,
					background = excluded.background,
					fontSize = excluded.fontSize,
					font = excluded.font
			`),
			saveUser: this.database.prepare(`
				INSERT INTO users (username, passwordHash, urlSuffix, isAdmin, theme, language)
				VALUES (?, ?, ?, ?, ?, ?)
				ON CONFLICT(username) DO UPDATE SET
					passwordHash = excluded.passwordHash,
					urlSuffix = excluded.urlSuffix,
					isAdmin = excluded.isAdmin,
					theme = excluded.theme,
					language = excluded.language
			`),
			loadUser: this.database.prepare(`
				SELECT username, passwordHash, urlSuffix, isAdmin, theme, language
				FROM users WHERE username = ?
			`),
			loadUsers: this.database.prepare(`
				SELECT username, urlSuffix, isAdmin, theme, language
				FROM users
				ORDER BY username COLLATE NOCASE ASC
			`),
			loadUserBySuffix: this.database.prepare(`
				SELECT username
				FROM users
				WHERE urlSuffix = ?
			`),
			deleteUser: this.database.prepare(`
				DELETE FROM users
				WHERE username = ?
			`),
			loadSession: this.database.prepare(`
				SELECT tokenHash, username, expiresAt
				FROM sessions WHERE tokenHash = ?
			`),
			saveSession: this.database.prepare(`
				INSERT INTO sessions (tokenHash, username, expiresAt)
				VALUES (?, ?, ?)
				ON CONFLICT(tokenHash) DO UPDATE SET
					username = excluded.username,
					expiresAt = excluded.expiresAt
			`),
			removeSession: this.database.prepare(`
				DELETE FROM sessions
				WHERE tokenHash = ?
			`),
			removeSessionsByUsername: this.database.prepare(`
				DELETE FROM sessions
				WHERE username = ?
			`),
			removeSettingsByUsername: this.database.prepare(`
				DELETE FROM settings
				WHERE id = ?
			`),
			removeTextBySuffix: this.database.prepare(`
				DELETE FROM texts
				WHERE id = ?
			`),
			recordPageVisit: this.database.prepare(`
				INSERT INTO page_visit_statistics (username, day, visitCount)
				VALUES (?, ?, 1)
				ON CONFLICT(username, day) DO UPDATE SET
					visitCount = page_visit_statistics.visitCount + 1
			`),
			loadRecentPageVisits: this.database.prepare(`
				SELECT day, visitCount
				FROM page_visit_statistics
				WHERE username = ? AND day >= ?
				ORDER BY day ASC
			`)
		};
	}

	public loadText(urlSuffix: string) {
		const row = this.statements.loadText.get(urlSuffix) as { text: string } | undefined;
		return row ? row.text : null;
	}

	public saveText(urlSuffix: string, text: string) {
		this.statements.saveText.run(urlSuffix, text);
	}

	public updateSuffix(oldSuffix: string, newSuffix: string) {
		this.statements.updateSuffix.run(newSuffix, oldSuffix);
	}

	public loadSettings(username: string) {
		const row = this.statements.loadSettings.get(username) as Data.StoredMessageSettings | undefined;

		return row ? {
			type: row.type,
			color: row.color,
			background: row.background,
			fontSize: row.fontSize,
			font: row.font
		} : null;
	}

	public saveSettings(username: string, settings: Data.StoredMessageSettings) {
		this.statements.saveSettings.run(
			username,
			settings.type,
			settings.color,
			settings.background,
			settings.fontSize,
			settings.font
		);
	}

	public saveUser(user: Data.StoredUser) {
		this.statements.saveUser.run(
			user.username,
			user.passwordHash,
			user.urlSuffix,
			user.isAdmin ? 1 : 0,
			user.theme,
			user.language
		);
	}

	public loadUser(username: string) {
		const row = this.statements.loadUser.get(username) as Data.StoredUser | undefined;
		if (!row) {
			return null;
		}

		row.isAdmin = Boolean(row.isAdmin);
		return row;
	}

	public loadUsers() {
		const rows = this.statements.loadUsers.all() as unknown as Array<
			Omit<Data.StoredUser, 'passwordHash'>
		>;

		return rows.map((row) => {
			return {
				...row,
				isAdmin: Boolean(row.isAdmin)
			};
		});
	}

	public isSuffixInUse(suffix: string) {
		const row = this.statements.loadUserBySuffix.get(suffix);
		return Boolean(row);
	}

	public loadUserBySuffix(suffix: string) {
		const row = this.statements.loadUserBySuffix.get(suffix) as Data.StoredUser | undefined;
		if (!row) {
			return null;
		}

		row.isAdmin = Boolean(row.isAdmin);
		return row;
	}

	public loadSession(tokenHash: string) {
		const row = this.statements.loadSession.get(tokenHash) as Data.StoredSession | undefined;
		return row ?? null;
	}

	public saveSession(session: Data.StoredSession) {
		this.statements.saveSession.run(session.tokenHash, session.username, session.expiresAt);
	}

	public removeSession(tokenHash: string) {
		this.statements.removeSession.run(tokenHash);
	}

	public removeSessionsByUsername(username: string) {
		this.statements.removeSessionsByUsername.run(username);
	}

	public removeSettingsByUsername(username: string) {
		this.statements.removeSettingsByUsername.run(username);
	}

	public removeTextBySuffix(urlSuffix: string) {
		this.statements.removeTextBySuffix.run(urlSuffix);
	}

	public deleteUser(username: string) {
		this.statements.deleteUser.run(username);
	}

	public recordPageVisit(username: string, day: string) {
		this.statements.recordPageVisit.run(username, day);
	}

	public loadRecentPageVisits(username: string, sinceDay: string) {
		const rows = this.statements.loadRecentPageVisits.all(username, sinceDay) as Array<{
			day: string;
			visitCount: number;
		}>;

		return rows.map((row) => {
			return {
				day: row.day,
				visitCount: Number(row.visitCount)
			};
		});
	}
}

export const dataManager = new ServerDataManager(
	path.join(process.cwd(), '.app-data', 'app.db')
);