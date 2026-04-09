const fs = require("node:fs");
const path = require("node:path");
const admin = require("firebase-admin");

const defaultServiceAccountPath = path.resolve(
  __dirname,
  "../../firebase_key.json"
);

const configuredServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : defaultServiceAccountPath;

if (!fs.existsSync(configuredServiceAccountPath)) {
  throw new Error(
    `Firebase service account file not found at ${configuredServiceAccountPath}`
  );
}

const serviceAccount = require(configuredServiceAccountPath);
const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  `${serviceAccount.project_id}.firebasestorage.app`;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });
}

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = {
  admin,
  auth,
  bucket,
  db,
  firebaseProjectId: serviceAccount.project_id,
  storageBucket,
};
