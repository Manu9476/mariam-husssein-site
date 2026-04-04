import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants";
import type { SanitySiteSettingsDocument } from "@/types/sanity";

function slugKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function keyedLink(title: string, url: string, target?: string) {
  return {
    _key: `${slugKey(title)}-${slugKey(url) || "link"}`,
    title,
    url,
    ...(target ? { target } : {}),
  };
}

function keyedSocial(label: string, url: string) {
  return {
    _key: `${slugKey(label)}-${slugKey(url) || "social"}`,
    label,
    url,
  };
}

export function getSiteSettingsDocumentDefaults(): SanitySiteSettingsDocument {
  return {
    siteTitle: "Mariam Husssein",
    siteDescription:
      "A soft editorial home for thoughtful writing, personal reflections, and resources.",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logoAlt: "Mariam Husssein",
    header: {
      eyebrow: "Personal brand",
      monogram: "M",
      subscribeLabel: "Subscribe",
      mobileLabel: "Editorial brand site",
    },
    profile: {
      eyebrow: "Profile",
      title: "A thoughtful digital home shaped around letters, notes, and generous living.",
      summary:
        "Mariam shares quiet reflections, elegant storytelling, and the kind of guidance that invites readers to linger.",
      highlights: [
        "Writer, curator, and personal brand storyteller.",
        "Building a refined home for letters, notes, and meaningful resources.",
        "Thoughtful collaborations, conversations, and editorial projects are always welcome.",
      ],
      quickLinks: [
        keyedLink("Letters", "/letters/younger-me"),
        keyedLink("Notes", "/blog"),
        keyedLink("Newsletter", "/newsletter"),
      ],
      primaryLinkLabel: "Read Mariam's story",
      primaryLinkUrl: "/about",
      resume: {
        eyebrow: "Resume and profile",
        title: "Open Mariam's CV or connect on LinkedIn.",
        description:
          "Share your CV with readers and make it easy for them to continue the conversation on LinkedIn.",
        fileButtonLabel: "Read CV",
        downloadButtonLabel: "Download CV",
        linkedInLabel: "Visit LinkedIn",
        linkedInUrl: "",
      },
    },
    primaryMenu: [
      keyedLink("Home", "/"),
      keyedLink("Letters", "/letters/younger-me"),
      keyedLink("Notes", "/blog"),
      keyedLink("Newsletter", "/newsletter"),
      keyedLink("Resources", "/resources"),
      keyedLink("Archive", "/blog"),
      keyedLink("About", "/about"),
      keyedLink("Contact", "/contact"),
      keyedLink("Studio", "/studio"),
    ],
    footerMenu: [
      keyedLink("Newsletter", "/newsletter"),
      keyedLink("Privacy Policy", "/privacy-policy"),
      keyedLink("Terms", "/terms"),
    ],
    hero: {
      eyebrow: "Editorial notes",
      title: "A calm digital home for stories, lessons, and generous living.",
      subtitle:
        "A thoughtful space for stories, letters, notes, and generous living.",
      primaryCtaLabel: "Read the journal",
      primaryCtaUrl: "/blog",
      secondaryCtaLabel: "About Mariam",
      secondaryCtaUrl: "/about",
    },
    home: {
      featured: {
        eyebrow: "Featured article",
        title: "One story to begin with.",
        description: "A lead note that sets the tone for the rest of the visit.",
        label: "Featured note",
      },
      letters: {
        eyebrow: "Letters to Myself",
        title: "Enter the letters, one season at a time.",
        description:
          "Choose the chapter that meets you where you are, then follow the thread deeper.",
        latestLabel: "Start here",
        primaryCtaLabel: "Open the letters",
        secondaryCtaLabel: "Read one now",
      },
      notes: {
        eyebrow: "Latest notes",
        title: "Notes, reflections, and thoughtful updates.",
        description:
          "A curated stream of essays and smaller pieces that keep the site alive between the longer letters.",
        archiveLabel: "View all",
        profileCardEyebrow: "Profile",
        profileCtaLabel: "Read more about Mariam",
        browseEyebrow: "Browse",
      },
      testimonials: {
        eyebrow: "Kind words",
        title: "Warm reflections from readers, collaborators, and clients.",
        description:
          "A few approved notes that add social proof without disrupting the editorial mood.",
        ctaLabel: "View all reviews",
      },
      social: {
        eyebrow: "Elsewhere",
        title: "Keep up with Mariam online.",
        description:
          "Follow along for thoughtful updates, new writing, resources, and everyday inspiration.",
        emailLabel: "Email",
      },
    },
    pageCopy: {
      blog: {
        eyebrow: "Notes",
        title: "Stories, lessons, and notes with an editorial rhythm.",
        description:
          "An archive of essays, reflections, and thoughtful updates distinct from the letters.",
        emptyTitle: "No notes published yet",
        emptyDescription: "New notes will appear here as they are published.",
      },
      about: {
        eyebrow: "About",
        faqEyebrow: "FAQ",
        faqTitle: "A few helpful answers.",
        faqDescription:
          "A tidy place for practical questions, collaborations, and the details people often want to know.",
        testimonialsEyebrow: "In good company",
        testimonialsTitle: "A few kind words.",
        testimonialsDescription: "Approved reflections from readers, collaborators, and clients.",
      },
      resources: {
        eyebrow: "Resources",
        title: "Curated offers, resources, and thoughtful tools.",
        description:
          "A flexible space for offers, services, recommendations, and editorial resources.",
        emptyTitle: "No resources published yet",
        emptyDescription: "Helpful resources will appear here as they are added.",
      },
      contact: {
        eyebrow: "Contact",
        title: "Start a thoughtful conversation.",
        description:
          "Use this page for collaborations, speaking requests, media, and meaningful enquiries.",
        emailLabel: "Email",
        locationLabel: "Location",
        availabilityLabel: "Availability",
      },
      reviews: {
        eyebrow: "Reviews",
        title: "Kind words and thoughtful feedback.",
        description: "A place for public testimonials and private review submissions.",
        emptyTitle: "No public reviews yet",
        emptyDescription: "Approved testimonials will appear here automatically.",
      },
      letters: {
        featuredLabel: "Featured letter",
        popularTitle: "A Few to Begin With",
        popularArchiveLabel: "Return to collection",
        recentEyebrow: "Recent letters",
        recentTitle: "Notes, reflections, and quieter truths.",
        recentArchiveLabel: "This collection",
        profileEyebrow: "Collection note",
        newsletterEyebrow: "Stay close",
        readNextEyebrow: "Read next",
        socialEyebrow: "Elsewhere",
      },
      newsletterPage: {
        eyebrow: "Newsletter",
        title: "Letters worth slowing down for.",
        description: "A quiet room for subscribers, new readers, and published notes.",
        subscribedEyebrow: "Published now",
        subscribedTitle: "Published notes for subscribers.",
        subscribedDescription:
          "Your browser remembers that you subscribed, so this page becomes a reading room.",
        previewEyebrow: "Recent reading",
        previewTitle: "A small sample from the notes.",
        previewDescription:
          "Use this page to preview the kind of thoughtful notes subscribers can expect.",
      },
    },
    newsletter: {
      eyebrow: "Stay close",
      title: "Letters worth slowing down for.",
      description:
        "A quiet place for thoughtful updates, reflections, and new essays.",
      placeholder: "Enter your email address",
      buttonLabel: "Subscribe",
      disclaimer:
        "No spam. Just thoughtful updates, occasional recommendations, and new essays.",
    },
    contact: {
      email: DEFAULT_CONTACT_EMAIL,
      phone: "+254 700 000 000",
      location: "Nairobi, Kenya",
      availability: "Open to speaking, partnerships, and thoughtful collaborations.",
    },
    socialLinks: [
      keyedSocial("Website", "https://example.com"),
      keyedSocial("YouTube", "https://youtube.com"),
      keyedSocial("Instagram", "https://instagram.com"),
    ],
    footer: {
      blurb:
        "An editorial space for personal essays, resources, and warm modern storytelling.",
      copyright: `© ${new Date().getFullYear()} Mariam Husssein. All rights reserved.`,
      newsletterCtaLabel: "Join the newsletter",
      newsletterCtaUrl: "/newsletter",
    },
  };
}
