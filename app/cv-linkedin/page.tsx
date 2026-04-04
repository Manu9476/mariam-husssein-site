import type { Metadata } from "next";
import Link from "next/link";
import { Download, ExternalLink, FileText, Linkedin } from "lucide-react";

import { ResumeHighlightSection } from "@/components/sections/resume-highlight-section";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/api/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildMetadata(settings, {
    title: "CV & LinkedIn",
    description:
      settings.profile.resume.description ||
      "Open Mariam's CV, download a copy, or continue the conversation on LinkedIn.",
    path: "/cv-linkedin",
  });
}

export default async function CvLinkedInPage() {
  const settings = await getSiteSettings();
  const resume = settings.profile.resume;
  const cvFile = resume.cvFile;
  const linkedInUrl = resume.linkedInUrl?.trim();
  const hasResumeContent = Boolean(cvFile?.url || linkedInUrl);

  return (
    <>
      <ResumeHighlightSection settings={settings} />

      {hasResumeContent ? (
        <section className="section-space pt-2">
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-2">
              {cvFile?.url ? (
                <div className="editorial-panel space-y-4 p-6 md:p-7">
                  <p className="eyebrow">Curriculum vitae</p>
                  <h2 className="text-[2rem] leading-[0.96] tracking-[-0.04em] md:text-[2.7rem]">
                    Read or download the latest CV.
                  </h2>
                  <p className="text-[1rem] leading-8 text-foreground/82">
                    Open the uploaded CV directly in the browser or download a copy for later.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={cvFile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="soft-link"
                    >
                      <FileText className="h-4 w-4" />
                      {resume.fileButtonLabel || "Read CV"}
                    </a>
                    <a href="/api/cv" className="soft-link">
                      <Download className="h-4 w-4" />
                      {resume.downloadButtonLabel || "Download CV"}
                    </a>
                  </div>
                </div>
              ) : null}

              {linkedInUrl ? (
                <div className="editorial-panel space-y-4 p-6 md:p-7">
                  <p className="eyebrow">LinkedIn</p>
                  <h2 className="text-[2rem] leading-[0.96] tracking-[-0.04em] md:text-[2.7rem]">
                    Continue the conversation professionally.
                  </h2>
                  <p className="text-[1rem] leading-8 text-foreground/82">
                    Visit Mariam&apos;s LinkedIn profile for professional updates, background, and direct networking.
                  </p>
                  <Link
                    href={linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="soft-link"
                  >
                    <Linkedin className="h-4 w-4" />
                    {resume.linkedInLabel || "Visit LinkedIn"}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
