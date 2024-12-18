# rate-bouncer (Node.js Rate Limiting Middleware)

A lightweight and flexible rate-limiting middleware for Node.js, designed to limit the number of requests to your API endpoints, prevent abuse, and protect your application from traffic spikes.

## Features

- **Flexible configuration**: Set custom time window (`duration`) and request limits (`maxRequests`) for each endpoint.
- **Easy to integrate**: Works seamlessly with Express and similar Node.js frameworks.
- **In-memory storage**: Keeps track of requests in memory for simple use cases (perfect for single-instance applications).
- **Throttling**: Automatically blocks requests once the limit is exceeded, with configurable retry after time.

## Installation

To install the package via npm, run:

```bash
npm install rate-bouncer
```

## Usage

### 1. Basic Example

Below is a basic example of how to use this rate-limiting middleware in an Express app:

```js
const express = require("express");
const rateLimiter = require("rate-bouncer"); // Import the rate-bouncer middleware

const app = express();

// Define the rate limiter configuration (duration in ms, max requests)
const limiter = rateLimiter({
  duration: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Max 100 requests in 15 minutes
});

// Apply the rate limiter middleware to specific routes
app.get("/api/endpoint1", limiter, (req, res) => {
  res.send("Endpoint 1: You can call this API.");
});

app.post("/api/endpoint2", limiter, (req, res) => {
  res.send("Endpoint 2: You can call this API.");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

### 2. Customizing per Route

You can set different rate limits for each endpoint, giving you flexibility:

```js
app.get(
  "/api/endpoint1",
  rateLimiter({ duration: 10 * 60 * 1000, maxRequests: 50 }),
  (req, res) => {
    res.send("Endpoint 1: Limited to 50 requests per 10 minutes.");
  }
);

app.post(
  "/api/endpoint2",
  rateLimiter({ duration: 60 * 60 * 1000, maxRequests: 200 }),
  (req, res) => {
    res.send("Endpoint 2: Limited to 200 requests per hour.");
  }
);
```

## Example of Exceeding Limit

When the rate limit is exceeded, the user will receive a 429 Too Many Requests response with the retryAfter field indicating how long they need to wait before making another request.

```json
{
  "message": "Too many requests",
  "retryAfter": 600
  "timeUnit": "microseconds",
}
```

## Benefits

1. `Protects your APIs:` Prevents abuse, DOS attacks, and accidental traffic spikes by limiting the number of requests.

2. `Easy to integrate:` Simple to install and configure with Express and other similar frameworks.
3. `Customizable:` Set different limits for different routes, making it flexible for various use cases.
4. `Lightweight:` No external dependencies, keeping your application minimal and fast.
5. `In-memory rate-limiting:` Perfect for single-instance Node.js applications.

## Limitations

1. `In-memory storage:` The current implementation uses in-memory storage, meaning it won't scale across multiple instances of your application. For horizontal scaling, you would need to use a distributed store like Redis.

2. `Single-instance:` This rate-limiting approach is ideal for small or single-instance apps. For larger, production-level apps, consider using a Redis-backed solution.

3. `Memory Usage:` The rate limiter stores request timestamps in memory, which can grow quickly with high traffic or numerous routes. For heavy usage, consider switching to a persistent store.

## Contributing

We welcome contributions! If you'd like to contribute, please fork the repository, create a new branch, and submit a pull request.

## License

This package is licensed under the MIT License.

## Support

For any issues or support, please open an issue on the [GitHub repository](https://github.com/shyamtala003/rate-bouncer).
