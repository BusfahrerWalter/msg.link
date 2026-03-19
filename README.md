# Text App

Simple SvelteKit application with:

- public frontend at `/` or `/t/:userUrlSuffix` that displays the current text in the center
- config frontend at `/config` for updating the text
- backend API at `/api/text` for reading/updating text

## Setup

1. Create a `.env` file in the project root:

```sh
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_USERNAME=admin
```

2. Start the app:

```sh
pnpm dev
```

## Docker

Build and run locally with Docker Compose:

```sh
docker compose up --build
```

The app will be available on `http://localhost:7070`.
Data is persisted in the `app-data` Docker volume and mounted to `/app/.app-data`.

## GitHub Container Registry (GHCR)

A workflow is provided at `.github/workflows/docker-publish.yml`.
It will:

- build on pushes to `main` and tags (`v*`)
- publish images to `ghcr.io/<owner>/<repo>` on non-PR events
- tag images by branch/tag/SHA and `latest` on the default branch

## Security notes

- On first use, the server creates a default admin user from `DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_PASSWORD`.
- Passwords are stored only as Argon2id hashes in `.app-data/auth/admin-users.json`.
- Admin login creates an `HttpOnly` session cookie with an expiration time.
- Active admin sessions are stored in `.app-data/auth/admin-sessions.json` and expired sessions are pruned automatically.
- Use HTTPS in production so the token is encrypted in transit.
