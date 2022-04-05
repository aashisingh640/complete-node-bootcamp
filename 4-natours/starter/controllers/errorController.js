function errorHandler (err, req, res, next) {
    err.success = err.success || 'false';
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
        success: err.success,
        message: err.message
    })
}

module.exports = errorHandler;