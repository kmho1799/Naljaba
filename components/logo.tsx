import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  size?: number;
  markOnly?: boolean;
  className?: string;
};

export function Logo({ href = "/rooms", size = 48, markOnly = false, className }: LogoProps) {
  const image = markOnly ? (
    <Image
      src="/logo-icon.png"
      alt="날잡아"
      width={size}
      height={size}
      priority
      className={className || "h-auto w-auto"}
    />
  ) : (
    <span className={cn("relative block h-12 w-[180px] overflow-hidden", className)}>
      <Image
        src="/logo-width-fit.png"
        alt="날잡아"
        fill
        priority
        sizes="180px"
        className="object-cover object-center"
      />
    </span>
  );

  if (!href) return image;
  return <Link href={href}>{image}</Link>;
}
