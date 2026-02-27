# mckn-funnel-panel

Grafana panel plugin that renders funnel chart visualizations. Plugin ID: `mckn-funnel-panel`. Frontend-only — no backend.

## Commands

```
npm run dev          # Watch mode development build (webpack, outputs to dist/)
npm run build        # Production build
npm run test         # Jest unit tests (watch mode)
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run e2e          # Playwright e2e tests (requires running Grafana)
npm run server       # Start local Grafana via Docker on port 3000
```

Node >= 20 (see `.nvmrc`). Use `npm ci` for installs.

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

### Imports

TypeScript `baseUrl` is `src/`, so use bare imports:

```ts
import { Sorting } from 'types';
import { getContrastText } from 'utils';
```

### Backward compatibility

- `Center.tsx` runtime-checks for `Stack` component availability, falls back to deprecated `HorizontalGroup`
- Plugin targets Grafana >= 9.2.5 (see `src/plugin.json` `grafanaDependency`)

## Testing

### Unit tests (Jest)

- Framework: Jest + @testing-library/react
- Run: `npm run test`
- Config extends `.config/jest.config`, timezone forced to UTC

### E2E tests (Playwright)

- Framework: Playwright + @grafana/plugin-e2e
- Files in `tests/`
- Requires running Grafana: `npm run build` then `npm run server`, then `npm run e2e` in a separate terminal
- Uses provisioned dashboards and static datasource for test data
- Auth handled by `@grafana/plugin-e2e` auth setup project

### Test IDs

Follow the pattern `bar-{i}`, `label-{i}`, `percentage-{i}`, `gap-{i}`. Use this convention for new components.

## Gotchas

- `plugin.json` version uses `%VERSION%` placeholder replaced by webpack at build. Never hardcode a version there.
- `DisplayValue.percent` is a 0–1 decimal, not 0–100. `formatPercentage` multiplies by 100 for display.
- Field config defaults `min` to 0. This is required for correct percentage/width calculation in the funnel.
- `.config/` directory is scaffolded by `@grafana/create-plugin`. Do not edit files there. Extend config via root-level files (`tsconfig.json`, `jest.config.js`, `.eslintrc`, `.prettierrc.js`).
- The tooltip system uses a module-level mutable registry. Content is registered via `useEffect` and cleaned up on unmount.
