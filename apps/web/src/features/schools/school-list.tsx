import type { School } from '@lokalizator/shared-types';
import { MapPin } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SchoolRating } from './school-rating';

interface SchoolListProps {
  schools: School[];
  selectedId: string | null;
  onSelect: (school: School) => void;
}

export function SchoolList({ schools, selectedId, onSelect }: SchoolListProps) {
  if (schools.length === 0) {
    return (
      <p className="text-muted-foreground px-6 py-10 text-center text-sm">
        Brak szkół do wyświetlenia. Czy uruchomiono <code>pnpm db:seed</code>?
      </p>
    );
  }

  return (
    <ul className="divide-border divide-y" role="listbox" aria-label="Lista szkół">
      {schools.map((school) => {
        const isSelected = school.id === selectedId;

        return (
          <li key={school.id}>
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(school)}
              className={cn(
                'hover:bg-accent/60 focus-visible:ring-ring/50 flex w-full flex-col items-start gap-1.5 px-6 py-4 text-left transition-colors outline-none focus-visible:ring-[3px]',
                isSelected && 'bg-accent',
              )}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <span className="text-sm leading-snug font-medium">{school.name}</span>
                <SchoolRating rating={school.rating} />
              </div>
              <span className="text-muted-foreground flex items-start gap-1.5 text-xs">
                <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
                {school.address}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function SchoolListSkeleton() {
  return (
    <ul className="divide-border divide-y">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="flex flex-col gap-2 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-11 rounded-md" />
          </div>
          <Skeleton className="h-3 w-36" />
        </li>
      ))}
    </ul>
  );
}
