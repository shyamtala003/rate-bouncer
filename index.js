const { default: cookieParser } = require("./utils/cookieParser");
const { default: generateUserId } = require("./utils/generateUserId");
const { default: isTerminalRequest } = require("./utils/isTerminalRequest");

const requestStore = new Map();

function rateLimiter({ duration = 10 * 1000, maxRequests = 5 } = {}) {
  return (req, res, next) => {
    const currentTime = Date.now();
    const windowStartTime = currentTime - duration;
    let userKey;

    if (isTerminalRequest(req)) {
      // Terminal users are tracked via IP
      userKey = req.ip || req.connection.remoteAddress;
    } else {
      // Browser users are tracked via cookies
      const cookies = cookieParser(req.headers.cookie);
      if (!cookies.userId) {
        const userId = generateUserId();
        res.setHeader(
          "Set-Cookie",
          `userId=${userId}; Max-Age=86400; Path=/; HttpOnly`
        );
        userKey = userId;
      } else {
        userKey = cookies.userId;
      }
    }

    const route = req.path; // Track per route
    const key = `${userKey}:${route}`;

    if (!requestStore.has(key)) {
      requestStore.set(key, []);
    }

    const timestamps = requestStore.get(key);

    // Remove expired timestamps
    while (timestamps.length > 0 && timestamps[0] < windowStartTime) {
      timestamps.shift();
    }

    // Check if the user has exceeded the rate limit
    if (timestamps.length >= maxRequests) {
      const retryAfterMs = duration - (currentTime - timestamps[0]);
      return res.status(429).json({
        message: "Too many requests",
        retryAfter: Math.abs(retryAfterMs / 1000).toFixed(1) + " seconds",
      });
    }

    timestamps.push(currentTime);
    requestStore.set(key, timestamps);
    next();
  };
}

// Cleanup function to free memory
function cleanupMemory() {
  const currentTime = Date.now();

  requestStore.forEach((timestamps, key) => {
    // Remove old timestamps from each key
    requestStore.set(
      key,
      timestamps.filter((timestamp) => timestamp > currentTime - 60000)
    );

    // If all timestamps are expired, delete the key
    if (requestStore.get(key).length === 0) {
      requestStore.delete(key);
    }
  });
}

// Function to start memory cleanup based on user-defined interval
function startCleanup({ interval = 10000 }) {
  setInterval(cleanupMemory, interval);
}

module.exports = { rateLimiter, startCleanup };
