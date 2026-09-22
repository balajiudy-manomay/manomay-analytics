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
| `Users` | **Yes, exact name** | One row per person who can log in. |
| `ReadMe` | No | Free-form notes for humans. Never read by the app. |
| *(one sheet per role, e.g. `Admin`, `Viewer`, `Manager`)* | At least one, to be useful | The list of reports that role can see. |

**The sheet name *is* the role.** There is no separate "roles" table. If a role is referenced in `Users` but has no sheet with that exact name, everyone with that role sees **zero reports** and lands on the "No access" page — no warning, no error.

`ReadMe` and `Users` are reserved names (matched case-insensitively) — **never** name a role sheet `ReadMe` or `Users`.

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
   - Matched **case-insensitively**, only outer whitespace trimmed (internal spacing/punctuation must match exactly).
   - **Must exactly equal the name of an existing role sheet** (see §4). `Manager` in this column requires a sheet literally named `Manager` (or `manager`, `MANAGER` — case doesn't matter, but spelling and spacing do).
   - Must be non-empty, or the row is silently ignored.
5. **Blank rows** anywhere (no email, or no password, or no role) are silently skipped — safe to leave gaps, but don't expect a half-filled row to "partially" work.

### Example

| Email | Password | Role |
| :-- | :-- | :-- |
| jane.doe@manomay.biz | Str0ngPass! | Admin |
| ravi.kumar@manomay.biz | AnotherPass1 | Viewer |
| priya.singh@manomay.biz | ThirdPass99 | Manager |

---

## 4. Role sheets (one per role)

Create a new sheet, named **exactly** the way that role appears in the `Users` sheet's Role column (case-insensitive, but spelling/spacing must match).

Row 1 is a header and is always skipped. Data starts at row 2.

| Column | A | B | C |
| :-- | :-- | :-- | :-- |
| **Field** | Report Key | Report Label | Embed URL |

### Rules

1. **Report Key (column A)**
   - Required — a row with no key is silently skipped.
   - **Must be URL-safe.** This value is placed directly into the page URL as `/dashboard/{Report Key}` with no encoding. Use only letters, numbers, hyphens, or underscores — **no spaces, slashes, question marks, or other special characters.**
   - Example: `resource-utilization`, `revenue_tracking`.
   - **Must be unique within the sheet.** If two rows share a key, the page will always resolve to whichever one the app matches first — don't rely on this, keep keys unique per role.
   - Keys **do not** need to match across different role sheets, but it's good practice to reuse the same key for "the same report" across roles so URLs stay predictable.
2. **Report Label (column B)**
   - Optional. This is the human-readable name shown as the tile title on the dashboard and as the page title when viewing the report.
   - If left blank, the app falls back to showing the **Report Key** itself as the label — so always fill this in for anything user-facing.
3. **Embed URL (column C)**
   - Required — a row with no embed URL is silently skipped. This is how you can leave a placeholder/note row (e.g. `(no report access yet)` in column B with columns A/C empty) without it showing up as a broken tile.
   - Must be a **direct Power BI organizational embed URL** (the standard `app.powerbi.com` report link, with `autoAuth=true`), **not** an embed-token/API URL. The app does not mint Power BI tokens — see [2026-09-15 System Architecture](2026-09-15_system_architecture_and_powerbi_integration.md) for why.
   - The user viewing the report must already have Power BI workspace access under their own Microsoft 365 account for `autoAuth` to work — this workbook only controls whether the app *shows them the tile/link*, not their underlying Power BI permissions. Grant both.

### Example — sheet named `Viewer`

| Report Key | Report Label | Embed URL |
| :-- | :-- | :-- |
| resource-utilization | Resource Utilization | `https://app.powerbi.com/reportEmbed?reportId=...&autoAuth=true` |
| revenue-tracking | Revenue & Target Tracking | `https://app.powerbi.com/reportEmbed?reportId=...&autoAuth=true` |

---

## 5. Common tasks

### Add a new user
Add a row to `Users` with an email, password, and a role that already has a matching sheet. Done.

### Add a brand-new role
1. Create a new sheet, named exactly what you'll type into the `Users` Role column.
2. Add report rows to it (Report Key / Label / Embed URL).
3. Assign the role to users in `Users`.
No code change or deployment is needed — the app discovers new sheets automatically the next time it refreshes its cache.

### Remove a user's access
Either delete their row from `Users`, or clear/blank one of the three cells (email/password/role) — a partially blank row is treated as if it doesn't exist.

### Remove a report from a role
Delete the row, or blank out the **Embed URL** cell (the row will then be skipped even if the key/label are still there).

### Retire a role entirely
Delete its sheet **and** remove/reassign every `Users` row that referenced it. If you delete the sheet but leave users pointing at that role name, those users simply get zero reports — no error is raised.

### Rename a role
Rename the sheet **and** update every matching row in `Users`'s Role column to the new spelling — the two must always match exactly (case-insensitive).

---

## 6. How fast do changes take effect?

The app caches the parsed workbook in memory for **30 minutes by default** (configurable via `SHAREPOINT_CACHE_TTL_SECONDS`, see the architecture doc). After you save a change in SharePoint:

- It can take **up to that long** to appear for users already browsing.
- A user's **existing login session lasts up to 8 hours** regardless of workbook changes — removing someone from `Users` stops them from *logging in again*, and (once the cache refreshes) stops their dashboard from showing reports, but does not immediately invalidate a session they're already using.
- If you need a change to apply immediately, ask engineering to restart the app (which clears the in-memory cache) rather than waiting.

---

## 7. Checklist before saving the workbook

- [ ] Every role name in `Users` column C has a sheet with that **exact** name (case-insensitive).
- [ ] No two rows in `Users` share the same email.
- [ ] Every `Report Key` is URL-safe (letters/numbers/hyphens/underscores only, no spaces).
- [ ] Every `Report Key` is unique within its own role sheet.
- [ ] Every real report row has a non-empty Embed URL, and it's a direct `app.powerbi.com` embed link with `autoAuth=true`.
- [ ] Anyone granted a report tile here also has the matching Power BI workspace permission in Power BI itself.
- [ ] `ReadMe` and `Users` are not used as role sheet names.
