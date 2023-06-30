const rateLimit = require("express-rate-limit");
import { NextFunction } from "express";
import { ErrorHandler } from "./classes";

const loginRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes in milliseconds
  max: 3,
  message:
    "Login error, you have reached the maximum number of retries. Please try again after 30 minutes.",
  statusCode: 429,
});
const globalRateLimiter = rateLimit({
  windowMs: 4 * 60 * 60 * 1000, // 30 minutes in milliseconds
  max: 200,
  message:
    "Login error, you have reached the maximum number of retries. Please try again after 30 minutes.",
  statusCode: 429,
});

const gapBetweenReq = (prop: Date, next:NextFunction) => {
  const currentTimeStamp = Date.now();
  const tokenExpiresAt = new Date(prop).getTime();

  const timeElapsed = tokenExpiresAt - (currentTimeStamp + 3.5 * 60 * 1000);
  if (timeElapsed > 0) {
    return next(
      new ErrorHandler(
        `Please wait ${timeElapsed / 1000} seconds before resending the link again.`,
        429
      )
    );
  }
};

export { loginRateLimiter, globalRateLimiter, gapBetweenReq };
