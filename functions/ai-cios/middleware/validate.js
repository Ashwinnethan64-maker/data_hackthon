const { AppError } = require('./errorHandler');

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.name === 'ZodError' || error.issues || error.errors) {
      const issues = error.issues || error.errors || [];
      const issueMessages = issues.map((e) => `${(e.path || []).join('.')}: ${e.message}`).join(', ') || error.message;
      return next(new AppError(`Validation Error: ${issueMessages}`, 400));
    }
    next(error);
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error.name === 'ZodError' || error.issues || error.errors) {
      const issues = error.issues || error.errors || [];
      const issueMessages = issues.map((e) => `${(e.path || []).join('.')}: ${e.message}`).join(', ') || error.message;
      return next(new AppError(`Validation Error in Query: ${issueMessages}`, 400));
    }
    next(error);
  }
};

module.exports = {
  validateBody,
  validateQuery,
};
