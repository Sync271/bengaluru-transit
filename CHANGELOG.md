# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Bengaluru Transit SDK
- Type-safe SDK for Bengaluru public transit APIs
- Zod validation for all API requests and responses
- GeoJSON support for all spatial data (routes, stops, locations)
- Comprehensive TypeScript type definitions
- Support for trip planning with transfers and walking segments
- Live vehicle tracking capabilities
- Route search and timetable functionality
- Nearby stops and stations discovery
- Fare information lookup
- Emergency messages and service alerts

### Features
- **Routes API**: Trip planning, route search, timetables, fare lookup, route details
- **Stops API**: Nearby stops/stations, stop search, facilities information
- **Vehicles API**: Vehicle search, live tracking, trip details
- **Locations API**: Place search by name
- **Info API**: Helpline, service types, about data, emergency messages

### Technical
- Built with TypeScript and ES modules
- Runtime validation using Zod schemas
- Standard GeoJSON format for all spatial data
- Consistent string-based IDs throughout the API
- Date objects for all date/time parameters
- Clean, normalized response types (raw types excluded from public API)
