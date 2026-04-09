const express = require("express");
const {
  bucket,
  db,
  firebaseProjectId,
} = require("../config/firebase");

const router = express.Router();

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Firestore check timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

router.get("/", async (_req, res, next) => {
  try {
    let firestoreConnected = false;
    let collectionCount = null;
    let firestoreError = null;

    try {
      const collections = await withTimeout(db.listCollections(), 3000);
      firestoreConnected = true;
      collectionCount = collections.length;
    } catch (error) {
      firestoreError = error.message;
    }

    res.status(200).json({
      success: true,
      message: "Backend health check completed",
      data: {
        status: "ok",
        firebaseProjectId,
        firestoreConnected,
        storageBucket: bucket.name,
        collectionCount,
        firestoreError,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
