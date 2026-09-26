import { AttentionItem } from "../../utils/useNeedsAttention";
import { NeedsAttentionRow } from "./NeedsAttentionRow";

interface NeedsAttentionSectionProps {
  items: AttentionItem[];
  isLoading: boolean;
}

export function NeedsAttentionSection({ items, isLoading }: NeedsAttentionSectionProps) {
  return (
    <section>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing needs attention — you're all caught up.</p>
      ) : (
        <div className="space-y-2">
          {items.map(({ match, reason, severity }) => (
            <NeedsAttentionRow key={match.id} match={match} reason={reason} severity={severity} />
          ))}
        </div>
      )}
    </section>
  );
}