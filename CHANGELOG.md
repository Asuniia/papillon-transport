# papillon-transport

## 1.0.1

### Patch Changes

- 3ab4a09: ci

## 1.0.0

### Major Changes

- 412d1d7: First release: `createTransportClient()` with `plan()` on MOTIS v6 `/api/v6/plan` (Transitous by default), a normalized model (`Itinerary`, `WalkLeg` | `TransitLeg`, `Line`, `Place`, `Attribution`), optional leg geometry with `includeGeometry`, and `TransportError` with codes `INVALID_CONFIG`, `INVALID_QUERY`, `NETWORK`, `TIMEOUT`, `ABORTED`, `RATE_LIMITED`, `HTTP`, `INVALID_RESPONSE`.
