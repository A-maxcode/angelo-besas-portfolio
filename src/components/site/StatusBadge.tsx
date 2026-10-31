import { Badge } from "@/components/ui/badge";
import type { ContentStatus } from "@/data/types";

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge variant="sample" title={status === "sample" ? "Demo content" : "To be replaced with verified content"}>
      {status === "sample" ? "Sample" : "Placeholder"}
    </Badge>
  );
}
