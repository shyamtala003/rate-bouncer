import crypto from "crypto";
export default function generateUserId() {
  crypto.randomBytes(16).toString("hex");
}
