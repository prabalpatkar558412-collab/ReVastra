const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { admin, db } = require("../config/firebase");

const usersCollection = db.collection("users");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured in backend/.env");
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
}

function sanitizeUser(user) {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    totalEarnings: user.totalEarnings || 0,
    devicesRecycled: user.devicesRecycled || 0,
    pickupCount: user.pickupCount || 0,
    ewasteSavedKg: user.ewasteSavedKg || 0,
  };
}

async function findUserByEmail(email) {
  const snapshot = await usersCollection.where("email", "==", email).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

async function createUser({ name, email, password, role = "user" }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const userRef = usersCollection.doc();
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = {
    userId: userRef.id,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    createdAt: now,
    updatedAt: now,
    totalEarnings: 0,
    devicesRecycled: 0,
    pickupCount: 0,
    ewasteSavedKg: 0,
  };

  await userRef.set({
    ...user,
    createdAtServer: admin.firestore.FieldValue.serverTimestamp(),
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  return sanitizeUser(user);
}

async function loginUser({ email, password, expectedRole }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (expectedRole && user.role !== expectedRole) {
    const error = new Error(`This account is not allowed to log in as ${expectedRole}`);
    error.statusCode = 403;
    throw error;
  }

  const safeUser = sanitizeUser(user);
  const token = jwt.sign(
    {
      userId: safeUser.userId,
      email: safeUser.email,
      role: safeUser.role,
      name: safeUser.name,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );

  return {
    token,
    user: safeUser,
  };
}

async function getUserById(userId) {
  const doc = await usersCollection.doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  return sanitizeUser(doc.data());
}

async function ensureAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@revastra.com").trim().toLowerCase();
  const adminName = (process.env.ADMIN_NAME || "ReVastra Admin").trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

  const existingUser = await findUserByEmail(adminEmail);

  if (existingUser) {
    if (existingUser.role !== "admin") {
      await usersCollection.doc(existingUser.userId).update({
        role: "admin",
        updatedAt: new Date().toISOString(),
        updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return;
  }

  await createUser({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: "admin",
  });
}

module.exports = {
  createUser,
  ensureAdminUser,
  getUserById,
  loginUser,
};
