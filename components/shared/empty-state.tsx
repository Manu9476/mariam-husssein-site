import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="mx-auto max-w-3xl border-border/80 bg-white/75 shadow-soft">
      <CardHeader className="pb-3">
        <p className="eyebrow">For now</p>
        <CardTitle className="text-[2rem] leading-[1] md:text-[2.6rem]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="max-w-2xl text-foreground/82">{description}</p>
      </CardContent>
    </Card>
  );
}
