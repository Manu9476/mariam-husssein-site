import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LetterCollectionPage } from "@/components/letters/letter-collection-page";
import {
  getCategories,
  getCategoryByPossibleSlugs,
  getPageByPossibleSlugs,
  getPageBySlug,
  getPosts,
  getSiteSettings,
} from "@/lib/api/wordpress";
import { getLetterCollection, LETTER_COLLECTIONS } from "@/lib/letters";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";

export function generateStaticParams() {
  return LETTER_COLLECTIONS.map((collection) => ({
    collection: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const collection = getLetterCollection(resolvedParams.collection);

  if (!collection) {
    return {};
  }

  const [settings, introPage] = await Promise.all([
    getSiteSettings(),
    getPageByPossibleSlugs(collection.pageSlugs),
  ]);

  const seo = resolveSeoCopy({
    title: introPage?.title || collection.title,
    excerpt: introPage?.excerpt || collection.description,
    seo: introPage?.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description || collection.description,
    image: seo.image || introPage?.image?.url,
    path: collection.path,
  });
}

export default async function LettersCollectionRoute({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const resolvedParams = await params;
  const collection = getLetterCollection(resolvedParams.collection);

  if (!collection) {
    notFound();
  }

  const [settings, introPage, aboutPage, categories, activeCategory] = await Promise.all([
    getSiteSettings(),
    getPageByPossibleSlugs(collection.pageSlugs),
    getPageBySlug("about"),
    getCategories(),
    getCategoryByPossibleSlugs(collection.categorySlugs),
  ]);

  const postData = activeCategory
    ? await getPosts({
        page: 1,
        categoryId: activeCategory.id,
        perPage: 8,
      })
    : {
        items: [],
        totalPages: 0,
        totalItems: 0,
      };

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <LetterCollectionPage
      collection={collection}
      settings={settings}
      introPage={introPage}
      aboutPage={aboutPage}
      category={activeCategory}
      posts={postData.items}
      categoryMap={categoryMap}
    />
  );
}
