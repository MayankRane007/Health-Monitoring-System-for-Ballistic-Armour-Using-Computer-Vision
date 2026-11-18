# Authentication

The inspection, panel, and image-processing APIs require an active account session. Anyone can create an account from the frontend sign-in page. Registration signs the new account in immediately. All accounts have equal access to the shared inspection, panel, image, and report data; there are no roles or email verification.

The backend exposes a public `POST /auth/demo` endpoint. It creates or reuses the `demo@armourwatch.invalid` account and immediately starts a session; the frontend sign-in page does not currently link to this endpoint. Demo access is not read-only: changes affect the same shared workspace. The reserved demo address cannot be used for normal registration.

For manual account provisioning, from the `backend` directory run:

```bash
DATABASE_URL=sqlite:///./armourguard.db .venv/bin/python -m app.create_admin
```

The `DATABASE_URL` value must match the database used by the backend. The command prompts for an email and a password (at least 12 characters). Passwords are stored as scrypt hashes. Log in through the frontend; the API issues an HTTP-only, same-site session cookie that expires after eight hours. Logging out revokes that session on the server.

For HTTPS deployments, set `AUTH_COOKIE_SECURE=true`. The local-development default is `false` so the cookie can be used over `http://localhost`.

The frontend origins accepted by the API default to `http://localhost:5173` and `http://127.0.0.1:5173`. Set `FRONTEND_ORIGINS` to a comma-separated list of exact origins when deploying elsewhere.
