const { admin, db } = require("../config/firebase");
const { getUserById } = require("./auth.service");

const pickupRequestsCollection = db.collection("pickupRequests");
const submissionsCollection = db.collection("deviceSubmissions");
const usersCollection = db.collection("users");

async function createPickupRequest(userId, payload) {
  const submissionRef = submissionsCollection.doc(payload.submissionId);
  const submissionDoc = await submissionRef.get();

  if (!submissionDoc.exists) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  const submission = submissionDoc.data();

  if (!Number.isFinite(submission.estimatedValue)) {
    const error = new Error(
      "Please generate the estimate before creating a pickup request"
    );
    error.statusCode = 400;
    throw error;
  }

  if (submission.userId && submission.userId !== userId) {
    const error = new Error("This submission belongs to another user");
    error.statusCode = 403;
    throw error;
  }

  const existingPickupSnapshot = await pickupRequestsCollection
    .where("submissionId", "==", payload.submissionId)
    .limit(1)
    .get();

  if (!existingPickupSnapshot.empty) {
    const error = new Error("A pickup request already exists for this submission");
    error.statusCode = 409;
    throw error;
  }

  const pickupRef = pickupRequestsCollection.doc();
  const now = new Date().toISOString();
  const finalOffer = Number(payload.finalOffer);
  const ewasteSavedKg = Number(submission.impact?.ewasteSavedKg || 0);

  const pickupRequest = {
    pickupId: pickupRef.id,
    submissionId: payload.submissionId,
    userId,
    recyclerId: payload.recyclerId,
    recyclerName: payload.recyclerName,
    name: payload.name,
    address: payload.address,
    contact: payload.contact,
    pickupDate: payload.pickupDate,
    finalOffer,
    pickupAvailable: Boolean(payload.pickup),
    status: "pending",
    deviceType: submission.deviceType,
    brand: submission.brand,
    model: submission.model,
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();

  batch.set(pickupRef, {
    ...pickupRequest,
    createdAtServer: admin.firestore.FieldValue.serverTimestamp(),
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.update(submissionRef, {
    userId,
    selectedRecyclerId: payload.recyclerId,
    pickupRequestId: pickupRef.id,
    status: "pickup_requested",
    updatedAt: now,
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.update(usersCollection.doc(userId), {
    pickupCount: admin.firestore.FieldValue.increment(1),
    totalEarnings: admin.firestore.FieldValue.increment(finalOffer),
    devicesRecycled: admin.firestore.FieldValue.increment(1),
    ewasteSavedKg: admin.firestore.FieldValue.increment(ewasteSavedKg),
    updatedAt: now,
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  const updatedUser = await getUserById(userId);

  return {
    pickupRequest,
    user: updatedUser,
  };
}

module.exports = {
  createPickupRequest,
};
