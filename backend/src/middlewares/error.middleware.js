const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    console.error("ERROR:", err);
    console.error("STACK:", err.stack);

    res.status(statusCode).json({
        success: false,
        message: err.isOperational
            ? err.message
            : "Internal server error"
    });

};

export default errorHandler;