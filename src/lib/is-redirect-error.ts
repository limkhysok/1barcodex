export function isRedirectError(e: unknown): boolean {
  if (typeof e !== "object" || e === null || !("digest" in e)) return false;
  const digest = e.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
