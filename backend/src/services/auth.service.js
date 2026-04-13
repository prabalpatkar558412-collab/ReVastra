const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { admin, auth, db } = require("../config/firebase");
const { recyclers } = require("../data/recyclers");

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
    authProvider: user.authProvider || "password",
    organizationName: user.organizationName || "",
    serviceArea: user.serviceArea || "",
    managedRecyclerId: user.managedRecyclerId || "",
    photoURL: user.photoURL || "",
    phone: user.phone || "",
    address: user.address || "",
    preferredPaymentMethod: user.preferredPaymentMethod || "UPI",
    upiId: user.upiId || "",
    bankAccount: user.bankAccount || "",
    rewardPoints: user.rewardPoints || 0,
    notificationPreferences: {
      sms: user.notificationPreferences?.sms ?? true,
      email: user.notificationPreferences?.email ?? true,
      app: user.notificationPreferences?.app ?? true,
    },
    createdAt: user.createdAt,
    totalEarnings: user.totalEarnings || 0,
    devicesRecycled: user.devicesRecycled || 0,
    pickupCount: user.pickupCount || 0,
    ewasteSavedKg: user.ewasteSavedKg || 0,
  };
}

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function findManagedRecyclerId({
  managedRecyclerId = "",
  organizationName = "",
  email = "",
}) {
  const directId = normalizeValue(managedRecyclerId);

  if (directId) {
    return directId;
  }

  const normalizedOrg = normalizeValue(organizationName);
  const normalizedEmail = normalizeValue(email);

  const matchedRecycler = recyclers.find((recycler) => {
    return (
      normalizeValue(recycler.id) === normalizedOrg ||
      normalizeValue(recycler.name) === normalizedOrg ||
      normalizeValue(recycler.recyclerOpsEmail) === normalizedEmail
    );
  });

  return matchedRecycler?.id || "";
}

async function findUserByEmail(email) {
  const snapshot = await usersCollection.where("email", "==", email).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

async function createUser({
  name,
  email,
  password,
  role = "user",
  authProvider = "password",
  organizationName = "",
  serviceArea = "",
  managedRecyclerId = "",
  phone = "",
  address = "",
  preferredPaymentMethod = "UPI",
  upiId = "",
  bankAccount = "",
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const userRef = usersCollection.doc();
  const now = new Date().toISOString();
  const passwordHash =
    authProvider === "password" ? await bcrypt.hash(password, 12) : null;
  const resolvedManagedRecyclerId =
    role === "recycler"
      ? findManagedRecyclerId({
          managedRecyclerId,
          organizationName,
          email: normalizedEmail,
        })
      : managedRecyclerId.trim();

  const user = {
    userId: userRef.id,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    authProvider,
    organizationName: organizationName.trim(),
    serviceArea: serviceArea.trim(),
    managedRecyclerId: resolvedManagedRecyclerId,
    phone: phone.trim(),
    address: address.trim(),
    preferredPaymentMethod: preferredPaymentMethod.trim() || "UPI",
    upiId: upiId.trim(),
    bankAccount: bankAccount.trim(),
    photoURL: "",
    rewardPoints: 0,
    notificationPreferences: {
      sms: true,
      email: true,
      app: true,
    },
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

function signAuthToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

async function loginUser({ email, password, expectedRole }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid =
    Boolean(user.passwordHash) && (await bcrypt.compare(password, user.passwordHash));

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
  const token = signAuthToken(safeUser);

  return {
    token,
    user: safeUser,
  };
}

async function loginWithGoogleIdToken(idToken) {
  if (!idToken) {
    const error = new Error("Google identity token is required");
    error.statusCode = 400;
    throw error;
  }

  let decodedToken;

  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch {
    const error = new Error("Unable to verify Google sign-in");
    error.statusCode = 401;
    throw error;
  }

  const normalizedEmail = String(decodedToken.email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    const error = new Error("Google account email is required");
    error.statusCode = 400;
    throw error;
  }

  let user = await findUserByEmail(normalizedEmail);

  if (user && user.role !== "user") {
    const error = new Error(
      "This Google account is already linked to a non-consumer role"
    );
    error.statusCode = 403;
    throw error;
  }

  if (!user) {
    const userRef = usersCollection.doc();
    const now = new Date().toISOString();

    user = {
      userId: userRef.id,
      name: String(decodedToken.name || normalizedEmail.split("@")[0]).trim(),
      email: normalizedEmail,
      passwordHash: null,
      role: "user",
      authProvider: "google",
      organizationName: "",
      serviceArea: "",
      managedRecyclerId: "",
      phone: "",
      address: "",
      preferredPaymentMethod: "UPI",
      upiId: "",
      bankAccount: "",
      photoURL: String(decodedToken.picture || "").trim(),
      rewardPoints: 0,
      notificationPreferences: {
        sms: true,
        email: true,
        app: true,
      },
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
  } else if (user.authProvider !== "google" || !user.photoURL) {
    await usersCollection.doc(user.userId).update({
      authProvider: "google",
      photoURL: String(decodedToken.picture || user.photoURL || "").trim(),
      updatedAt: new Date().toISOString(),
      updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
    });

    const refreshedUser = await usersCollection.doc(user.userId).get();
    user = refreshedUser.data();
  }

  const safeUser = sanitizeUser(user);

  return {
    token: signAuthToken(safeUser),
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

async function updateUserProfile(userId, payload) {
  const userRef = usersCollection.doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date().toISOString();
  const nextNotificationPreferences = {
    sms: payload.notificationPreferences?.sms ?? userDoc.data().notificationPreferences?.sms ?? true,
    email:
      payload.notificationPreferences?.email ??
      userDoc.data().notificationPreferences?.email ??
      true,
    app: payload.notificationPreferences?.app ?? userDoc.data().notificationPreferences?.app ?? true,
  };

  await userRef.update({
    name: payload.name?.trim() ?? userDoc.data().name,
    phone: payload.phone?.trim() ?? userDoc.data().phone ?? "",
    address: payload.address?.trim() ?? userDoc.data().address ?? "",
    preferredPaymentMethod:
      payload.preferredPaymentMethod?.trim() ??
      userDoc.data().preferredPaymentMethod ??
      "UPI",
    upiId: payload.upiId?.trim() ?? userDoc.data().upiId ?? "",
    bankAccount: payload.bankAccount?.trim() ?? userDoc.data().bankAccount ?? "",
    notificationPreferences: nextNotificationPreferences,
    updatedAt: now,
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await userRef.get();
  return sanitizeUser(updatedDoc.data());
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

async function ensurePartnerUsers() {
  const collectorEmail = (
    process.env.COLLECTOR_EMAIL || "collector@revastra.com"
  )
    .trim()
    .toLowerCase();
  const collectorName = (
    process.env.COLLECTOR_NAME || "Local Scrap Network"
  ).trim();
  const collectorPassword =
    process.env.COLLECTOR_PASSWORD || "Collector@123";

  const collectorUser = await findUserByEmail(collectorEmail);
  const collectorPasswordHash = await bcrypt.hash(collectorPassword, 12);

  if (!collectorUser) {
    await createUser({
      name: collectorName,
      email: collectorEmail,
      password: collectorPassword,
      role: "collector",
      organizationName: "Local Scrap Partner Network",
      serviceArea: "Central India",
    });
  } else {
    await usersCollection.doc(collectorUser.userId).update({
      name: collectorName,
      role: "collector",
      organizationName: "Local Scrap Partner Network",
      serviceArea: "Central India",
      managedRecyclerId: "",
      passwordHash: collectorPasswordHash,
      updatedAt: new Date().toISOString(),
      updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  for (const recycler of recyclers) {
    const existingRecyclerUser = await findUserByEmail(recycler.recyclerOpsEmail);
    const recyclerPasswordHash = await bcrypt.hash(
      process.env.RECYCLER_PASSWORD || "Recycler@123",
      12
    );

    if (!existingRecyclerUser) {
      await createUser({
        name: recycler.recyclerOpsName,
        email: recycler.recyclerOpsEmail,
        password: process.env.RECYCLER_PASSWORD || "Recycler@123",
        role: "recycler",
        organizationName: recycler.name,
        serviceArea: recycler.location,
        managedRecyclerId: recycler.id,
      });
    } else {
      await usersCollection.doc(existingRecyclerUser.userId).update({
        name: recycler.recyclerOpsName,
        role: "recycler",
        organizationName: recycler.name,
        serviceArea: recycler.location,
        managedRecyclerId: recycler.id,
        passwordHash: recyclerPasswordHash,
        updatedAt: new Date().toISOString(),
        updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
}

module.exports = {
  createUser,
  ensureAdminUser,
  ensurePartnerUsers,
  getUserById,
  loginWithGoogleIdToken,
  loginUser,
  updateUserProfile,
};
