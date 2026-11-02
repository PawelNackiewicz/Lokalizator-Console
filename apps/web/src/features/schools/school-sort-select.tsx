import { Label } from '@/components/ui/label';
import { SCHOOL_SORT_OPTIONS, isSchoolSort, type SchoolSort } from './school-sort';

interface SchoolSortSelectProps {
  value: SchoolSort;
  onChange: (value: SchoolSort) => void;
  disabled?: boolean;
}

export function SchoolSortSelect({ value, onChange, disabled }: SchoolSortSelectProps) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <Label htmlFor="school-sort" className="shrink-0">
        Sortuj według
      </Label>
      <select
        id="school-sort"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          if (isSchoolSort(event.target.value)) {
            onChange(event.target.value);
          }
        }}
        className="border-input bg-background focus-visible:ring-ring/50 h-9 min-w-0 flex-1 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px] disabled:opacity-50"
      >
        {SCHOOL_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
