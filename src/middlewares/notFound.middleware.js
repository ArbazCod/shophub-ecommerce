const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;   // attach status to error
  next(error);
};

export default notFound;