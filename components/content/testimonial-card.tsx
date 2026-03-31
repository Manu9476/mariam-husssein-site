import { Star } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { Card } from "@/components/ui/card";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import type { TestimonialEntry } from "@/types/content";

export function TestimonialCard({
  testimonial,
}: {
  testimonial: TestimonialEntry;
}) {
  return (
    <FadeIn>
      <Card className="h-full p-6">
        <div className="flex h-full flex-col gap-5">
          <div className="flex gap-1 text-primary">
            {Array.from({ length: testimonial.rating }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <RichTextRenderer content={testimonial.quote} className="text-sm" />
          <div className="mt-auto">
            <p className="font-serif text-2xl">{testimonial.name}</p>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
}
