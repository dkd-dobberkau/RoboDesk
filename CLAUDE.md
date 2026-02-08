# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RoboDesk is a personal CRM focused on relationship cultivation (not sales pipelines). It's a single-file React artifact (~870 lines JSX) with no build system, no backend, and no external dependencies. All data is stored locally via `window.storage` API. UI language is German.

## Architecture

**Single file:** `robodesk.jsx` — the entire application.

**Runtime environment:** Designed to run as a Claude Artifact or similar React sandbox that provides React globally. There is no package.json, no bundler, no test framework.

**Component structure (all in robodesk.jsx):**
- `RoboDesk` (default export) — main app container, all state management
- `ContactCard` — grid card rendering
- `ContactDetail` — full contact view with interaction timeline
- `ContactForm` — add/edit form
- `makeStyles(theme)` — style factory function returning all CSS-in-JS styles

**State-based routing** via `view` state: `"list"` | `"add"` | `"edit"` | `"detail"`

**Storage layer:** Async `window.storage.get(key)` / `window.storage.set(key, value)` API. Returns `{value: string}`. Three storage keys:
- `robodesk-contacts` — JSON array of contact objects
- `robodesk-tags` — JSON array of tag strings
- `robodesk-theme` — `"light"` or `"dark"`

**Theme system:** Two complete themes (light/dark) defined in `themes` object with ~45 design tokens each. Light uses warm beige (#f5f3ef) with sage green accent (#2a6b5a). Dark uses deep blue-black (#0c0f14) with mint accent (#8fbfa0).

## Data Model

Contact object shape:
```
{ id, name, email, phone, company, role, location, linkedin, website,
  notes, tags: string[], relationshipType, nextFollowUp, lastContact,
  createdAt, interactions: [{ id, type, content, date }] }
```

Relationship types: Professional, Personal, Community, Client, Partner

Interaction types: note, call, meeting, email, event, idea

Follow-up urgency logic (`getFollowUpUrgency`): overdue (>7 days past), due (1-7 days past), soon (within next 3 days), upcoming (future)

## Key Conventions

- All styling is inline via the `makeStyles(t)` pattern — no CSS files, no CSS-in-JS libraries
- Theme token `t` and styles object `s` are passed as props to child components
- IDs generated via `Date.now().toString(36) + Math.random().toString(36).substr(2, 5)`
- Dates stored as ISO strings, displayed in `de-DE` locale
- Default tags are TYPO3-ecosystem oriented (TYPO3, dkd, Client, Partner, Community, Speaker, etc.)
- All storage operations wrapped in silent try/catch
- No external imports beyond React hooks (useState, useEffect, useCallback)

## Code Analysis

Always use CodeGraph tools (`.codegraph/` is initialized) for code exploration instead of manual grep/glob:
- `codegraph_search` — find symbols by name (functions, classes, components)
- `codegraph_context` — get relevant code context for a task
- `codegraph_callers` / `codegraph_callees` — trace call flow
- `codegraph_impact` — check what's affected before making changes
- `codegraph_node` — get full source code of a symbol

When spawning Explore agents, instruct them to use codegraph tools.

## Technical Constraints

- `window.storage` has 5MB per key limit — consider sharding if contacts exceed this
- No build/lint/test commands exist — this is a copy-paste artifact
- For 500+ contacts, consider adding react-window for virtualized lists
- Keep it as a single-file artifact — do not split into multiple files unless explicitly asked

## Roadmap

Future development phases (in priority order):
1. **Data management**: CSV/vCard import/export, duplicate detection, bulk actions
2. **Smart features**: AI summaries, relationship strength score, smart reminders, birthday tracking
3. **Visualization**: Dashboard, network graph (D3.js), timeline view, interaction charts
4. **Workflow**: Email templates, Kanban board, meeting notes mode, recurring follow-ups
5. **UX polish**: Keyboard shortcuts, drag-and-drop tags, contact groups, profile photos, mobile optimization
