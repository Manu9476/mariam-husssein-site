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
        "max-w-[40rem] space-y-4",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="text-[2.5rem] leading-[0.96] tracking-[-0.04em] md:text-[4rem]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-[1rem] leading-8 md:text-[1.1rem]">
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
