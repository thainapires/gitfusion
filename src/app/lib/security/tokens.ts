import crypto from "crypto";

const encryptedPrefix = "v1";

export function encryptProviderToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    encryptedPrefix,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptProviderToken(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [version, iv, authTag, encrypted] = value.split(":");

  if (version !== encryptedPrefix || !iv || !authTag || !encrypted) {
    return value;
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(authTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function getEncryptionKey() {
  const secret = process.env.GITFUSION_TOKEN_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Token encryption secret is not configured.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}
