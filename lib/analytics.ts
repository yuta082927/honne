import { track } from "@vercel/analytics";

type LpCtaClickPayload = {
  placement: "hero" | "final";
  label: string;
  href: string;
};

export function trackLpCtaClick(payload: LpCtaClickPayload): void {
  try {
    track("lp_cta_click", payload);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to track lp_cta_click", error);
    }
  }
}
