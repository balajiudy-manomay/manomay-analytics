# Access-Control Workbook — Maintenance Guide

**Date:** September 18, 2026
**Project:** Manomay Analytics
**Audience:** Whoever maintains the `access-control.xlsx` workbook in SharePoint (typically an admin/ops user, not a developer).

---

## 1. Why this document exists

This workbook is read directly by the application (via Microsoft Graph) to decide **who can log in** and **which Power BI reports each role can open**. There is no other configuration — nothing is hardcoded in the app's code. That means:

- A typo here breaks login or access for real people, immediately (well, within the cache window — see §6).
- The app does very little validation. Most mistakes fail **silently** (a row is just skipped) rather than raising a visible error.

Follow the rules below exactly. For how the app consumes this data internally, see [2026-09-18 SharePoint Excel Data Source Architecture](2026-09-18_sharepoint_excel_data_source_architecture.md).

---

## 2. Workbook structure at a glance

| Sheet name | Required? | Purpose |
| :-- | :-- | :-- |
| `Users` | **Yes, exact name** | One row per person who can log in (`Email`, `Password`, `Role`). |
| `Report Access Matrix` | **Yes (recommended)** | Single-sheet matrix mapping reports (`Report Key`, `Report List`, `Embed URL`) to roles via role columns (`X` = access). |
| `ReadMe` | No | Free-form notes for humans. Never read by the app. |
| *(Legacy per-role sheets)* | Fallback | Legacy setup: one sheet per role (e.g. `admin`, `project-manager`). |

**Role columns in `Report Access Matrix` define valid roles.** If a role is referenced in `Users` but has no matching role column in `Report Access Matrix`, everyone with that role sees **zero reports** and lands on the "No access" page — no warning, no error.

`ReadMe`, `Users`, and `Report Access Matrix` are reserved names (matched case-insensitively).

---

## 3. The `Users` sheet

**Sheet name must be exactly `Users`** (case-sensitive match on this one — it's looked up by exact name, not lowercased).

Row 1 is treated as a header and is always skipped — put whatever column titles you like there, they're not read. Data starts at row 2.

| Column | A | B | C |
| :-- | :-- | :-- | :-- |
| **Field** | Email | Password | Role |

### Rules

1. **One row per user.** No limit on how many rows — the app reads every row on the sheet, so the user list can grow or shrink freely without any code change.
2. **Email (column A)**
   - Matched **case-insensitively** and with leading/trailing spaces trimmed (`Jane@Company.com` and ` jane@company.com ` are the same user).
   - Must be non-empty, or the row is silently ignored.
   - **Must be unique.** If the same email appears twice, the app keeps only the **last** matching row it reads — the earlier row is silently discarded. Don't rely on this; just don't duplicate emails.
3. **Password (column B)**
   - Stored and compared **as plain text, exact match, case-sensitive**. There is no hashing on either side.
   - Must be non-empty, or the row is silently ignored.
   - Treat this column (and the whole workbook) as sensitive — anyone with edit/read access to this file can see every user's password.
4. **Role (column C)**
   - Matched **case-insensitively**, only outer whitespace trimmed.
   - **Must exactly equal a role column header in `Report Access Matrix`** (see §4). `manager` in this column requires a column header literally named `manager` (or `Manager`, `MANAGER` — case doesn't matter, but spelling and spacing do).
   - Must be non-empty, or the row is silently ignored.
5. **Blank rows** anywhere (no email, or no password, or no role) are silently skipped — safe to leave gaps, but don't expect a half-filled row to "partially" work.

### Example

| Email | Password | Role |
| :-- | :-- | :-- |
| jane.doe@manomay.biz | Str0ngPass! | admin |
| ravi.kumar@manomay.biz | AnotherPass1 | project-manager |
| priya.singh@manomay.biz | ThirdPass99 | finance-manager |

---

## 4. The `Report Access Matrix` sheet

Sheet name must be **`Report Access Matrix`** (matched case-insensitively).

Row 1 is the header row.

| Column | A | B | C | D | E | F... |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| **Field** | Report Key | Report List | Embed URL | role-1 | role-2 | role-3... |

### Rules

1. **Header Row (Row 1)**
   - Column A: `Report Key`
   - Column B: `Report List` (display title)
   - Column C: `Embed URL`
   - Column D onwards: **Role names** (e.g. `finance-manager`, `project-manager`, `delivery-ops-manager`, `admin`, `org-admin`). The column header name is used directly as the role identifier (case-insensitive). Any internal line breaks in headers are automatically stripped by the app.
2. **Report Rows (Row 2 onwards)**
   - **Report Key (column A)**: Required — a row with no key is silently skipped. Must be URL-safe (letters, numbers, hyphens, underscores). Must be unique across the sheet.
   - **Report List (column B)**: Display name shown on dashboard tiles. If left blank, defaults to `Report Key`.
   - **Embed URL (column C)**: Direct Power BI embed URL (`autoAuth=true`). Required — a row with no embed URL is skipped.
   - **Role columns (columns D onwards)**: Place an **`X`** (case-insensitive) in the role's column to grant that role access to the report. Blank or any other character means no access.

### Example — `Report Access Matrix`

| Report Key | Report List | Embed URL | finance-manager | project-manager | admin |
| :-- | :-- | :-- | :--: | :--: | :--: |
| resource-utilization | Resource Utilization | `https://app.powerbi.com/reportEmbed?...` | | X | X |
| revenue-tracking | Revenue & Target Tracking | `https://app.powerbi.com/reportEmbed?...` | X | | X |

---

## 5. Common tasks

### Add a new user
Add a row to `Users` with an email, password, and a role that exists as a role column in `Report Access Matrix`. Done.

### Add a brand-new role
1. Add a new column to `Report Access Matrix` starting at column D (or after existing role columns) with the role name as the header (e.g. `marketing-manager`).
2. Mark `'X'` in that column for any reports that role should see.
3. Assign the new role to users in `Users`.
No code change or deployment is needed — the app discovers new role columns automatically when the cache refreshes.

### Remove a user's access
Either delete their row from `Users`, or clear/blank one of the three cells (email/password/role) — a partially blank row is treated as if it doesn't exist.

### Give or remove report access for a role
Add or remove the `'X'` in that role's column on the report's row in `Report Access Matrix`.

### Add a brand-new report
Add a new row in `Report Access Matrix` with `Report Key`, `Report List`, `Embed URL`, and mark `'X'` under every role column that should see it.

### Retire a role entirely
Delete its column from `Report Access Matrix` **and** remove/reassign every `Users` row that referenced it.

---

## 6. How fast do changes take effect?

The app caches the parsed workbook in memory for **30 minutes by default** (configurable via `SHAREPOINT_CACHE_TTL_SECONDS`, see the architecture doc). After you save a change in SharePoint:

- It can take **up to that long** to appear for users already browsing.
- A user's **existing login session lasts up to 8 hours** regardless of workbook changes — removing someone from `Users` stops them from *logging in again*, and (once the cache refreshes) stops their dashboard from showing reports, but does not immediately invalidate a session they're already using.
- If you need a change to apply immediately, ask engineering to restart the app (which clears the in-memory cache) rather than waiting.

---

## 7. Checklist before saving the workbook

- [ ] Every role name in `Users` column C has a matching role column in `Report Access Matrix` (case-insensitive).
- [ ] No two rows in `Users` share the same email.
- [ ] Every `Report Key` is URL-safe (letters/numbers/hyphens/underscores only, no spaces).
- [ ] Every `Report Key` is unique across the sheet.
- [ ] Every real report row has a non-empty Embed URL, and it's a direct `app.powerbi.com` embed link with `autoAuth=true`.
- [ ] Role access permissions are marked with an `'X'` under the appropriate role columns.
- [ ] Anyone granted a report tile here also has the matching Power BI workspace permission in Power BI itself.
- [ ] `ReadMe`, `Users`, and `Report Access Matrix` are not used as individual role sheet names.
