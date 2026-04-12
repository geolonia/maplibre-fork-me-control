# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MapLibre GL JS plugin that adds a GitHub "fork me" ribbon control to the map. TypeScript port of [mbgl-fork-me-control](https://github.com/geolonia/mbgl-fork-me-control) (Mapbox version).

## Commands

- **Build:** `npm run build` (runs `tsc`)
- **Install:** `npm install`
- **Test:** `npm run test` (vitest, unit tests in `src/`)
- **Test with coverage:** `npm run test:coverage`
- **Lint:** `npm run lint` (biome, checks `src/` and `e2e/`)
- **Lint fix:** `npm run lint:fix`
- **E2E Test:** `npm run e2e` (playwright, Chromium/Firefox/WebKit)
- **Dev server:** `npm run dev` (opens http://localhost:5176/e2e/)
- **Screenshot:** `npm run screenshot` (builds, then captures `assets/screenshot.png` via Playwright)

## Architecture

Single-module library exporting `ForkMeControl`, which implements MapLibre's `IControl` interface. The entry point is `src/index.ts`.

The control supports `top-left` (default) and `top-right` positioning via the `position` option. It creates a ribbon image positioned absolutely within the control slot, resets the control group's `margin` and `padding` to align flush with the map edge, and shifts the group down by the ribbon height. `onRemove` restores all original styles.

`maplibre-gl` is a **peer dependency** — not bundled into the output.

## Testing

- **Unit tests** (`src/index.test.ts`): DOM is mocked manually with a lightweight `MockElement` class. Do not install `jsdom` or `happy-dom`.
- **E2E tests** (`e2e/`): Each test scenario has a paired `.html` + `.test.ts`. HTML pages load MapLibre GL JS from `node_modules` and the built library from `dist/`.

## Notes

- Don't install `jsdom` or `happy-dom` for testing
- CI is defined in `.github/workflows/ci.yml` — publish triggers on `v*` tags via npm OIDC (no `NPM_TOKEN` needed)
