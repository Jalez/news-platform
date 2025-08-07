# AI News Platform - Backend API

Modern Express.js API server with TypeScript for the AI News Platform.

## Features

- ✅ **Express.js with TypeScript** - Type-safe Node.js server
- ✅ **Security Middleware** - Helmet for security headers
- ✅ **CORS Configuration** - Cross-origin resource sharing setup
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Request Logging** - Morgan HTTP request logger
- ✅ **Error Handling** - Comprehensive error middleware
- ✅ **Environment Configuration** - Validated environment variables
- ✅ **Health Checks** - API health monitoring endpoints
- ✅ **API Versioning** - Structured `/api/v1` endpoints
- ✅ **Development & Production Builds** - Optimized for both environments
- ✅ **Testing Suite** - Jest with TypeScript support
- ✅ **Code Quality** - ESLint configuration

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint
```

## API Endpoints

### Health Check
- `GET /api/v1/health` - API health status
- `GET /health` - Legacy endpoint (redirects to v1)

### Main API
- `GET /api/v1` - API information and available endpoints

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=*

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100           # requests per window
```

## Development

### Project Structure

```
src/
├── config.ts              # Environment validation
├── index.ts               # Main server file
├── middleware/
│   └── errorHandler.ts    # Error handling middleware
├── routes/
│   ├── index.ts          # Route aggregation
│   ├── api.ts            # Main API routes
│   └── health.ts         # Health check routes
└── __tests__/
    ├── api.test.ts       # API endpoint tests
    └── config.test.ts    # Configuration tests
```

### Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run clean` - Clean build directory

### Testing

Tests are written using Jest and Supertest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run API tests only
npm run test:api
```

### Code Quality

The project uses ESLint for code quality:

```bash
# Check for linting issues
npm run lint

# Check TypeScript types
npm run type-check
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure appropriate `CORS_ORIGIN`
3. Set up proper logging and monitoring
4. Configure reverse proxy (nginx/Apache)
5. Set up process management (PM2)

## Security Features

- **Helmet** - Sets security headers
- **CORS** - Configurable cross-origin requests
- **Rate Limiting** - Prevents abuse
- **Input Validation** - Ready for express-validator
- **Error Handling** - Prevents information leakage

## Next Steps

- Database integration (MongoDB/PostgreSQL)
- Authentication & Authorization (JWT)
- API documentation (Swagger/OpenAPI)
- Additional endpoints for news management
- Real-time features (WebSockets)
- Caching layer (Redis)
- Logging service integration