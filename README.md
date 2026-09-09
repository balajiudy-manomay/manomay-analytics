# Manomay Analytics - Power BI Dashboard Viewer

A Next.js app that embeds Power BI reports for viewers who don't have their own
Power BI license, using the service-principal ("embed for your customers")
pattern: one Azure AD app registration mints short-lived embed tokens on
behalf of everyone who signs in.

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `USERS` and `ROLE_REPORTS` — every login and what they can see (see
     "Configuring users" below).
   - `PBI_TENANT_ID`, `PBI_CLIENT_ID`, `PBI_CLIENT_SECRET` — the Azure AD app
     registration's credentials (client-credentials grant).
   - `PBI_WORKSPACE_ID` — the Power BI workspace holding the reports.
   - `PBI_REPORT_ID_*` — one report ID per dashboard screen.
3. One-time Power BI/Azure setup (outside this repo):
   - Add the app registration as a **Member** of the workspace.
   - Enable "Allow service principals to use Power BI APIs" in the Power BI
     Admin Portal for that app (or its security group).
   - Make sure the workspace sits on Premium/PPU/Fabric capacity.
4. Run the dev server:
   `npm run dev`

## Configuring users

Everything lives in two env vars — no code changes, no redeploy needed to
add/remove a user or change what a role can see.

1. **`USERS`** — every login, as `email:password:role` triples, comma-separated:
   `USERS="alice@manomay.biz:pw1:admin,bob@manomay.biz:pw2:viewer"`
   Parsed on the email's *first* `:` and the entry's *last* `:`, so passwords
   may contain `:` (role names must not). No `,` inside a password or role.
2. **`ROLE_REPORTS`** — each role's allowed report keys, as
   `role:[key:key:key]` entries, comma-separated:
   `ROLE_REPORTS="admin:[resource-utilization:revenue-tracking],viewer:[status-updates]"`
   Valid keys are the ones in [src/lib/powerbi/config.ts](src/lib/powerbi/config.ts)
   (`resource-utilization`, `resource-utilization-without-cost`,
   `revenue-tracking`, `timesheets-tracking`, `contracts-tracking`,
   `status-updates`, `project-budget-tracking`).

A user missing from `USERS` is rejected at login. A user whose role has no
entry (or an empty one) in `ROLE_REPORTS` signs in fine but lands on
`/unauthorized` — see [src/lib/auth/users.ts](src/lib/auth/users.ts) and
[src/lib/auth/access.ts](src/lib/auth/access.ts) for the parsers.

## How it works

- `/login` — a viewer enters their email and password; `POST /api/login`
  checks both against `USERS`, then sets an httpOnly `session` cookie.
- `/dashboard` — lists the reports the signed-in user's role can see.
- `/dashboard/[reportKey]` — embeds one report via `powerbi-client`, using a
  token minted by `GET /api/embed-token?reportId=...`.
- `middleware.ts` gates every `/dashboard/*` route on the session cookie being
  present; each page additionally checks the user's role has access to that
  specific report.

## Build

```bash
npm run build
npm start
```


