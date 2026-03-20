# mckn-funnel-panel

Grafana panel plugin that renders funnel chart visualizations. Plugin ID: `mckn-funnel-panel`. Frontend-only — no backend.

## Commands

```
npm run dev          # Watch mode development build (webpack, outputs to dist/)
npm run build        # Production build
npm run test         # Jest unit tests (watch mode)
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix + Prettier formatting
npm run e2e          # Playwright e2e tests (requires running Grafana)
npm run server       # Start local Grafana via Docker on port 3000
npm run test:ci      # Jest tests for CI (non-watch, max 4 workers)
npm run i18n-extract # Extract translation keys to src/locales/
```

Node >= 20 (see `.nvmrc`). Use `npm ci` for installs.

## Development Setup

`npm run server` starts a Docker Compose stack with Grafana:

- Grafana version defaults to 11.0.0 (override with `GRAFANA_VERSION` env var)
- Anonymous auth enabled, basic auth disabled, development mode
- Plugin signing disabled (unsigned plugins allowed)
- LiveReload enabled for hot reload during `npm run dev`
- Installs `marcusolsson-static-datasource` plugin automatically
- Enables `localizationForPlugins` feature toggle

Provisioned test data:

- Static datasource (UID: `vHsj2qbVk`) with example funnel data (5 steps: Sent → Viewed → Clicked → Add to cart → Purchased)
- Test dashboard at `/d/NtsITqb4z/funnel-examples` with panels for different sort modes

## Architecture

### Entry point

`src/module.ts` exports `plugin`, a `PanelPlugin<PanelOptions>` instance. It registers:

- `FunnelPanel` as the panel renderer
- Field config: color mode `ContinuousGrYlRd`, default min 0, disabled NoValue/Thresholds/Links
- Panel options: `sorting` (descending/ascending/none) and `showRemainedPercentage` (boolean)

### Data flow

1. Grafana passes `PanelProps<PanelOptions>` to `FunnelPanel` (`src/components/FunnelPanel.tsx`)
2. `useFunnelData` hook (`src/data/useFunnelData.ts`) processes data:
   - Empty series → `FunnelDataResultStatus.nodata`
   - No numeric fields → `FunnelDataResultStatus.unsupported`
   - Valid data → calls `getFieldDisplayValues` from `@grafana/data`, applies sorting by `percent`, returns `DisplayValue[]`
3. `FunnelPanel` renders based on status: `Nodata`, `Unsupported`, or the three-column layout

### Component hierarchy

```
FunnelPanel
├── Nodata                      # "No data" message
├── Unsupported                 # Alert explaining data requirements
└── [success]
    ├── PureLabels              # Step names (left, 120px flex-basis)
    ├── PureChart               # Center, flex-grow
    │   └── TooltipProvider     # react-tooltip context
    │       ├── Bar             # Colored bar, width = percent * 100%
    │       └── BarGap          # SVG clip-path trapezoid between steps
    └── PurePercentages         # Step percentages (right, 120px flex-basis)
```

### Types

`src/types.ts`:

- `Sorting` enum: `ascending`, `descending`, `none`
- `PanelOptions`: `{ sorting: Sorting; showRemainedPercentage: boolean }`

### Utilities (`src/utils/`)

- `formatPercentage(value)` — converts 0–1 decimal to display string like "68.22%"
- `getDisplayValueKey(value)` — composite key from `text-percent-title` for React keys
- `getContrastText(values, theme)` — picks readable text color against bar background
- `getPercentageExtraStyles(theme, textColor, bgColor)` — adds background pill when text would be unreadable

### Tooltip system (`src/components/Tooltip/`)

Module-level `contentRegistry` (Record<string, ReactNode>) with react-tooltip:

- `TooltipProvider` creates one tooltip instance per chart with a `nanoid` ID
- `useTooltipProps` hook registers content in registry, returns data attributes for trigger elements
- `BarTooltip` — shows label, value, percentage
- `BarGapTooltip` — shows drop or retention rate between steps

## Conventions

### Styling

- Use `@emotion/css` with `css()` function (not template literals)
- Use `useStyles2(getStyles)` from `@grafana/ui` for all component styles
- Style functions receive `GrafanaTheme2` as parameter
- For parameterized styles, use curried functions: `const getStyles = (param) => (theme: GrafanaTheme2) => { ... }`

### Components

- Functional components with explicit `ReactElement` return type
- Define props as `type Props = { ... }` (not interface), in the same file
- Support `'data-testid'?: string` prop on visual components
- Wrap with `React.memo` and export as `PureX` (e.g., `PureChart`, `PureLabels`)
- Use barrel exports via `index.ts` files in subdirectories

### Internationalization (i18n)

- Use `t()` from `@grafana/i18n` for short strings and attribute values
- Use `<Trans>` from `@grafana/i18n` for longer JSX content (full sentences/paragraphs)
- Translation key pattern: `panel.options.*` for panel options, `components.<component-name>.*` for component strings
- For interpolated values use `{{doublebraces}}` syntax: `t('key', 'Hello {{name}}', { name })`
- Locale files live in `src/locales/{lang}/mckn-funnel-panel.json` (en-US, sv-SE, es-ES, pt-BR, fr-FR)
- After adding or changing any user-facing strings, run `npm run i18n-extract` to sync the en-US locale file, then manually update sv-SE, es-ES, pt-BR, and fr-FR
- Do not call `t()` at module scope (top-level). Only call it inside components or lazy callbacks like `setPanelOptions`

### Imports

TypeScript `baseUrl` is `src/`, so use bare imports:

```ts
import { Sorting } from 'types';
import { getContrastText } from 'utils';
```

### Backward compatibility

- `Center.tsx` runtime-checks for `Stack` component availability, falls back to deprecated `HorizontalGroup`
- Plugin targets Grafana >= 11.0.0 (see `src/plugin.json` `grafanaDependency`)

## Testing

### Unit tests (Jest)

- Framework: Jest + @testing-library/react
- Run: `npm run test`
- Config extends `.config/jest.config`, timezone forced to UTC

### E2E tests (Playwright)

- Framework: Playwright + @grafana/plugin-e2e
- Files in `tests/`
- Requires running Grafana: `npm run build` then `npm run server`, then `npm run e2e` in a separate terminal
- Uses provisioned dashboard (`/d/NtsITqb4z/funnel-examples`) and static datasource for test data
- Panel view IDs: 7 (descending sort), 8 (ascending sort)
- Auth handled by `@grafana/plugin-e2e` auth setup project

### Test IDs

Follow the pattern `bar-{i}`, `label-{i}`, `percentage-{i}`, `gap-{i}`. Use this convention for new components.

## CI/CD

Three GitHub Actions workflows in `.github/workflows/`:

- **ci.yml** — runs on push to main/master and PRs. Steps: typecheck → lint → unit tests → build → (optional sign) → package → e2e tests against multiple Grafana versions
- **release.yml** — triggered by `v*` tags (e.g. `v2.1.0`). Builds and releases via `grafana/plugin-actions/build-plugin@release`. Requires `GRAFANA_API_KEY` secret for signing.
- **is-compatible.yml** — runs on PRs. Checks plugin compatibility against latest Grafana API. Fails the PR if incompatible.

### Release process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit and push to main
4. Tag with `git tag v{version}` and push the tag
5. `release.yml` handles build, sign, and GitHub release creation automatically

## Gotchas

- `plugin.json` version uses `%VERSION%` placeholder replaced by webpack at build. Never hardcode a version there.
- `DisplayValue.percent` is a 0–1 decimal, not 0–100. `formatPercentage` multiplies by 100 for display.
- Field config defaults `min` to 0. This is required for correct percentage/width calculation in the funnel.
- `.config/` directory is scaffolded by `@grafana/create-plugin`. Do not edit files there. Extend config via root-level files (`tsconfig.json`, `jest.config.js`, `.eslintrc`, `.prettierrc.js`).
- The tooltip system uses a module-level mutable registry. Content is registered via `useEffect` and cleaned up on unmount.
- `lint:fix` runs both ESLint with `--fix` and Prettier — it reformats the entire project, not just lint issues.
- `.cprc.json` contains `@grafana/create-plugin` feature flags. Don't enable `bundleGrafanaUI`, React Router v6, or Rspack without testing thoroughly.
