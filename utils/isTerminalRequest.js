// Function to check if the request is from a terminal (cURL, Postman, etc.)
export default function isTerminalRequest(req) {
  const userAgent = req.headers["user-agent"];
  return (
    !userAgent || // Empty user-agent (often seen in direct terminal requests)
    userAgent.includes("curl") ||
    userAgent.includes("Apidog") ||
    userAgent.includes("Wget") ||
    userAgent.includes("Postman") ||
    userAgent.includes("HTTPie") ||
    userAgent.includes("Go-http-client")
  );
}
