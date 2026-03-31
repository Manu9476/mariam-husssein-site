import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchInput({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  return (
    <form action="/blog" className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="query"
          defaultValue={defaultValue}
          placeholder="Search essays, stories, and reflections"
          className="pl-11"
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
