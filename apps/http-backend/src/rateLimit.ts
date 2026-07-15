import { rateLimit } from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    // Message ko JSON object rakha hai taaki frontend ka res.json() fail na ho
    message: {
        message: "Too many login attempts, try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message: {
        message: "Too many attempts, please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false,
});