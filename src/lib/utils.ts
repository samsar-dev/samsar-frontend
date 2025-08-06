import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Lightweight alternative for simple cases
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ultra-lightweight version for basic class merging
export function simpleCn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
