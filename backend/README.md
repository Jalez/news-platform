# Backend Package

Backend API server for AI News Platform built with Node.js, Express, and TypeScript.

## Features

- Express.js server with TypeScript
- CORS and security middleware configured
- Health check endpoint
- Ready for API endpoint implementation
- Uses shared types from `@ai-news-platform/shared`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:api` - Run API-specific tests
- `npm run clean` - Remove dist directory
- `npm run type-check` - Type checking without compilation
- `npm run lint` - Lint TypeScript files

## Development

```bash
# Start development server
npm run dev

# Server will be available at:
# - Health check: http://localhost:3000/health
# - API: http://localhost:3000/api
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=development
```

## API Documentation

The API follows the OpenAPI 3.0 specification defined in `../api-spec/openapi.yaml`. 

Once implemented, Swagger documentation will be available at `/api/docs`.