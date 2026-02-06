# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A yearly calendar web app for 2026, inspired by Apple Calendar's iOS design. Built with React 19, TypeScript, Vite 7, and Tailwind CSS 4. All data is persisted client-side — defaults to localStorage, with optional File System Access API support for reading/writing a local JSON file (Chrome/Edge). There is no backend.

## Commands

- **Dev server:** `npm run dev`
- **Production build:** `npm run build` (runs `tsc -b && vite build`)
- **Preview build:** `npm run preview`

No test runner, linter, or formatter is configured.

## Architecture

### Component Tree

```
App (modal state, scroll-to-today logic, file connection state)
├── Header (year display, nav buttons, "Today" button, "+ Event" trigger)
├── CalendarGrid (forwardRef, renders 31-day sticky header + 12 MonthRows)
│   └── MonthRow × 12 (day cells, weekend/today highlighting, event positioning)
│       └── EventBar (positioned via CSS calc, stacked for overlaps, click popover with delete)
├── EventModal (form with date validation, color picker, backdrop dismiss)
└── Footer (storage mode indicator, file connect/disconnect buttons)
```

### State & Data Flow

- `useEvents()` custom hook (`src/hooks/useEvents.ts`) owns all event state and persistence logic. Exposes `events[]`, `addEvent()`, `deleteEvent()`, and file connection methods (`connectFile`, `createFile`, `disconnectFile`). Persistence is dual-write: always writes to localStorage (fallback), and also writes to a connected file handle if in file mode. On mount, attempts to restore the file handle from IndexedDB.
- App holds modal open/close state and passes `addEvent` down to `EventModal`, `deleteEvent` down through CalendarGrid → MonthRow → EventBar.
- Events flow as props: App → CalendarGrid → MonthRow → EventBar.
- No external state library — pure React hooks (`useState`, `useCallback`, `useRef`, `useEffect`).

### Calendar Layout

The calendar uses a CSS Grid defined in `index.css` as `.grid-calendar`: one 80px column for month labels + 31 equal-width columns for days. Month rows and day headers use sticky positioning. Invalid days (e.g., Feb 30) show a diagonal stripe pattern (`.pattern-diagonal`).

### Key Types (`src/types.ts`)

- `CalendarEvent`: `{ id, title, start (YYYY-MM-DD), end (YYYY-MM-DD), color }`
- `ColorOption`: `{ name, hex (Tailwind class) }`
- `CalendarFile`: `{ version, app, lastModified, events }` — envelope format for the JSON file

### File Access (`src/lib/fileAccess.ts`)

Utility module wrapping the File System Access API:
- `isFileSystemAccessSupported()` — feature detection
- `openJsonFile()` / `createJsonFile()` — file picker wrappers returning `FileSystemFileHandle | null`
- `readFileHandle()` / `writeFileHandle()` — read/write JSON via file handle (supports both `CalendarFile` envelope and plain array formats)
- `verifyPermission()` — check and request readwrite permission
- `saveHandleToDB()` / `loadHandleFromDB()` / `clearHandleFromDB()` — IndexedDB persistence for file handles across sessions

### Type Declarations (`src/file-system-access.d.ts`)

Ambient type declarations for the File System Access API (`FileSystemFileHandle`, `showOpenFilePicker`, `showSaveFilePicker`) extending the `Window` interface.

### Constants (`src/constants.ts`)

- `YEAR = 2026` — hardcoded target year
- `COLORS` — 7 color options using Tailwind classes
- `COLOR_MAP` — maps event color strings to Tailwind styling classes
- `DEFAULT_EVENTS` — sample events loaded when localStorage is empty and no file is connected

### Styling

Tailwind CSS v4 via Vite plugin. Custom iOS-inspired theme variables defined in `src/index.css` (e.g., `--color-ios-bg`, `--color-ios-red`, `--color-ios-blue`). Uses Inter font (loaded from Google Fonts) and Material Symbols Outlined icons.

## TypeScript Configuration

Strict mode is enabled with `noUnusedLocals` and `noUnusedParameters`. Target is ES2020 with `react-jsx` transform. The compiler is used for type-checking only (`noEmit: true`); Vite handles transpilation.
