const reservedSlugs = new Set([
  "admin",
  "api",
  "blog",
  "authors",
  "feed",
  "sitemap",
  "robots",
]);

function slugBase(displayName: string) {
  const slug = displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = slug || "author";

  return reservedSlugs.has(base) ? `${base}-author` : base;
}

export async function createUniqueUserSlug(
  displayName: string,
  isTaken: (slug: string) => Promise<boolean>,
) {
  const base = slugBase(displayName);

  for (let suffix = 1; ; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;

    if (!(await isTaken(candidate))) {
      return candidate;
    }

    if (!Number.isSafeInteger(suffix + 1)) {
      throw new Error("Unable to generate a unique user slug.");
    }
  }
}
