import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Łączy klasy warunkowo i rozstrzyga konflikty Tailwinda (konwencja shadcn/ui). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
