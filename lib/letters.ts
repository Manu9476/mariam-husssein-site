export type LetterCollectionSlug = "younger-me" | "current-me" | "future-me";

export type LetterCollection = {
  slug: LetterCollectionSlug;
  title: string;
  shortLabel: string;
  description: string;
  path: string;
  pageSlugs: string[];
  categorySlugs: string[];
};

export const LETTER_COLLECTIONS: LetterCollection[] = [
  {
    slug: "younger-me",
    title: "Letters to My Younger Self",
    shortLabel: "Younger Me",
    description:
      "A tender archive of perspective, encouragement, and the kinds of words you wish someone had said earlier.",
    path: "/letters/younger-me",
    pageSlugs: ["letters-younger-me", "younger-me"],
    categorySlugs: ["younger-me", "younger-self"],
  },
  {
    slug: "current-me",
    title: "Letters to My Current Self",
    shortLabel: "Current Me",
    description:
      "Reflections for the season you are living through now: grounded, honest, and shaped by what today is asking of you.",
    path: "/letters/current-me",
    pageSlugs: ["letters-current-me", "current-me"],
    categorySlugs: ["current-me", "current-self", "present-me"],
  },
  {
    slug: "future-me",
    title: "Letters to My Future Self",
    shortLabel: "Future Me",
    description:
      "A softer kind of ambition. These letters look ahead with hope, clarity, and a little more trust in what is still unfolding.",
    path: "/letters/future-me",
    pageSlugs: ["letters-future-me", "future-me"],
    categorySlugs: ["future-me", "future-self"],
  },
];

export function getLetterCollection(slug: string) {
  return LETTER_COLLECTIONS.find((entry) => entry.slug === slug);
}
