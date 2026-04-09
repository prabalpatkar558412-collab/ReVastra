const {
  createUser,
  getUserById,
  loginUser,
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

    const user = await createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: "user",
    });

    const loginResult = await loginUser({
      email: req.body.email,
      password: req.body.password,
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

module.exports = {
  loginController,
  meController,
  registerController,
};
