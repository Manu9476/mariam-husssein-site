import { getLetterCollectionByCategorySlug } from "@/lib/letters";

type PostRevalidationTarget = {
  slug?: string | null;
  categorySlugs?: Array<string | null | undefined>;
};

export function getPostRevalidationPaths(post: PostRevalidationTarget) {
  const paths = new Set<string>(["/", "/blog", "/newsletter"]);

  if (post.slug) {
    paths.add(`/blog/${post.slug}`);
  }

  for (const categorySlug of post.categorySlugs ?? []) {
    const collection = getLetterCollectionByCategorySlug(categorySlug);

    if (collection) {
      paths.add(collection.path);
    }
  }

  return Array.from(paths);
}
