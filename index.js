const { default: cookieParser } = require("./utils/cookieParser");
const { default: generateUserId } = require("./utils/generateUserId");
const { default: isTerminalRequest } = require("./utils/isTerminalRequest");

const requestStore = new Map();
let cleanupIntervalId = null;
let globalConfig = {
  duration: 10 * 1000,
  maxRequests: 5,
  disabled: false,
  startCleanupInterval: 10000,
};

function rateLimiter({ duration, maxRequests, disabled }) {
  return (req, res, next) => {
    if (disabled) {
      return next();
    }

    const currentTime = Date.now();
    const windowStartTime = currentTime - duration;
    let userKey;

    if (isTerminalRequest(req)) {
      userKey = req.ip || req.connection.remoteAddress;
    } else {
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

    const route = req.path;
    const key = `${userKey}:${route}`;

    if (!requestStore.has(key)) {
      requestStore.set(key, []);
    }

    const timestamps = requestStore.get(key);

    // Remove expired timestamps
    while (timestamps.length > 0 && timestamps[0] < windowStartTime) {
      timestamps.shift();
    }

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

// Cleanup function
function cleanupMemory() {
  const currentTime = Date.now();

  requestStore.forEach((timestamps, key) => {
    requestStore.set(
      key,
      timestamps.filter((timestamp) => timestamp > currentTime - 60000)
    );

    if (requestStore.get(key).length === 0) {
      requestStore.delete(key);
    }
  });
}

// Global configuration function
function setGlobalRateLimitConfig({
  duration,
  maxRequests,
  disabled,
  startCleanupInterval,
} = {}) {
  if (duration !== undefined) globalConfig.duration = duration;
  if (maxRequests !== undefined) globalConfig.maxRequests = maxRequests;
  if (disabled !== undefined) globalConfig.disabled = disabled;
  if (startCleanupInterval !== undefined) {
    globalConfig.startCleanupInterval = startCleanupInterval;

    if (cleanupIntervalId) {
      clearInterval(cleanupIntervalId);
    }

    if (!disabled) {
      cleanupIntervalId = setInterval(
        cleanupMemory,
        globalConfig.startCleanupInterval
      );
    }
  }
}

// Middleware configuration function
function rateLimitConfig(customConfig = {}) {
  const finalConfig = { ...globalConfig, ...customConfig };

  return rateLimiter(finalConfig);
}

module.exports = { rateLimitConfig, setGlobalRateLimitConfig };
