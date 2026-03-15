# Text App

Simple SvelteKit application with:

- public frontend at `/` that displays the current text in the center
- admin frontend at `/admin` for updating the text
- backend API at `/api/text` for reading/updating text

## Setup

1. Create a `.env` file in the project root:

```sh
DEFAULT_ADMIN_PASSWORD=replace-with-a-strong-password
DEFAULT_ADMIN_USERNAME=admin
ADMIN_SESSION_DAYS=7
TEXT_MAX_LENGTH=280
```

2. Start the app:

```sh
pnpm dev
```

## Security notes

- On first use, the server creates a default admin user from `DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_PASSWORD`.
- Passwords are stored only as Argon2id hashes in `.app-data/auth/admin-users.json`.
- Admin login creates an `HttpOnly` session cookie with an expiration time.
- Active admin sessions are stored in `.app-data/auth/admin-sessions.json` and expired sessions are pruned automatically.
- Use HTTPS in production so the token is encrypted in transit.
