const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");

const registerUser = asyncHandler(async (req, res) => {
    const user = await authService.registerUser(req.body);
    sendSuccess(res, "User registered successfully", user, 201);
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    sendSuccess(res, "Login successful", user);
});

const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user.id);
    sendSuccess(res, "User profile fetched", user);
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
