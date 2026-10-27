export const INTRO_SESSION_KEY = "satark_intro_seen";
export const INTRO_FADE_MS = 200;

export type IntroSkipReason = "reduced_motion" | "seen" | null;

/**
 * Decide whether the cinematic intro may run. It is a first-visit,
 * once-per-session enhancement, never a requirement for using the site.
 */
export function getIntroSkipReason({
  reducedMotion,
  seen,
}: {
  reducedMotion: boolean;
  seen: boolean;
}): IntroSkipReason {
  if (reducedMotion) return "reduced_motion";
  if (seen) return "seen";
  return null;
}

/** Treat any stored truthy marker as seen, including older string values. */
export function hasSeenIntro(value: string | null): boolean {
  return value === "true" || value === "1" || value === "yes";
}
