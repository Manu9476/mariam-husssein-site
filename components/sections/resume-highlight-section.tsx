import { Download, ExternalLink, FileText, Linkedin } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/types/wordpress";

function hasLinkedInUrl(url?: string) {
  return Boolean(url?.trim());
}

export function ResumeHighlightSection({
  settings,
  compact = false,
}: {
  settings: SiteSettings;
  compact?: boolean;
}) {
  const resume = settings.profile.resume;
  const cvFile = resume.cvFile;
  const linkedInUrl = resume.linkedInUrl?.trim();
  const canShow = Boolean(cvFile?.url || hasLinkedInUrl(linkedInUrl));

  if (!canShow) {
    return null;
  }

  return (
    <section className={compact ? "section-space pt-0" : "section-space pb-8 pt-0"}>
      <div className="container">
        <FadeIn>
          <div className="editorial-panel overflow-hidden">
            <div className="grid gap-6 px-6 py-6 md:px-8 md:py-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-4">
                <SectionHeading
                  eyebrow={resume.eyebrow}
                  title={resume.title || "View Mariam's CV and professional profile."}
                  description={
                    resume.description ||
                    "Open the latest resume online, download a copy, or continue the conversation on LinkedIn."
                  }
                  animate={false}
                  size={compact ? "compact" : "default"}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {cvFile?.url ? (
                  <Button asChild size="lg" className="justify-between">
                    <a href={cvFile.url} target="_blank" rel="noreferrer">
                      <span className="inline-flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {resume.fileButtonLabel || "Read CV"}
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}

                {cvFile?.url ? (
                  <Button asChild size="lg" variant="outline" className="justify-between">
                    <a
                      href="/api/cv"
                      download={cvFile.filename || "Mariam-Husssein-CV"}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {resume.downloadButtonLabel || "Download CV"}
                      </span>
                    </a>
                  </Button>
                ) : null}

                {linkedInUrl ? (
                  <Button
                    asChild
                    size="lg"
                    variant={cvFile?.url ? "outline" : "default"}
                    className={`justify-between ${cvFile?.url ? "md:col-span-2" : "md:col-span-2"}`}
                  >
                    <a href={linkedInUrl} target="_blank" rel="noreferrer">
                      <span className="inline-flex items-center gap-2">
                        <Linkedin className="h-4 w-4" />
                        {resume.linkedInLabel || "Visit LinkedIn"}
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
