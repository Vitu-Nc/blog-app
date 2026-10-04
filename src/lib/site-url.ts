const localSiteUrl = "http://localhost:3000";
let hasWarnedAboutMissingProductionUrl = false;

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredUrl) {
    if (
      process.env.NODE_ENV === "production" &&
      !hasWarnedAboutMissingProductionUrl
    ) {
      console.warn(
        "NEXT_PUBLIC_SITE_URL is not set in production; canonical, sitemap, and feed URLs will use http://localhost:3000. Set NEXT_PUBLIC_SITE_URL to the public site origin.",
      );
      hasWarnedAboutMissingProductionUrl = true;
    }

    return new URL(localSiteUrl);
  }

  const siteUrl = new URL(configuredUrl);

  if (siteUrl.protocol !== "https:" && siteUrl.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  }

  return new URL(siteUrl.origin);
}
