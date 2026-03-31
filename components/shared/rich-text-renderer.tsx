import { cn } from "@/lib/utils";

export function RichTextRenderer({
  content,
  className,
}: {
  content?: string;
  className?: string;
}) {
  if (!content) {
    return null;
  }

  return (
    <div
      className={cn("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
