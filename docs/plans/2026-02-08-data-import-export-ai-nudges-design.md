# RoboDesk Feature Design: Data Import/Export + AI Nudges Dashboard

**Date:** 2026-02-08
**Status:** Draft — awaiting approval

## Summary

Three features for RoboDesk:

1. **CSV Export/Import** — Download contacts as CSV, import CSV files back
2. **VCF Import/Export** — Import/export contacts as vCard (.vcf) files
3. **AI-Assisted Dashboard** — New default view with smart nudges, stats, and recent activity

All features stay within the single-file architecture. No external libraries. No API keys required.

---

## Feature 1: CSV Export & Import

### Export

- Header button (or "Daten" menu) triggers CSV download
- Filename: `robodesk-export-YYYY-MM-DD.csv`
- Columns: Name, Email, Phone, Company, Role, Location, LinkedIn, Website, Notes, Tags (semicolon-separated), Relationship Type, Next Follow-Up, Last Contact, Created At
- Interactions are excluded (nested data — separate feature if needed later)
- Uses browser `Blob` + `URL.createObjectURL` for download

### Import

- File picker accepts `.csv` files
- Parses CSV, maps headers to contact fields (case-insensitive header matching)
- Duplicate detection: match by email (primary), then exact name (fallback)
- Skips duplicates, shows summary: "12 Kontakte importiert, 3 Duplikate übersprungen"
- Tags from CSV (semicolon-separated) are merged into the global tag list
- New contacts get generated IDs, `createdAt` set to import time, empty `interactions` array

### CSV Parser

Simple inline parser — handles quoted fields with commas and newlines:
- Split by newline (respecting quoted fields)
- Split each line by comma (respecting quotes)
- Map first row as headers

---

## Feature 2: VCF Import & Export

### Import

- File picker accepts `.vcf` files (one or multiple vCards per file)
- Parses vCard 3.0 and 4.0 formats

**Field mapping:**

| vCard Field | RoboDesk Field |
|---|---|
| `FN` | name |
| `EMAIL` | email |
| `TEL` | phone |
| `ORG` | company |
| `TITLE` | role |
| `ADR` (locality component) | location |
| `URL` (contains "linkedin") | linkedin |
| `URL` (other) | website |
| `NOTE` | notes |
| `CATEGORIES` | tags |

- Handles folded lines (continuation with space/tab)
- Handles quoted-printable encoding (`=XX` sequences)
- Duplicate detection: email match first, then exact name match
- Summary toast after import: "8 Kontakte importiert, 2 übersprungen (Duplikate)"
- New tags from `CATEGORIES` merged into global tag list

### Export

- Generates single `.vcf` file with all contacts
- vCard 3.0 format for broad compatibility
- Filename: `robodesk-contacts-YYYY-MM-DD.vcf`

**Format per contact:**
```
BEGIN:VCARD
VERSION:3.0
FN:Max Mustermann
EMAIL:max@example.com
TEL:+49 170 1234567
ORG:dkd Internet Service GmbH
TITLE:Developer
ADR:;;;;;;Frankfurt
URL:https://linkedin.com/in/max
NOTE:Met at TYPO3 conf
CATEGORIES:TYPO3,Community
END:VCARD
```

- Only includes fields that have values (no empty lines)
- Special characters escaped per vCard spec

---

## Feature 3: AI-Assisted Dashboard

### New View: Dashboard (default landing page)

The dashboard becomes the first view when opening RoboDesk. Navigation adds a toggle: **Dashboard | Kontakte**.

New `view` state value: `"dashboard"` (added alongside `"list"`, `"add"`, `"edit"`, `"detail"`). Default view changes from `"list"` to `"dashboard"`.

### Section 1: Smart Nudges (top)

A `generateNudges(contacts)` function returns prioritized action items:

| Nudge Type | Rule | Priority |
|---|---|---|
| Overdue follow-up | `nextFollowUp` > 7 days past | 1 (highest) |
| Follow-up due | `nextFollowUp` 0-7 days past | 2 |
| Neglected contact | `lastContact` > 60 days ago, has interactions | 3 |
| New & untouched | Created > 7 days ago, 0 interactions | 4 |
| No follow-up set | Has interactions but no `nextFollowUp` | 5 |
| Relationship momentum | 3+ interactions in last 30 days | 6 (positive) |

**Nudge data structure:**
```js
{ type: string, priority: number, contactId: string, contactName: string, message: string }
```

Display: Top 5 nudges as color-coded cards. Each card shows contact name, nudge message, and "Kontakt öffnen" button. "Alle anzeigen" link expands the full list.

**Color coding:**
- Priority 1-2: Danger/warning color (overdue/due)
- Priority 3-5: Accent color (suggestions)
- Priority 6: Positive/success color (momentum)

### Section 2: Stats Overview (middle row)

Row of stat cards:
- **Kontakte gesamt** — total contact count
- **Interaktionen diesen Monat** — count of interactions with `date` in current month
- **Überfällige Follow-ups** — count where urgency is "overdue" (red badge)
- **Neu diesen Monat** — contacts with `createdAt` in current month
- **Aktivster Bereich** — relationship type with most interactions this month

### Section 3: Recent Activity (bottom)

Timeline of the last 10 interactions across all contacts:
- Collect all interactions from all contacts
- Sort by date descending
- Display: interaction type icon + "Meeting mit Max Mustermann — vor 2 Tagen"
- Each entry clickable — navigates to contact detail view
- Uses existing `daysAgo()` function for relative dates

### Future LLM Extension Point

The `generateNudges()` function is the hook for LLM integration. Later, an async variant can call Claude/OpenAI API to produce smarter nudges using the same `{ type, priority, contactId, message }` shape. The UI doesn't change — just the nudge content gets richer.

---

## UI Integration

### Header Changes

Current header has: logo, subtitle, search, theme toggle, add button.

New additions:
- **Dashboard/Kontakte toggle** — two subtle tab buttons between the logo area and the search bar
- **Data menu** — a "Daten" dropdown button (or icon button) near the add-contact button, containing:
  - CSV exportieren
  - CSV importieren
  - VCF exportieren
  - VCF importieren

### Import Flow (CSV & VCF)

1. User clicks import option in data menu
2. Hidden `<input type="file" accept=".csv">` or `accept=".vcf"` is triggered
3. File is read via `FileReader`
4. Parsed contacts shown in a preview/summary (count, duplicates detected)
5. User confirms import
6. Contacts added, summary toast displayed

### Styling

All new UI elements follow existing patterns:
- Use theme tokens (`t.cardBg`, `t.accentPrimary`, etc.)
- Inline styles via `makeStyles(t)`
- Consistent border radius, shadows, and spacing with existing cards

---

## Implementation Order

1. **CSV Export** — simplest, immediate value, tests the data-menu UI
2. **CSV Import** — builds on the parser, adds file input and duplicate logic
3. **VCF Export** — similar to CSV export, different format
4. **VCF Import** — VCF parser, reuses duplicate detection from CSV import
5. **Dashboard view** — new view state, `generateNudges()`, stats calculations
6. **Navigation update** — Dashboard/Kontakte toggle, default to dashboard

Estimated additions: ~300-400 lines to `robodesk.jsx`.

---

## Out of Scope (for now)

- Google Sheets API integration (future phase)
- LLM-powered nudges (future — architecture supports it)
- Interaction export (complex nested data)
- Batch selection for partial export
- Excel (.xlsx) format (would need SheetJS library)
