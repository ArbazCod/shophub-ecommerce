import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {

  const statusCode = err.statusCode || 500;

  /* Log error */

  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });

};

export default errorHandler;