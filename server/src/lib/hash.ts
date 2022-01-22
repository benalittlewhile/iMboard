import { createHash, randomBytes } from "crypto";

export function hash(input: string) {
  const salt = randomBytes(16);
  const hash = createHash("whirlpool");
  hash.update(salt + input);
  return hash.digest("hex");
}
