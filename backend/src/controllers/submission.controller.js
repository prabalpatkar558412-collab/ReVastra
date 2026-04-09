const { createSubmission } = require("../services/submission.service");

function validateSubmissionPayload(body) {
  const requiredFields = [
    "deviceType",
    "brand",
    "model",
    "age",
    "condition",
    "working",
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

async function createSubmissionController(req, res, next) {
  try {
    validateSubmissionPayload(req.body);

    if (!req.file) {
      const error = new Error(
        "Please upload a clear image of the electronic device"
      );
      error.statusCode = 400;
      throw error;
    }

    const submission = await createSubmission(req.body, req.file);

    res.status(201).json({
      success: true,
      message: "Submission created successfully",
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSubmissionController,
};
