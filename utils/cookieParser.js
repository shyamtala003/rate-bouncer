// Function to parse cookies manually from headers
export default function cookieParser(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(cookieHeader.split("; ").map((c) => c.split("=")));
}
