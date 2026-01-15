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
```

### Testing

- **Unit Tests**: Mock tests that don't require network access. Run with `npm run test:unit`
- **Integration Tests**: Tests against the real BMTC API. Run with `npm run test:integration` or set `RUN_REAL_API_TESTS=true npm test`

**Note**: Integration tests require network access and may be rate-limited by the BMTC API. Use them to verify the wrapper works correctly with the actual API.

## License

MIT
