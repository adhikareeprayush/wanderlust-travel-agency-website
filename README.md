# Wanderlust Travel

A complete React + Express travel agency application, redesigned with an ivory and forest-green visual system, destination photography, responsive layouts, and a **request → team confirmation** booking process.

## Run locally

Requires Node.js 20.19+ (or 22.12+) and Docker.

```bash
npm install
docker compose up -d --wait
cp .env.example .env   # only if you do not already have a .env file
npm run setup
npm run dev
```

- Website: http://localhost:5173
- API health: http://localhost:5000/api/health
- Staff workspace: http://localhost:5173/dashboard

`setup` is repeatable and non-destructive. It adds missing demo accounts, tours and future departures. It upgrades only recognisable legacy demo images and itineraries, preserves existing bookings and custom content, and never resets the database. `seed` is an alias. Demo setup is disabled when `NODE_ENV=production`.

## Local demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@wanderlust.travel | WanderlustAdmin1! |
| Staff | staff@wanderlust.travel | WanderlustStaff1! |
| Customer | guest@wanderlust.travel | WanderlustGuest1! |

These are local demonstration credentials. Remove or replace demo accounts, inventory, prices and operating details before a public launch.

## Working flows

- Homepage destination search, travel month and group-size filters.
- Searchable tour catalog with region filtering and price, name and departure sorting.
- Destination-specific detail pages, itinerary sections, live dates and availability.
- Guest and signed-in booking requests with server-calculated prices and waitlisting.
- Private guest receipt access, account registration, sign-in and profile editing.
- Guest requests link to a newly signed-in account only when both the original receipt token and matching email are present.
- Customer booking history and cancellation of pending/waitlisted requests.
- Staff booking review, confirmation, cancellation and status management.
- Tour creation/editing/publishing, departure dates/capacity/guide assignment.
- Guest, guide and supplier management.
- Contact enquiries with a staff inbox and new/in-progress/closed statuses.
- Dedicated newsletter subscriber storage and staff subscriber list.
- Analytics based on saved records. **Confirmed trip value is not collected revenue.**
- SMTP acknowledgements and booking updates when a mail provider is configured.
- Production static serving and client route refresh support from Express.

No online payments are collected. Payment checkout and development payment-confirmation endpoints are disabled. Pending requests do not reserve seats and do not expire as unpaid holds.

## Booking consistency and access

MongoDB must be a **replica set** (including MongoDB Atlas). The supplied Compose configuration initializes a single-node replica set and preserves the named data volume. This enables transactions so a booking status, departure capacity and guest value change together. Concurrent confirmation cannot oversell capacity; repeated confirmation does not reserve places twice.

Requests use an idempotency key. Receipt tokens are stored as hashes on the server; the browser retains the secret in session storage. Anonymous access to a booking requires that secret. Account access checks the user ID rather than trusting an unverified email address. A guest receipt is available in its original browser session; save the displayed reference for support.

Authentication uses hashed passwords and signed, expiring JWTs. Production startup requires a non-default JWT secret of at least 32 characters. Auth, enquiry, newsletter and booking routes have rate limits; staff-only operations are authorized on the server.

## Production

```bash
npm ci
npm run build
NODE_ENV=production npm start
```

Express serves the built website and API on `PORT` (default 5000). Configure:

- `MONGODB_URI`: persistent MongoDB replica-set/Atlas connection.
- `JWT_SECRET`: a long random secret (generate with `openssl rand -hex 32`).
- `CLIENT_URL`: the public website origin.
- `SMTP_*`: mail provider credentials for real email delivery.
- `VITE_API_URL`: only needed if the frontend and API use different origins; set before building.

Without SMTP, submissions still persist, but emails are only previewed in server logs. The settings screen shows whether delivery is configured. Mail delivery failures are logged without undoing saved bookings.

The existing `vercel.json` is for **frontend-only hosting**. To use it, deploy the Express API separately and set `VITE_API_URL` to that API origin. For a single full-stack deployment, use the Node/Express start command above or the included Dockerfile with an external MongoDB replica set.

## Verification

```bash
npm run lint
npm test
npm run build
```

Integration tests use a uniquely named temporary `wanderlust_test_*` database on the local replica set and remove only that test database afterward. They cover authentication, authorization, future-date search, private receipts, idempotency, invalid inputs, concurrent confirmations, capacity release, waitlists, cancellations, disabled payment shortcuts, enquiries, newsletter persistence and staff operations. Set `TEST_MONGODB_URL` to change the test server origin (without a database path).

## Project structure

- `src/`: React pages, shared components, auth context and API client.
- `src/index.css`: responsive design system.
- `server/app.js`: Express application and production routing.
- `server/routes/`: validated REST APIs.
- `server/models/`: persistent MongoDB schemas.
- `server/utils/booking.js`: transactional booking status transitions.
- `server/scripts/setup.js`: non-destructive local setup.
- `server/tests/api.test.js`: isolated integration tests.
- `public/images/`: optimized local destination photography.

Destination images were downloaded from Unsplash; source URLs are listed in `public/images/SOURCES.md`. The original project assets remain in `src/assets/`.
