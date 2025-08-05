# Frontend Package

Frontend React application for AI News Platform built with React 18, TypeScript, Vite, and Tailwind CSS.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Ready for component development
- Uses shared types from `@ai-news-platform/shared`
- Proxy configuration for backend API

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run Vitest tests
- `npm run test:ui` - Run tests with UI
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run e2e tests with UI
- `npm run clean` - Remove dist directory
- `npm run type-check` - Type checking without compilation
- `npm run lint` - Lint TypeScript files

## Development

```bash
# Start development server
npm run dev

# Application will be available at:
# http://localhost:5173/
```

## API Integration

The development server is configured to proxy API requests to the backend:

- All `/api/*` requests are forwarded to `http://localhost:3000`
- This allows full-stack development with both servers running

## Styling

Uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

## Testing

- Unit tests: Vitest
- E2E tests: Playwright
- Test files should be placed alongside components or in `__tests__` directories