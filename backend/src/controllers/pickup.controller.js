const { createPickupRequest } = require("../services/pickup.service");

function validatePickupPayload(body) {
  const requiredFields = [
    "submissionId",
    "recyclerId",
    "recyclerName",
    "name",
    "address",
    "contact",
    "pickupDate",
    "finalOffer",
  ];

  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    const error = new Error(
      `Missing required fields: ${missingFields.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }
}

async function createPickupRequestController(req, res, next) {
  try {
    validatePickupPayload(req.body);

    const result = await createPickupRequest(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Pickup request created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPickupRequestController,
};
