# RoboDesk Phase 2: UX Polish, Relationship Strength, Bulk Actions, Visualization

**Date:** 2026-02-08
**Status:** Approved

## Feature 1: UX Polish

### Close data menu on outside click
`useEffect` with `mousedown` listener. Check if click target is outside menu, close if so.

### Data menu hover highlight
CSS rule in existing `<style>` block for hover state on menu items.

### Keyboard shortcuts
Single `useEffect` with `keydown` listener. Guard against inputs/textareas.

| Key | Action | Context |
|---|---|---|
| `Escape` | Close menus, go back | Global |
| `n` | New contact | List/Dashboard |
| `/` | Focus search | List view |
| `d` | Switch to Dashboard | Global |
| `k` | Switch to Kontakte | Global |

### Mobile optimization
`@media (max-width: 640px)` rules in `<style>` block:
- Header: flex-wrap, stack logo/nav above actions
- Stats grid: 2 columns
- Contact grid: single column
- Detail/form grid: single column

## Feature 2: Relationship Strength Score

### Scoring formula (0–100)

| Factor | Weight | Logic |
|---|---|---|
| Recency | 40% | Exponential decay from last contact (0d=40, 30d=20, 90d+=0) |
| Frequency | 30% | Interactions/month over 6 months (3+/mo=30, 1/mo=15, 0=0) |
| Variety | 15% | Distinct interaction types (5+=15, 3=10, 1=5) |
| Consistency | 15% | Low gap deviation between interactions = higher score |

### Visual indicators

| Score | Label | Color |
|---|---|---|
| 80–100 | Stark | Green (#16a34a) |
| 50–79 | Gut | Accent color |
| 20–49 | Nachlassend | Orange (#d97706) |
| 0–19 | Kalt | Grey |

### Where it appears
- **Contact card:** colored bar at bottom
- **Contact detail:** score + label next to name
- **Dashboard stats:** average strength across all contacts
- **Sort option:** "Beziehungsstärke" added to sort dropdown

### Implementation
Pure function `getRelationshipStrength(contact)` → `{ score, label, color }`. Computed on render, not stored.

## Feature 3: Bulk Actions

### Selection mode
New state: `bulkMode: boolean`, `selectedIds: Set<string>`.

Activated via "Auswählen" button in toolbar.

### Bulk toolbar (replaces normal toolbar in bulk mode)
- "X ausgewählt" counter
- **Alle auswählen** / **Auswahl aufheben**
- **Tags setzen** — add/remove tag from all selected
- **Exportieren** — CSV or VCF of selected only
- **Löschen** — delete with confirmation
- **Abbrechen** — exit bulk mode

### Card behavior in bulk mode
- Checkbox overlay on each card
- Click toggles selection (not detail view)

## Feature 4: Visualization (inline SVG)

### Activity Chart (Dashboard)
Bar chart: interactions per week, last 8 weeks. SVG `<rect>` elements. Hover shows count.

### Relationship Type Breakdown (Dashboard)
Horizontal stacked bar or donut chart showing contact distribution by relationship type. SVG arcs.

### Contact Timeline (Detail view)
Visual timeline of interactions plotted along vertical SVG axis with date markers. Alternative rendering of existing interaction data.

## Implementation Order

1. UX Polish (quick wins, improves everything)
2. Relationship Strength (new computed data used by later features)
3. Bulk Actions (uses existing data, new UI mode)
4. Visualization (uses all data, biggest UI addition)
