import Image from "next/image";

import { cn } from "@/lib/utils";

type AvatarProps = {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  color?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base"
};

export function Avatar({ name, email, src, color, size = "md", className }: AvatarProps) {
  const initial = (name?.trim() || email?.trim() || "?").slice(0, 1).toUpperCase();
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white font-semibold text-white",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color || "#f5f5f1", color: color ? "#fff" : "#6b6b66" }}
    >
      {src ? <Image src={src} alt="" fill className="object-cover" /> : initial}
    </span>
  );
}
