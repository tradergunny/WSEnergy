/**
 * Minimal, provider-agnostic analytics ping.
 *
 * The site has no analytics vendor wired yet. Rather than couple features to a
 * specific provider, `track()` pushes to `window.dataLayer` (the GA4 / Google
 * Tag Manager convention) and also dispatches a DOM `CustomEvent`. Both are
 * no-ops until something listens, so this is safe to call anywhere on the
 * client and never breaks UX. When GTM/GA4 (or any listener) is added later,
 * these events start flowing with zero changes at the call sites.
 */

type AnalyticsPayload = { event: string } & Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: AnalyticsPayload[];
  }
}

export function track(event: string, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const payload: AnalyticsPayload = { event, ...props };
  try {
    (window.dataLayer ??= []).push(payload);
    window.dispatchEvent(new CustomEvent("analytics", { detail: payload }));
  } catch {
    // Analytics must never break the experience.
  }
}
