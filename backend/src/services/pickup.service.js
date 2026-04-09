const { admin, db } = require("../config/firebase");
const { getUserById } = require("./auth.service");
const { logPickupCreated } = require("./activity.service");
const { recyclers } = require("../data/recyclers");

const pickupRequestsCollection = db.collection("pickupRequests");
const submissionsCollection = db.collection("deviceSubmissions");
const usersCollection = db.collection("users");

async function createPickupRequest(userId, payload) {
  const currentUser = await getUserById(userId);
  const submissionRef = submissionsCollection.doc(payload.submissionId);
  const submissionDoc = await submissionRef.get();

  if (!submissionDoc.exists) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  const submission = submissionDoc.data();
  const matchedRecycler = recyclers.find(
    (recycler) => recycler.id === payload.recyclerId
  );

  if (!matchedRecycler) {
    const error = new Error("Selected recycler is not available");
    error.statusCode = 400;
    throw error;
  }

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
  const rewardPointsEarned = Math.max(10, Math.round(finalOffer / 20));
  const assignedCollectorName =
    process.env.COLLECTOR_NAME || "Local Scrap Network";
  const assignedCollectorPhone =
    process.env.COLLECTOR_PHONE || "+91 98765 22001";
  const assignedCollectorPhoto =
    process.env.COLLECTOR_PHOTO_URL ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80";

  const pickupRequest = {
    pickupId: pickupRef.id,
    submissionId: payload.submissionId,
    userId,
    recyclerId: payload.recyclerId,
    recyclerName: payload.recyclerName,
    recyclerOpsEmail: matchedRecycler.recyclerOpsEmail,
    name: payload.name,
    address: payload.address,
    contact: payload.contact,
    pickupDate: payload.pickupDate,
    finalOffer,
    finalVerifiedValue: finalOffer,
    rewardPointsEarned,
    paymentMethod: currentUser?.preferredPaymentMethod || "UPI",
    pickupAvailable: Boolean(payload.pickup),
    status: "pending",
    assignedCollectorName,
    assignedCollectorEmail:
      process.env.COLLECTOR_EMAIL || "collector@revastra.com",
    assignedCollectorPhone,
    assignedCollectorPhoto,
    collectorStatus: "assigned",
    recyclerStatus: "awaiting_device",
    paymentStatus: "pending",
    processingMethod: null,
    collectorNotes: "",
    recyclerNotes: "",
    dropCenter: matchedRecycler.dropCenter,
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
    selectedRecyclerName: payload.recyclerName,
    pickupRequestId: pickupRef.id,
    status: "pickup_requested",
    assignedCollectorName: pickupRequest.assignedCollectorName,
    assignedCollectorEmail: pickupRequest.assignedCollectorEmail,
    collectorStatus: pickupRequest.collectorStatus,
    recyclerStatus: pickupRequest.recyclerStatus,
    paymentStatus: pickupRequest.paymentStatus,
    finalVerifiedValue: pickupRequest.finalVerifiedValue,
    updatedAt: now,
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.update(usersCollection.doc(userId), {
    pickupCount: admin.firestore.FieldValue.increment(1),
    totalEarnings: admin.firestore.FieldValue.increment(finalOffer),
    devicesRecycled: admin.firestore.FieldValue.increment(1),
    ewasteSavedKg: admin.firestore.FieldValue.increment(ewasteSavedKg),
    rewardPoints: admin.firestore.FieldValue.increment(rewardPointsEarned),
    updatedAt: now,
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  await logPickupCreated({
    userId,
    pickupRequest,
  });

  const updatedUser = await getUserById(userId);

  return {
    pickupRequest,
    user: updatedUser,
  };
}

module.exports = {
  createPickupRequest,
};
