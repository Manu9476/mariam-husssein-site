import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  animate = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  animate?: boolean;
}) {
  const content = (
    <div
      className={cn(
        "max-w-[44rem] space-y-5",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <div
          className={cn(
            "flex items-center gap-3",
            align === "center" && "justify-center",
          )}
        >
          <span className="h-px w-10 bg-border" />
          <p className="eyebrow">{eyebrow}</p>
          <span className="h-px w-10 bg-border" />
        </div>
      ) : null}
      <h2 className="text-[2.65rem] leading-[0.94] tracking-[-0.045em] md:text-[4.25rem]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-[1rem] leading-8 text-foreground/82 md:text-[1.1rem]">
          {description}
        </p>
      ) : null}
    </div>
  );

  if (!animate) {
    return content;
  }

  return <FadeIn>{content}</FadeIn>;
}
