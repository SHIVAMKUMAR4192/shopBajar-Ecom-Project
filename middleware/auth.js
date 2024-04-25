const User = require('../models/user');
const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');

// IsAuthenticatedUser middleware
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    // Check for token in the Authorization header or cookies
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // If no token is found, return an error
    if (!token) {
        return next(new ErrorHandler('User not authenticated', 401));
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user from the database
        const user = await User.findById(decoded.id);

        // If the user does not exist, return an error
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        // Attach the authenticated user to the request object
        req.user = user;

        // Proceed to the next middleware/controller
        next();
    } catch (error) {
        // Handle errors (e.g., invalid or expired token)
        return next(new ErrorHandler('User not authenticated', 401));
    }
});

// authorizeRoles middleware
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log('User Role:', req.user.role);
        console.log('Allowed Roles:', roles);
        // Check if the user's role is one of the authorized roles
        if (roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403));
        }
        // Proceed to the next middleware/controller
        next();
    };
};

