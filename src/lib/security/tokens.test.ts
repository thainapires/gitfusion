import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  decryptProviderToken,
  encryptProviderToken,
} from "./tokens";

describe("provider token encryption", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GITFUSION_TOKEN_ENCRYPTION_KEY: "test-token-encryption-key",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("round-trips provider tokens with the configured encryption key", () => {
    const encrypted = encryptProviderToken("github-access-token");

    expect(encrypted).toMatch(/^v1:/);
    expect(encrypted).not.toContain("github-access-token");
    expect(decryptProviderToken(encrypted)).toBe("github-access-token");
  });

  it("keeps legacy unversioned values readable", () => {
    expect(decryptProviderToken("legacy-access-token")).toBe(
      "legacy-access-token",
    );
  });

  it("fails when the encrypted value is read with a different key", () => {
    const encrypted = encryptProviderToken("github-access-token");

    process.env.GITFUSION_TOKEN_ENCRYPTION_KEY =
      "different-token-encryption-key";

    expect(() => decryptProviderToken(encrypted)).toThrow(
      /authenticate data|Unsupported state/i,
    );
  });
});
