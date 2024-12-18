// In-memory store to track requests
const requestStore = {};

// Middleware Function
function rateLimiter({ duration, maxRequests }) {
  return (req, res, next) => {
    const currentTime = Date.now();
    const windowStartTime = currentTime - duration;

    let forwardedIps = req.headers["x-forwarded-for"]?.split(",");
    let clientIp = forwardedIps
      ? forwardedIps[0]
      : req.connection.remoteAddress;
    if (clientIp === "::1") {
      clientIp = "127.0.0.1";
    }

    const key = `${clientIp}:${req.path}`;

    if (!requestStore[key]) {
      requestStore[key] = [];
    }

    // Filter timestamps within the current window
    requestStore[key] = requestStore[key].filter(
      (timestamp) => timestamp > windowStartTime
    );

    // Check if the number of requests exceeds the limit
    if (requestStore[key].length >= maxRequests) {
      const firstRequestTime = requestStore[key][0];
      const retryAfterMs = duration - (currentTime - firstRequestTime);

      return res.status(429).json({
        message: "Too many requests",
        retryAfter: retryAfterMs,
        timeUnit: "microseconds",
      });
    }

    // Log the current request timestamp
    requestStore[key].push(currentTime);

    // Move to the next middleware or route handler
    next();
  };
}

module.exports = rateLimiter;
