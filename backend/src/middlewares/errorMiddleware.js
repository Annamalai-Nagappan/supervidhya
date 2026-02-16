const { sendError } = require("../utils/responseHandler");

const errorHandler = (err, req, res, next) => {
    // Log error for developers
    console.error(`Error: ${err.message}`);

    // Determine status code
    let statusCode = 500;

    // Handle specific error messages thrown by services
    const clientErrors = ["User already exists", "Institution not found", "Institution is inactive", "Invalid credentials"];
    if (clientErrors.includes(err.message)) {
        statusCode = 400;
        if (err.message === "Invalid credentials") statusCode = 401;
    }

    sendError(res, err.message || "Internal Server Error", statusCode);
};

module.exports = errorHandler;
