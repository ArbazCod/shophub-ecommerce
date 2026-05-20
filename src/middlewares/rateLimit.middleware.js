import rateLimit from "express-rate-limit";

/* Global API limiter */

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
});


/* Strict limiter for authentication */

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});