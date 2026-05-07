import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitial(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  return source.slice(0, 1).toUpperCase();
}

export function absoluteUrl(path = "/") {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL(path, siteUrl).toString();
}
