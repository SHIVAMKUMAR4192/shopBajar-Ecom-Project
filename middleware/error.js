const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    console.error(err);

    // Handle duplicate key errors
    if (err.code === 11000 && err.keyValue) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        console.error(message);
        err = new ErrorHandler(message, 400);
    }

    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'JSON Web Token is invalid';
        err = new ErrorHandler(message, 400);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'JSON Web Token is expired';
        err = new ErrorHandler(message, 400);
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        err = new ErrorHandler(message, 400);
    }

    // Send appropriate response based on environment
    if (process.env.NODE_ENV === 'DEVELOPMENT') {
        return res.status(err.statusCode).json({
            success: false,
            error: err,
            errorMessage: err.message,
            stack: err.stack
        });
    }

    if (process.env.NODE_ENV === 'PRODUCTION') {
        const error = { ...err }; // Create a copy of the error object
        error.message = err.message || 'Internal Server Error';

        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    // If environment is not set, return a generic error response
    res.status(err.statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};
