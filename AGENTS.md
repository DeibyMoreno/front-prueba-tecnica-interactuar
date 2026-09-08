# AGENTS.md - SoporteTi (Angular 21)

## Development Commands

- `npm start` - Start dev server with proxy (http://localhost:4200)
- `npm run build` - Build project (output to `dist/`)
- `npm run watch` - Watch mode build
- `npm test` - Run unit tests with Vitest/Angular test builder

## Key Conventions

- **Style**: SCSS (angular.json defaults to scss)
- **Testing**: Vitest is installed (`vitest` in devDependencies), but Angular CLI test builder is configured in `angular.json`
- **Proxy**: `proxy.conf.json` is used for dev server proxy config
- **Environments**: `src/environments/` for environment-specific configs
- **Lint/formatting**: No ESLint configured; Prettier is configured (`printWidth: 100`, `singleQuote: true`)

## Commands That Matter

```bash
# Serve with hot reload + proxy
npm start

# Production build
npm run build

# Unit tests
npm test
```

## Notes for Agents

- The Angular CLI version is 21.2.21 - use `ng` via `npm run ng` or `npx ng`
- `packageManager` is pinned to `npm@10.9.7` in package.json
- No ESLint - only Prettier for formatting
- Vitest v4 is installed but Angular's test builder is the default; check `angular.json` test config