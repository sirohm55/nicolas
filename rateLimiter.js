const setRateLimit = require("express-rate-limit");


// Rate limit middleware
const rateLimitMiddleware = setRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: "You have attempted to login too many times\nOnly 5 login attempt allowed per 5 minutes",
  headers: true,
});

module.exports = rateLimitMiddleware;