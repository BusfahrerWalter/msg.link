# msg.link

`msg.link` is a self-hosted app for publishing simple shareable pages at stable URL suffixes.
Each user owns one suffix (for example `/t/alice`) and can manage what that page shows.

## Use case

- Create short, human-readable links that always point to your current content.
- Show plain text, redirect to another URL, or display an image.
- Let multiple users manage their own suffix/content in one shared instance.
- Track page visits per user over time (daily/weekly/weekday charts).

Typical usage:
1. Admin creates users and assigns a suffix.
2. User signs in, edits content and visual settings.
3. User shares `/t/<suffix>` as their public page.
4. User updates content later without changing the shared URL.

## Features

- Authentication with secure password hashing (`argon2`) and cookie sessions.
- Role support: regular users + admin user management.
- Per-user content settings:
	- Content type: `text`, `image`, `link`, `markdown`.
	- Text style: color, background, font size, font family.
- Public page rendering at `/t/[suffix]`.
- Visit statistics for each user.

## Tech stack

- SvelteKit + Svelte 5
- Tailwind CSS 4
- SQLite (`node:sqlite`)
- pnpm
- Docker / Docker Compose

## Quick start (local)

### 1) Install dependencies

```sh
pnpm install
```

### 2) Create `.env`

```env
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
```

Optional:

```env
# Path for app data + sqlite database (default: .app-data)
DEFAULT_APP_DATA_PATH=.app-data

# Public validation/session settings
PUBLIC_MIN_USERNAME_LENGTH=2
PUBLIC_MAX_USERNAME_LENGTH=50
PUBLIC_MIN_PASSWORD_LENGTH=6
PUBLIC_MAX_PASSWORD_LENGTH=50
PUBLIC_MAX_SUFFIX_LENGTH=20
PUBLIC_MAX_CONTENT_LENGTH=280
PUBLIC_SESSION_TTL_DAYS=7
```

### 3) Run dev server

```sh
pnpm dev
```

App URL: `http://localhost:7070`

### 4) First login

- Open `/login`
- Sign in with `DEFAULT_ADMIN_USERNAME` / `DEFAULT_ADMIN_PASSWORD`
- Go to `/config` to manage content, users, and preferences

## Docker

Build and run:

```sh
docker compose up --build
```

The app is exposed at `http://localhost:7070` (container listens on `3000`).

Persistent data is stored in Docker volume `app-data`, mounted to `/app/.app-data`.

## Data storage

The app stores all state in SQLite:

- users
- sessions
- texts (by suffix)
- message settings (by username)
- page visit statistics

Default DB location:

- local: `.app-data/app.db`
- docker: `/app/.app-data/app.db`

## Main routes

- `/` home shortcut to jump to a suffix page
- `/t/[suffix]` public page
- `/login` sign in
- `/config` user/admin configuration UI

## Notes

- A default admin account is auto-created on startup if missing.
- Keep production credentials secure and change defaults immediately.
