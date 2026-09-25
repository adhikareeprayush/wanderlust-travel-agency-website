// Creates the first administrator, or makes an existing account an active
// administrator with a new password. Works in production.
//
//   node server/scripts/create-admin.js you@example.com "Your Name"
//
// The password is read from ADMIN_PASSWORD, or asked for interactively.
import readline from "node:readline";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";

const [emailArg, ...nameParts] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
const name = nameParts.join(" ").trim();

function askHidden(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  // Echo nothing while the password is typed.
  rl._writeToOutput = () => {};
  process.stdout.write(question);
  return new Promise((resolve) =>
    rl.question("", (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    }),
  );
}

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(
    'Usage: node server/scripts/create-admin.js you@example.com "Your Name"',
  );
  process.exit(1);
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await askHidden("Password (at least 12 characters): ");
  if (password !== (await askHidden("Repeat password: "))) {
    console.error("The passwords do not match.");
    process.exit(1);
  }
}
if (password.length < 12 || password.length > 128) {
  console.error("Use a password between 12 and 128 characters.");
  process.exit(1);
}

try {
  await connectDb();
  const passwordHash = await User.hashPassword(password);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.active = true;
    existing.passwordHash = passwordHash;
    if (name) existing.name = name;
    await existing.save();
    console.log(`${email} is now an active administrator with the new password.`);
  } else {
    await User.create({
      email,
      name: name || "Administrator",
      role: "admin",
      passwordHash,
    });
    console.log(`Administrator ${email} created. Sign in at /login.`);
  }
} finally {
  await mongoose.disconnect();
}
