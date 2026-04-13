const {
  createUser,
  getUserById,
  loginWithGoogleIdToken,
  loginUser,
  updateUserProfile,
} = require("../services/auth.service");

function validateRegisterBody(body) {
  if (!body.name || !body.email || !body.password) {
    const error = new Error("Name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (String(body.password).length < 6) {
    const error = new Error("Password must be at least 6 characters long");
    error.statusCode = 400;
    throw error;
  }
}

function validateRegisterRole(role) {
  const normalizedRole = String(role || "user").trim().toLowerCase();

  if (normalizedRole === "admin") {
    const error = new Error("Admin accounts cannot be self-registered");
    error.statusCode = 403;
    throw error;
  }

  if (!["user", "collector", "recycler"].includes(normalizedRole)) {
    const error = new Error("Invalid role selected for registration");
    error.statusCode = 400;
    throw error;
  }

  return normalizedRole;
}

function validateLoginBody(body) {
  if (!body.email || !body.password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }
}

async function registerController(req, res, next) {
  try {
    validateRegisterBody(req.body);
    const requestedRole = validateRegisterRole(req.body.role);

    const user = await createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: requestedRole,
      organizationName: req.body.organizationName || "",
      serviceArea: req.body.serviceArea || "",
    });

    const loginResult = await loginUser({
      email: req.body.email,
      password: req.body.password,
      expectedRole: requestedRole,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token: loginResult.token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function googleLoginController(req, res, next) {
  try {
    const result = await loginWithGoogleIdToken(req.body?.idToken);

    res.status(200).json({
      success: true,
      message: "Google sign-in successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function loginController(req, res, next) {
  try {
    validateLoginBody(req.body);

    const result = await loginUser({
      email: req.body.email,
      password: req.body.password,
      expectedRole: req.body.role || undefined,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function meController(req, res, next) {
  try {
    const user = await getUserById(req.user.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function updateMeController(req, res, next) {
  try {
    const user = await updateUserProfile(req.user.userId, req.body || {});

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  googleLoginController,
  loginController,
  meController,
  registerController,
  updateMeController,
};
