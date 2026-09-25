import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";

const dbName = "wanderlust_test_" + crypto.randomBytes(6).toString("hex");
process.env.MONGODB_URI =
  (process.env.TEST_MONGODB_URL || "mongodb://127.0.0.1:27017") +
  "/" +
  dbName +
  "?replicaSet=rs0";
process.env.NODE_ENV = "test";
process.env.SMTP_HOST = "";
process.env.JWT_SECRET = "test-only-secret-not-used-outside-isolated-tests";
const { default: app } = await import("../app.js");
const { connectDb } = await import("../config/db.js");
const { User } = await import("../models/User.js");
const { Tour } = await import("../models/Tour.js");
const { Departure } = await import("../models/Departure.js");
const { Booking } = await import("../models/Booking.js");
const { Subscriber } = await import("../models/Subscriber.js");
const { Enquiry } = await import("../models/Enquiry.js");
const { Guest } = await import("../models/Guest.js");
let server, base, admin, customer, other, tour, departure;
async function request(path, { method = "GET", body, token, access } = {}) {
  const response = await fetch(base + "/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(access ? { "X-Booking-Token": access } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
}
const credentials = {
  email: "admin@test.example",
  password: "TestPassword123!",
};
before(async () => {
  await connectDb();
  await Promise.all([
    Booking.init(),
    Subscriber.init(),
    User.init(),
    Guest.init(),
    Tour.init(),
    Departure.init(),
  ]);
  await User.create({
    name: "Test Admin",
    email: credentials.email,
    passwordHash: await User.hashPassword(credentials.password),
    role: "admin",
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port;
  admin = (await request("/auth/login", { method: "POST", body: credentials }))
    .data.token;
  customer = (
    await request("/auth/register", {
      method: "POST",
      body: {
        name: "Test Traveller",
        email: "traveller@test.example",
        password: "TestPassword123!",
      },
    })
  ).data.token;
  other = (
    await request("/auth/register", {
      method: "POST",
      body: {
        name: "Other Traveller",
        email: "other@test.example",
        password: "TestPassword123!",
      },
    })
  ).data.token;
  tour = await Tour.create({
    title: "Test Alps Journey",
    slug: "test-alps",
    region: "Europe",
    durationDays: 8,
    basePrice: 1250,
    published: true,
  });
  departure = await Departure.create({
    tour: tour._id,
    startDate: new Date(Date.now() + 30 * 864e5),
    seats: 4,
  });
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (
    mongoose.connection.name === dbName &&
    dbName.startsWith("wanderlust_test_")
  )
    await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
function payload(overrides = {}) {
  return {
    departureId: String(departure._id),
    guestName: "Test Traveller",
    email: "traveller@test.example",
    partySize: 2,
    requestKey: crypto.randomUUID(),
    trackingToken: crypto.randomBytes(36).toString("hex"),
    ...overrides,
  };
}

test("registration, login, profile and role boundaries work", async () => {
  assert.ok(admin && customer && other);
  assert.equal((await request("/bookings", { token: customer })).status, 403);
  assert.equal((await request("/enquiries")).status, 401);
  assert.equal((await request("/departures")).status, 401);
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: { ...credentials, password: "bad" },
      })
    ).status,
    401,
  );
  const profile = await request("/auth/profile", {
    method: "PATCH",
    token: customer,
    body: { name: "Updated Traveller", role: "admin" },
  });
  assert.equal(profile.data.user.name, "Updated Traveller");
  assert.equal(profile.data.user.role, "customer");
});
test("published catalog filters future dates, month, group size, price and literal searches", async () => {
  await Tour.create({
    title: "Private Draft",
    slug: "draft",
    durationDays: 3,
    basePrice: 999,
    published: false,
  });
  const past = await Departure.create({
    tour: tour._id,
    startDate: new Date(Date.now() - 864e5),
    seats: 10,
  });
  const list = await request("/tours");
  assert.equal(list.status, 200);
  assert.equal(list.data.tours.length, 1);
  assert.equal(list.data.tours[0].departures.length, 1);
  assert.equal(list.data.tours[0].nextDeparture._id, String(departure._id));
  assert.equal((await request("/tours?guests=5")).data.tours.length, 0);
  assert.equal((await request("/tours?month=2020-01")).data.tours.length, 0);
  assert.equal((await request("/tours?q=%5B")).status, 200);
  assert.equal((await request("/tours?month=bad")).status, 400);
  assert.equal((await request("/tours/draft")).status, 404);
  assert.equal(
    (
      await request("/bookings", {
        method: "POST",
        body: payload({ departureId: String(past._id) }),
      })
    ).status,
    400,
  );
});
test("requests are pending, total is server-calculated and retries do not duplicate", async () => {
  const body = payload({ total: 1, status: "confirmed" });
  const first = await request("/bookings", {
    method: "POST",
    token: customer,
    body,
  });
  assert.equal(first.status, 201);
  assert.equal(first.data.booking.status, "pending");
  assert.equal(first.data.booking.total, 2500);
  assert.equal(first.data.booking.paidAt, null);
  assert.equal(first.data.booking.trackingHash, undefined);
  assert.equal(first.data.booking.requestKey, undefined);
  const retry = await request("/bookings", {
    method: "POST",
    token: customer,
    body,
  });
  assert.equal(retry.status, 200);
  assert.equal(retry.data.booking._id, first.data.booking._id);
  assert.equal((await Departure.findById(departure._id)).bookedCount, 0);
});
test("a receipt belongs only to its user, staff or the holder of its access token", async () => {
  const body = payload({ email: "guest@test.example" });
  const { data } = await request("/bookings", { method: "POST", body });
  const id = data.booking._id;
  assert.equal((await request("/bookings/" + id)).status, 401);
  assert.equal(
    (await request("/bookings/" + id, { token: other })).status,
    401,
  );
  assert.equal(
    (await request("/bookings/" + id, { access: body.trackingToken })).status,
    200,
  );
  assert.equal(
    (await request("/bookings/" + id, { token: admin })).status,
    200,
  );
  const sameEmail = (
    await request("/auth/register", {
      method: "POST",
      body: {
        name: "Same Email",
        email: "guest@test.example",
        password: "TestPassword123!",
      },
    })
  ).data.token;
  assert.equal(
    (await request("/bookings/" + id, { token: sameEmail })).status,
    401,
  );
  assert.equal(
    (await request("/bookings/me", { token: sameEmail })).data.bookings.length,
    0,
  );
});
test("invalid traveller counts, identifiers and unpublished departures are rejected", async () => {
  for (const partySize of [0, 1.5, -2, 31])
    assert.equal(
      (
        await request("/bookings", {
          method: "POST",
          body: payload({ partySize }),
        })
      ).status,
      400,
    );
  assert.equal(
    (
      await request("/bookings", {
        method: "POST",
        body: payload({ departureId: "invalid" }),
      })
    ).status,
    400,
  );
  const draft = await Tour.findOne({ slug: "draft" });
  const dep = await Departure.create({
    tour: draft._id,
    startDate: new Date(Date.now() + 864e5),
    seats: 10,
  });
  assert.equal(
    (
      await request("/bookings", {
        method: "POST",
        body: payload({ departureId: String(dep._id) }),
      })
    ).status,
    400,
  );
});
test("concurrent confirmations cannot oversell the last seats", async () => {
  const dep = await Departure.create({
    tour: tour._id,
    startDate: new Date(Date.now() + 40 * 864e5),
    seats: 3,
  });
  const a = (
    await request("/bookings", {
      method: "POST",
      body: payload({ departureId: String(dep._id) }),
    })
  ).data.booking;
  const b = (
    await request("/bookings", {
      method: "POST",
      body: payload({ departureId: String(dep._id) }),
    })
  ).data.booking;
  const results = await Promise.all(
    [a, b].map((booking) =>
      request("/bookings/" + booking._id + "/status", {
        method: "PATCH",
        token: admin,
        body: { status: "confirmed" },
      }),
    ),
  );
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  assert.equal((await Departure.findById(dep._id)).bookedCount, 2);
  assert.equal(
    await Booking.countDocuments({ departure: dep._id, status: "confirmed" }),
    1,
  );
});
test("repeat confirmations are idempotent and moving to pending releases capacity", async () => {
  const dep = await Departure.create({
    tour: tour._id,
    startDate: new Date(Date.now() + 41 * 864e5),
    seats: 2,
  });
  const booking = (
    await request("/bookings", {
      method: "POST",
      body: payload({ departureId: String(dep._id) }),
    })
  ).data.booking;
  const path = "/bookings/" + booking._id + "/status";
  const updates = await Promise.all(
    [1, 2].map(() =>
      request(path, {
        method: "PATCH",
        token: admin,
        body: { status: "confirmed" },
      }),
    ),
  );
  assert.ok(updates.every((r) => r.status === 200));
  assert.equal((await Departure.findById(dep._id)).bookedCount, 2);
  assert.equal(
    (
      await request(path, {
        method: "PATCH",
        token: admin,
        body: { status: "pending" },
      })
    ).status,
    200,
  );
  const updated = await Departure.findById(dep._id);
  assert.equal(updated.bookedCount, 0);
  assert.equal(updated.status, "open");
});
test("full departures create waitlists and customers can cancel their pending request", async () => {
  const dep = await Departure.create({
    tour: tour._id,
    startDate: new Date(Date.now() + 42 * 864e5),
    seats: 1,
    bookedCount: 1,
    status: "full",
  });
  const body = payload({ departureId: String(dep._id) });
  const booking = (await request("/bookings", { method: "POST", body })).data
    .booking;
  assert.equal(booking.status, "waitlist");
  assert.equal(
    (
      await request("/bookings/" + booking._id + "/cancel", {
        method: "POST",
        token: other,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/bookings/" + booking._id + "/cancel", {
        method: "POST",
        access: body.trackingToken,
      })
    ).data.booking.status,
    "cancelled",
  );
  assert.equal(
    (
      await request("/bookings/" + booking._id + "/status", {
        method: "PATCH",
        token: admin,
        body: { status: "confirmed" },
      })
    ).status,
    409,
  );
});
test("payment shortcuts are unavailable", async () => {
  const booking = await Booking.findOne();
  for (const path of ["checkout", "confirm-dev"])
    assert.equal(
      (
        await request("/bookings/" + booking._id + "/" + path, {
          method: "POST",
          token: admin,
        })
      ).status,
      404,
    );
});
test("enquiries and newsletter subscriptions persist and staff can manage them", async () => {
  const enquiry = await request("/enquiries", {
    method: "POST",
    body: {
      name: "Enquiry Test",
      email: "hello@test.example",
      message: "We would like a family trip.",
    },
  });
  assert.equal(enquiry.status, 201);
  assert.equal(
    (
      await request("/enquiries/" + enquiry.data.id, {
        method: "PATCH",
        token: admin,
        body: { status: "in_progress" },
      })
    ).status,
    200,
  );
  assert.equal((await Enquiry.findById(enquiry.data.id)).status, "in_progress");
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await request("/newsletter", {
          method: "POST",
          body: { email: "SUBSCRIBE@test.example" },
        })
      ).status,
      200,
    );
  assert.equal(
    await Subscriber.countDocuments({ email: "subscribe@test.example" }),
    1,
  );
  assert.equal((await request("/newsletter", { token: customer })).status, 403);
});
test("staff can create and edit inventory and capacity cannot drop below booked seats", async () => {
  const added = await request("/tours", {
    method: "POST",
    token: admin,
    body: {
      title: "New Journey",
      durationDays: 5,
      basePrice: 700,
      region: "Asia",
      published: true,
    },
  });
  assert.equal(added.status, 201);
  const created = await request("/departures", {
    method: "POST",
    token: admin,
    body: {
      tour: added.data.tour._id,
      startDate: new Date(Date.now() + 50 * 864e5).toISOString(),
      seats: 5,
    },
  });
  assert.equal(created.status, 201);
  await Departure.updateOne(
    { _id: created.data.departure._id },
    { $set: { bookedCount: 3 } },
  );
  assert.equal(
    (
      await request("/departures/" + created.data.departure._id, {
        method: "PATCH",
        token: admin,
        body: { seats: 2 },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await request("/tours/" + added.data.tour._id, {
        method: "PATCH",
        token: admin,
        body: { basePrice: 800 },
      })
    ).data.tour.basePrice,
    800,
  );
  assert.equal(
    (
      await request("/departures", {
        method: "POST",
        token: admin,
        body: { tour: added.data.tour._id, startDate: "invalid", seats: 5 },
      })
    ).status,
    400,
  );
});
test("staff CRUD, analytics and settings remain accessible", async () => {
  for (const [path, body, key] of [
    [
      "/guests",
      { name: "Staff Guest", email: "staffguest@test.example" },
      "guest",
    ],
    [
      "/guides",
      {
        name: "Local Guide",
        languages: ["English"],
        email: "guide@test.example",
      },
      "guide",
    ],
    [
      "/suppliers",
      { vendor: "Local Hotel", type: "Hotels", status: "Active" },
      "supplier",
    ],
  ]) {
    const created = await request(path, { method: "POST", token: admin, body });
    assert.equal(created.status, 201);
    const id = created.data[key]._id;
    const update = await request(path + "/" + id, {
      method: "PATCH",
      token: admin,
      body:
        path === "/guests"
          ? { notes: "Updated" }
          : path === "/guides"
            ? { region: "Europe" }
            : { action: "Check availability" },
    });
    assert.equal(update.status, 200);
    assert.equal((await request(path, { token: admin })).status, 200);
  }
  const analytics = await request("/analytics/overview", { token: admin });
  assert.equal(analytics.status, 200);
  assert.equal(analytics.data.revenueByMonth.length, 6);
  assert.deepEqual(
    analytics.data.pipeline.map((row) => row.status),
    ["pending", "waitlist", "confirmed", "cancelled"],
  );
  assert.equal(
    analytics.data.pipeline.reduce((sum, row) => sum + row.count, 0),
    await Booking.countDocuments(),
  );
  assert.ok(
    analytics.data.leadSources.every((row) => Number.isInteger(row.count)),
  );
  assert.equal(
    (await request("/settings", { token: admin })).data.settings.bookingMode,
    "request",
  );
});

test("only administrators manage the team and staff permissions are enforced", async () => {
  const staffLogin = { email: "desk@test.example", password: "DeskPassword1!" };
  // Customers cannot reach team management or settings.
  assert.equal((await request("/team", { token: customer })).status, 403);
  assert.equal((await request("/settings", { token: customer })).status, 403);

  const created = await request("/team", {
    method: "POST",
    token: admin,
    body: {
      name: "Front Desk",
      ...staffLogin,
      role: "staff",
      permissions: ["bookings", "enquiries"],
    },
  });
  assert.equal(created.status, 201);
  const member = created.data.member;
  assert.deepEqual(member.permissions, ["bookings", "enquiries"]);
  assert.equal(
    (
      await request("/team", {
        method: "POST",
        token: admin,
        body: { name: "Duplicate", ...staffLogin, permissions: [] },
      })
    ).status,
    409,
  );

  const login = await request("/auth/login", {
    method: "POST",
    body: staffLogin,
  });
  assert.equal(login.status, 200);
  const desk = login.data.token;
  assert.deepEqual(login.data.user.permissions, ["bookings", "enquiries"]);
  assert.equal((await request("/bookings", { token: desk })).status, 200);
  assert.equal((await request("/enquiries", { token: desk })).status, 200);
  for (const path of ["/guests", "/suppliers", "/analytics/overview"])
    assert.equal((await request(path, { token: desk })).status, 403, path);
  assert.equal(
    (
      await request("/tours", {
        method: "POST",
        token: desk,
        body: { title: "Not allowed", region: "Europe", basePrice: 100 },
      })
    ).status,
    403,
  );
  // Staff cannot manage the team or create other staff.
  assert.equal((await request("/team", { token: desk })).status, 403);
  assert.equal(
    (
      await request("/team", {
        method: "POST",
        token: desk,
        body: {
          name: "Sneaky",
          email: "sneaky@test.example",
          password: "Sneaky12345!",
        },
      })
    ).status,
    403,
  );

  // Granting a permission takes effect on the next request.
  const granted = await request("/team/" + member.id, {
    method: "PATCH",
    token: admin,
    body: { permissions: ["bookings", "enquiries", "guests"] },
  });
  assert.equal(granted.status, 200);
  assert.equal((await request("/guests", { token: desk })).status, 200);

  // Staff can change their own password; the old one stops working.
  assert.equal(
    (
      await request("/auth/password", {
        method: "POST",
        token: desk,
        body: { currentPassword: "wrong", newPassword: "NewDesk12345!" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/auth/password", {
        method: "POST",
        token: desk,
        body: {
          currentPassword: staffLogin.password,
          newPassword: "NewDesk12345!",
        },
      })
    ).status,
    200,
  );

  // Deactivation blocks existing sessions and new sign-ins.
  await request("/team/" + member.id, {
    method: "PATCH",
    token: admin,
    body: { active: false },
  });
  assert.equal((await request("/bookings", { token: desk })).status, 401);
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: { email: staffLogin.email, password: "NewDesk12345!" },
      })
    ).status,
    403,
  );

  // An administrator cannot lock themselves out.
  const adminId = (await request("/auth/me", { token: admin })).data.user.id;
  for (const body of [{ active: false }, { role: "staff" }])
    assert.equal(
      (
        await request("/team/" + adminId, {
          method: "PATCH",
          token: admin,
          body,
        })
      ).status,
      409,
    );
  assert.equal(
    (await request("/team/" + adminId, { method: "DELETE", token: admin }))
      .status,
    409,
  );

  const removed = await request("/team/" + member.id, {
    method: "DELETE",
    token: admin,
  });
  assert.equal(removed.status, 200);
  assert.equal(await User.exists({ email: staffLogin.email }), null);
});

test("guest-to-account linking requires the original receipt token and matching email", async () => {
  const body = payload({ email: "claim@test.example" });
  const created = await request("/bookings", { method: "POST", body });
  const id = created.data.booking._id;
  const account = await request("/auth/register", {
    method: "POST",
    body: {
      name: "Claim Traveller",
      email: body.email,
      password: "TestPassword123!",
    },
  });
  const token = account.data.token;
  assert.equal(
    (await request("/bookings/" + id + "/claim", { method: "POST", token }))
      .status,
    401,
  );
  assert.equal(
    (
      await request("/bookings/" + id + "/claim", {
        method: "POST",
        token: other,
        access: body.trackingToken,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/bookings/" + id + "/claim", {
        method: "POST",
        token,
        access: body.trackingToken,
      })
    ).status,
    200,
  );
  assert.equal((await request("/bookings/" + id, { token })).status, 200);
  assert.ok(
    (await request("/bookings/me", { token })).data.bookings.some(
      (b) => b._id === id,
    ),
  );
});
