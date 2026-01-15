# BMTC TypeScript Wrapper

A type-safe TypeScript wrapper for BMTC (Bangalore Metropolitan Transport Corporation) APIs with Zod validation and GeoJSON support.

## Features

- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Validation**: Runtime validation using Zod schemas
- 🗺️ **GeoJSON**: Standard GeoJSON format for all spatial data (routes, stops, locations)
- 🚀 **Modern**: Built with modern TypeScript and ES modules
- 📦 **Lightweight**: Minimal dependencies

## Installation

```bash
npm install bmtc-wrapper
```

## Usage

```typescript
import { BMTCClient } from "bmtc-wrapper";

const client = new BMTCClient();

// API methods will be available here as endpoints are implemented
```

## API Endpoints

Endpoints will be documented here as they are implemented.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run unit tests (with mocks)
npm run test:unit

# Run all tests
npm test

# Watch tests
npm run test:watch

# Run integration tests against real BMTC API
npm run test:integration

# Run specific endpoint integration test
npm run test:integration:helpline
npm run test:integration:service
npm run test:integration:about
npm run test:integration:emergency
npm run test:integration:vehicle

# Or use TEST_ENDPOINT environment variable
TEST_ENDPOINT=helpline npm run test:integration
```

### Testing

This project includes comprehensive testing with both unit tests (mocked) and integration tests (real API).

#### Unit Tests

Unit tests use mocked HTTP responses and don't require network access. They're fast and can be run frequently during development.

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

#### Integration Tests

Integration tests make actual HTTP requests to the real BMTC API. They verify that the wrapper works correctly with the actual API endpoints.

**⚠️ Important Notes:**

- Integration tests require network access
- Tests are rate-limited with a 2-second delay between requests to prevent IP blocking
- Tests run sequentially to avoid overwhelming the API
- Tests are skipped by default unless explicitly enabled

**Running Integration Tests:**

```bash
# Run all integration tests
npm run test:integration

# Run specific endpoint tests (recommended for faster testing)
npm run test:integration:helpline
npm run test:integration:service
npm run test:integration:about
npm run test:integration:emergency
npm run test:integration:vehicle

# Or use environment variable for custom filtering
TEST_ENDPOINT=helpline npm run test:integration
```

**Environment Variables:**

- `RUN_REAL_API_TESTS`: Set to `true` or `1` to enable integration tests (automatically set by `test:integration` scripts)
- `TEST_ENDPOINT`: Filter tests by endpoint name (e.g., `helpline`, `vehicle`, `service`, `about`, `emergency`)

**Test Output:**

Integration tests print formatted JSON responses to the console, making it easy to inspect the actual API responses and verify the normalization is working correctly.

**Rate Limiting:**

The integration tests include a 2-second delay between each test to prevent rate limiting. Tests are configured to run sequentially (single fork) to ensure proper rate limiting behavior.

## License

MIT
