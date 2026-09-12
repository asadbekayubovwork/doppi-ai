# Production auth integration plan

**Goal:** Replace the demo frontend authentication with the deployed FastAPI
cookie/CSRF contract, preserve the `.pen` visual system, and prepare a
zero-downtime production release at `https://doppiai.uz`.

**Scope:** Authentication and the authenticated shell only. Voice, video, RAG,
CRM, billing, and other future modules are explicitly out of scope. Existing
dashboard feature pages may remain placeholders, but access control and shared
user/business context must be real.

**Sources of truth:**

- `/home/azizbek/projects/business/doppi` backend routes and schemas
- `/home/azizbek/Desktop/designs/doppi/doppi-ai-v3.pen`
- `/tmp/doppi-auth-contract-audit.md`
- `/tmp/doppi-frontend-design-audit.md`
- `/tmp/doppi-frontend-deploy-audit.md`

## Non-negotiable constraints

- Vue 3, TypeScript, Pinia, and the existing visual language stay in place.
- Production/test/config/deployment files stay below 400 lines; target 300.
- No local/session-storage bearer token. The backend session cookie is the only
  browser authentication source.
- Same-origin API base is `/api/v1`; fetch sends cookies explicitly.
- Authenticated mutations read `__Host-doppi_csrf` and send
  `X-CSRF-Token`. Never log cookies, OAuth codes, reset tokens, or OTP values.
- Remove all demo authentication, including `111111`, artificial attempts, and
  `VITE_AUTH_API_ENABLED` bypasses.
- Server `problem+json` codes and `Retry-After` drive UX. Never phrase-match
  server error text.
- OAuth state, PKCE, nonce, and binding remain backend-owned. Only a validated
  local return path may be kept in session storage.
- Preserve the `.pen` auth shell, palette, 400px form width, desktop 560px
  brand panel, responsive scroll behavior, and keyboard/accessibility basics.
- Do not push, deploy, or mutate the production server during implementation.

## Task 1: Implement and verify the complete frontend auth boundary

### Test-first changes

Add failing tests before production changes for:

1. HTTP client: `/api/v1` default, same-origin credentials, CSRF injection on
   unsafe methods, JSON/problem parsing, `Retry-After`, and 204 responses.
2. Auth API exact endpoint/payload/response contracts for login, MFA verify,
   signup, email verification/resend, reset request/verify/confirm, session,
   logout, Google authorize URL, Telegram POST callback data, and businesses.
3. Auth state: session bootstrap, authenticated/anonymous state, safe redirect,
   logout, and no browser token persistence.
4. Router: unauthenticated `/app/**` deep links redirect to login with a local
   return path; authenticated users can enter; `/auth/callback` bootstraps the
   session and consumes only a safe local redirect.
5. Page flows: login + remember-me + MFA, signup + real challenge + verify +
   resend cooldown, forgot password request + verify + reset token + confirm,
   Google redirect, Telegram integration/error state, logout, and relevant
   backend problem-code UX.

### Production changes

- Refactor the shared HTTP client to a typed cookie/CSRF/problem client.
- Replace `authApi` with backend-compatible methods and types.
- Add a Pinia auth/session store and router guard without creating redirect
  loops. Session bootstrap must complete before protected content is rendered.
- Implement `/auth/callback?status=success` for Google. Google login starts at
  `/api/v1/auth/oauth/google/authorize` through a top-level navigation.
- Integrate Telegram only through the official widget callback data posted to
  `/auth/telegram/login`. If the public bot username is not configured, show a
  truthful unavailable state; do not invent a redirect endpoint.
- Make login handle either `SessionResponse` or `mfa_required` and provide a
  real MFA verification state.
- Make registration retain backend `challenge_id`, verify the submitted code,
  and request a new challenge through the server. Cooldown uses `Retry-After`.
- Make password reset follow request -> challenge verification -> reset token ->
  confirmation. Keep the reset token only in component memory.
- Make user-menu logout call the backend and clear frontend state even when the
  network call fails, while reporting the failure appropriately.
- Load the authenticated user and businesses into shared state for the header;
  create/select business through the existing backend endpoints and CSRF.
- Split duplicated/oversized auth pages into focused components/composables.
  Keep every touched source/test/config file below 400 lines.
- Centralize `.pen` tokens and reusable auth shell pieces; do not redesign the
  product or change unrelated public/dashboard screens.
- Add `.env.production.example` or equivalent public runtime documentation.
  No secret may enter a `VITE_*` variable.

### Required verification

From Node 20 with pnpm 9.15.2:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm exec vue-tsc --noEmit
VITE_API_BASE_URL=/api/v1 pnpm build
```

The build-time API value must remain exactly `/api/v1` before executing the
build. Also inspect the generated bundle for `111111`, localhost addresses,
backend secrets, and bearer-token persistence.

Commit the implementation locally with a clear message. Write the implementation
report to the task workspace specified by the controller, including test RED
and GREEN evidence, changed files, commit hash, residual limitations, and an
explicit statement that no server/push operation occurred.

## Acceptance boundary before production deploy

- Independent reviewer reports no critical/high contract, security, regression,
  design-parity, accessibility, or file-size findings.
- Root controller independently runs the full local gate.
- Frontend commit is pushed only after review.
- Backend OAuth success path is changed to `/auth/callback?status=success` only
  in the controlled deployment and followed by API-only recreation/health check.
- Frontend static files are staged as an immutable release and cut over
  atomically; backend and unrelated server services are never stopped.
- Final browser E2E covers protected-route redirect, Google OAuth callback,
  session bootstrap, dashboard shell, logout, and negative CSRF behavior.
- Email OTP/reset E2E is real only when production SMTP credentials exist; if
  they do not, report the infrastructure blocker instead of faking success.
