# Manomay Analytics - Power BI Dashboard Viewer

A Next.js application that embeds Power BI reports for authorized team members. Authentication and role-based access control (RBAC) are managed dynamically through a SharePoint Excel workbook (`access-control.xlsx`) accessed via Microsoft Graph API.

---

## Technical Specifications & Changelogs

For detailed architecture diagrams, technical specifications, and maintenance guides, see the [`changelog/`](changelog/README.md) directory:

- [SharePoint Excel Data Source Architecture](changelog/2026-09-18_sharepoint_excel_data_source_architecture.md)
- [Access-Control Workbook Maintenance Guide](changelog/2026-09-18_excel_workbook_maintenance_guide.md)
- [System Architecture & Power BI Integration Spec](changelog/2026-09-15_system_architecture_and_powerbi_integration.md)

---

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the required variables:
   - `AZURE_TENANT_ID`: Azure AD Tenant ID.
   - `AZURE_CLIENT_ID`: Azure AD App Registration Client ID (requires Graph API `Sites.Read.All` or `Files.Read.All`).
   - `AZURE_CLIENT_SECRET`: Azure AD App Registration Client Secret.
   - `SHAREPOINT_FILE_URL`: The "Copy link" share URL of the `access-control.xlsx` workbook in SharePoint.
   - `SHAREPOINT_CACHE_TTL_SECONDS`: Cache duration in seconds (optional, defaults to `1800` / 30 minutes).

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

### Access Control & Data Source (SharePoint Workbook)
User accounts and report permissions are driven entirely by an Excel workbook (`access-control.xlsx`) hosted in SharePoint:

- **`Users` Sheet**: Contains user logins (`email` and `password`) and their assigned `role`.
- **`Report Access Matrix` Sheet**: Matrix listing all reports (`Report Key`, `Report List`, `Embed URL`) with columns for each role containing an `'X'` to grant access (with fallback support for legacy per-role sheets).
- **Caching**: The workbook data is fetched via Microsoft Graph API and cached in memory for the duration specified by `SHAREPOINT_CACHE_TTL_SECONDS`.

### Authentication & Security
- **`/login`**: Users enter their credentials. `POST /api/login` verifies credentials asynchronously against the `Users` sheet in SharePoint and sets an `httpOnly` session cookie. If SharePoint is unreachable, a `503 Service Unavailable` response is returned.
- **Edge Proxy (`src/proxy.ts`)**: Protects all `/dashboard/*` routes. Unauthenticated requests are automatically redirected to `/login`.
- **`/dashboard`**: Displays the list of Power BI reports that the signed-in user's role is permitted to view.
- **`/dashboard/[reportKey]`**: Verifies that the signed-in user's role has permission for `reportKey`. If authorized, renders the report iframe; if not, redirects to `/unauthorized`.

---

## Build for Production

```bash
npm run build
npm start
```
