# Wanderlust Travel

A complete React + Express travel agency application, redesigned with a warm ivory and orange visual system, destination photography, responsive layouts, and a **request → team confirmation** booking process.

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

## Team accounts and permissions

- Visitors can only register **customer** accounts. Staff and administrator accounts are created by an administrator in **Workspace → Team & settings**.
- Administrators can open every area, create staff, reset their passwords, deactivate or remove them, and grant access per area: bookings, journeys, departures, enquiries, travellers, guides, suppliers and analytics. The access matrix saves changes immediately.
- Permissions are checked by the server on every request; the workspace also hides areas a person cannot open. Deactivated accounts are signed out and cannot sign in.
- An administrator cannot change their own role, deactivate or remove themselves, and at least one active administrator always remains.
- Team members change their own password from the profile menu. They do not use the traveller account area.
- Staff accounts created before permissions existed keep access to every operational area until an administrator changes them.

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
- Administrator-managed team accounts with per-area staff permissions.
- SMTP acknowledgements and booking updates when a mail provider is configured.
- Production static serving and client route refresh support from Express.

No online payments are collected. Payment checkout and development payment-confirmation endpoints are disabled. Pending requests do not reserve seats and do not expire as unpaid holds.

## Booking consistency and access

MongoDB must be a **replica set** (including MongoDB Atlas). The supplied Compose configuration initializes a single-node replica set and preserves the named data volume. This enables transactions so a booking status, departure capacity and guest value change together. Concurrent confirmation cannot oversell capacity; repeated confirmation does not reserve places twice.

Requests use an idempotency key. Receipt tokens are stored as hashes on the server; the browser retains the secret in session storage. Anonymous access to a booking requires that secret. Account access checks the user ID rather than trusting an unverified email address. A guest receipt is available in its original browser session; save the displayed reference for support.

Authentication uses hashed passwords and signed, expiring JWTs. Production startup requires a non-default JWT secret of at least 32 characters. Auth, enquiry, newsletter and booking routes have rate limits; staff-only operations are authorized on the server.

## Deploy to a VPS (Docker + Caddy)

`docker-compose.prod.yml` runs the app behind Caddy, which serves HTTPS for `travel.prayushadhikari.com.np` and renews the certificate automatically. The database is MongoDB Atlas; images are stored and served by ImageKit.

Before you start:

- A DNS **A record** for `travel.prayushadhikari.com.np` pointing at the VPS, and ports **80** and **443** open.
- In **Atlas → Network Access**, allow the VPS's public IP address.
- Docker with the Compose plugin on the VPS.

```bash
git clone <your-repo-url> wanderlust && cd wanderlust
cp .env.production.example .env.production
nano .env.production        # fill in MONGODB_URI, JWT_SECRET, IMAGEKIT_PRIVATE_KEY
docker compose -f docker-compose.prod.yml up -d --build

# First time only
docker compose -f docker-compose.prod.yml exec app node server/scripts/create-admin.js you@example.com "Your Name"
docker compose -f docker-compose.prod.yml exec app node server/scripts/setup.js --catalog   # optional sample journeys
```

- `JWT_SECRET`: generate with `openssl rand -hex 32`. The app refuses to start in production without a strong one.
- `create-admin` asks for a password (12+ characters). Sign in at `/login`, then add staff under **Team & settings**.
- `setup.js --catalog` adds the sample journeys and dates only. The public demo accounts are never created in production.
- Updates: `git pull && docker compose -f docker-compose.prod.yml up -d --build`.
- Logs: `docker compose -f docker-compose.prod.yml logs -f app caddy`.

If Caddy already runs on the host for other sites, remove the `caddy` service, publish the app with `ports: ["127.0.0.1:5000:5000"]`, and add this to your existing Caddyfile:

```
travel.prayushadhikari.com.np {
	encode zstd gzip
	reverse_proxy 127.0.0.1:5000
}
```

### Images (ImageKit)

Site photography is served from `https://ik.imagekit.io/vboscqy9oj/wanderlust/…`, resized and converted to modern formats by ImageKit. Journey covers uploaded in the workspace go straight from the browser to ImageKit using a short-lived signature from the server; the private key never leaves the server. After adding or replacing files in `public/images`, run `npm run images:sync` (or the same script inside the container) to upload them. Without `VITE_IMAGEKIT_URL_ENDPOINT` at build time, the bundled `/images` files are used instead.

### Other hosting

`npm ci && npm run build && NODE_ENV=production npm start` serves the built site and API on `PORT` (default 5000). The existing `vercel.json` is for frontend-only hosting with the API deployed separately and `VITE_API_URL` set before building. Without SMTP settings, submissions still persist and emails are only logged.

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
