# ⚡ rate-bouncer (Node.js Rate Limiting Middleware)

A lightweight and flexible rate-limiting middleware for Node.js, designed to limit the number of requests to your API endpoints, prevent abuse, and protect your application from traffic spikes.

## ✨ Features

- 🚀 **Global and per-route configuration**: Set global defaults while allowing per-route overrides.
- 🛠 **Easy integration**: Works seamlessly with Express and similar Node.js frameworks.
- 💾 **In-memory storage**: Keeps track of requests in memory for simple use cases (perfect for single-instance applications).
- ⏳ **Throttling**: Automatically blocks requests once the limit is exceeded, with configurable retry-after time.
- 🧹 **Automatic cleanup**: Periodically removes old request data to optimize memory usage.

## 📦 Installation

To install the package via npm, run:

```bash
npm install rate-bouncer
```

## 🚀 Usage

### 1️⃣ Global Configuration (Optional)

You can set a global rate limit configuration that applies to all endpoints unless overridden per route.

```js
const express = require("express");
const { setGlobalRateLimitConfig, rateLimitConfig } = require("rate-bouncer");

const app = express();

// 🌍 Set global rate limit settings (applies to all routes unless overridden)
setGlobalRateLimitConfig({
  duration: 15 * 60 * 1000, // ⏳ 15 minutes
  maxRequests: 100, // 📊 Max 100 requests per 15 minutes
  startCleanupInterval: 50000, // 🧹 Cleanup interval (optional, default: 10000ms)
});

// 🚀 Apply the global rate limiter to all routes
app.use(rateLimitConfig());
```

### 2️⃣ Per-Route Customization

You can override the global configuration for specific routes by providing custom options.

```js
app.get(
  "/api/endpoint1",
  rateLimitConfig({ duration: 10 * 60 * 1000, maxRequests: 50 }),
  (req, res) => {
    res.send("🛑 Endpoint 1: Limited to 50 requests per 10 minutes.");
  }
);

app.post(
  "/api/endpoint2",
  rateLimitConfig({ duration: 60 * 60 * 1000, maxRequests: 200 }),
  (req, res) => {
    res.send("🛑 Endpoint 2: Limited to 200 requests per hour.");
  }
);
```

### 3️⃣ Disabling Rate Limiting

You can disable rate limiting entirely for certain routes or globally.

```js
// ❌ Disable rate limiting for a specific route
app.get("/api/open", rateLimitConfig({ disabled: true }), (req, res) => {
  res.send("✅ This route has no rate limit.");
});
```

### 4️⃣ Exceeding Rate Limit Example

When a user exceeds the rate limit, they receive a `429 Too Many Requests` response with a retry time.

```json
{
  "message": "Too many requests",
  "retryAfter": "10.0 seconds"
}
```

## 🎯 Benefits

✅ **Protects your APIs**: Prevents abuse, DOS attacks, and accidental traffic spikes by limiting requests.
✅ **Easy integration**: Simple to install and configure with Express and similar frameworks.
✅ **Customizable**: Set different limits for different routes, allowing flexibility.
✅ **Global and per-route settings**: Define a default configuration and override it when needed.
✅ **Efficient memory management**: Old request data is automatically cleaned up based on the configured interval.

## ⚠️ Limitations

⚡ **In-memory storage**: This implementation uses in-memory storage, meaning it won't scale across multiple instances. For distributed apps, consider using Redis.
⚡ **Single-instance limitation**: Ideal for small or single-instance applications. For production, consider a persistent store.
⚡ **Memory usage**: The rate limiter keeps track of timestamps in memory. High traffic may lead to increased memory usage.

## 🤝 Contributing

We welcome contributions! If you'd like to contribute, please fork the repository, create a new branch, and submit a pull request.

## 📜 License

This package is licensed under the MIT License.

## 🆘 Support

For any issues or support, please open an issue on the [GitHub repository](https://github.com/shyamtala003/rate-bouncer).
