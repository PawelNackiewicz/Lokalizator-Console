import { Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

const ratingFormatter = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function SchoolRating({ rating }: { rating: number }) {
  return (
    <Badge variant="secondary" className="gap-1 tabular-nums">
      <Star className="fill-current" aria-hidden />
      {ratingFormatter.format(rating)}
    </Badge>
  );
}
