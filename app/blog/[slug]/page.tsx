import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/content/post-card";
import { ImageWrapper } from "@/components/shared/image-wrapper";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getCategories,
  getPostBySlug,
  getRelatedPosts,
  getSiteSettings,
} from "@/lib/api/wordpress";
import { buildMetadata, resolveSeoCopy } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

function getCategoryLabels(ids: number[], categoryMap: Map<number, string>) {
  return ids.map((id) => categoryMap.get(id)).filter(Boolean) as string[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [settings, post] = await Promise.all([getSiteSettings(), getPostBySlug(slug)]);

  if (!post) {
    return buildMetadata(settings, {
      title: "Post not found",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const seo = resolveSeoCopy({
    title: post.title,
    excerpt: post.excerpt,
    seo: post.seo,
  });

  return buildMetadata(settings, {
    title: seo.title,
    description: seo.description,
    image: seo.image || post.image?.url,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, categories] = await Promise.all([getPostBySlug(slug), getCategories()]);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post, 3);
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const categoryLabels = getCategoryLabels(post.categories, categoryMap);

  return (
    <>
      <article className="section-space">
        <div className="container space-y-8">
          <div className="mx-auto max-w-4xl space-y-5">
            <Link href="/blog" className="eyebrow inline-flex">
              Back to the journal
            </Link>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {categoryLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
                <span>{formatDate(post.date)}</span>
                <span>{post.readingTime} min read</span>
              </div>
              <h1 className="text-5xl leading-[0.95] md:text-7xl">{post.title}</h1>
              {post.authorName ? (
                <p className="text-base text-muted-foreground">
                  By {post.authorName}
                </p>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border/80 bg-white shadow-sm">
            <ImageWrapper
              image={post.image}
              alt={post.title}
              className="aspect-[16/9]"
              priority
              sizes="100vw"
            />
          </div>

          <div className="mx-auto max-w-3xl">
            <RichTextRenderer content={post.content} />
          </div>
        </div>
      </article>

      {relatedPosts.length ? (
        <section className="section-space pt-0">
          <div className="container space-y-6">
            <SectionHeading
              eyebrow="Continue reading"
              title="More from the journal."
              description="Related posts are pulled dynamically from WordPress using shared categories."
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <PostCard
                  key={relatedPost.id}
                  post={relatedPost}
                  categoryLabels={getCategoryLabels(relatedPost.categories, categoryMap)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
