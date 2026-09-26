# papillon-transport

Zero-dependency TypeScript client that computes public transport itineraries (bus, tram, metro,
trains…) through [MOTIS](https://github.com/motis-project/motis), using the free and open
[Transitous](https://transitous.org) instance. Built for
[Papillon](https://github.com/PapillonApp/Papillon).

## Install

```bash
npm install papillon-transport
```

## Usage

```ts
import { createTransportClient, isTransportError } from "papillon-transport";

const client = createTransportClient({
  userAgent: "MyApp/1.2.3 (+https://example.org/contact)",
});

try {
  const { itineraries, attribution } = await client.plan({
    from: { lat: 48.8606, lon: 2.3376 },
    to: { lat: 48.8649, lon: 2.2742 },
    time: new Date("2026-09-29T08:30:00+02:00"),
    arriveBy: true,
  });

  const latest = itineraries.filter((i) => !i.cancelled).pop();
  console.log(latest?.departure);
} catch (error) {
  if (isTransportError(error)) console.error(error.code, error.message);
}
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
