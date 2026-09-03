class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err.message || err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        error: err.message,
        message: err.message,
      });
    } else {
      console.error('ERROR 💥:', err);
      res.status(500).json({
        status: 'error',
        error: 'Something went wrong on the server',
        message: 'Something went wrong on the server',
      });
    }
  }
};

module.exports = {
  AppError,
  errorHandler,
};
