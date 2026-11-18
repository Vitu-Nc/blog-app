export function isPostSlugLocked(
  firstPublishedAt: Date | null,
  publishedAt: Date | null,
) {
  return firstPublishedAt !== null || publishedAt !== null;
}
