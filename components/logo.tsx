import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  size?: number;
  markOnly?: boolean;
  mobileMark?: boolean;
  className?: string;
};

export function Logo({ href = "/rooms", size = 48, markOnly = false, mobileMark = false, className }: LogoProps) {
  const image = markOnly ? (
    <Image
      src="/logo-icon.svg"
      alt="날잡아"
      width={size}
      height={size}
      priority
      className={className}
    />
  ) : mobileMark ? (
    <span className="inline-flex items-center">
      <span className="relative block h-11 w-11 overflow-hidden sm:hidden">
        <Image
          src="/logo-icon.svg"
          alt="날잡아"
          fill
          priority
          sizes="44px"
          className="object-contain object-left"
        />
      </span>
      <span className={cn("relative hidden h-12 w-[180px] overflow-hidden sm:block", className)}>
        <Image
          src="/logo-width-fit.svg"
          alt="날잡아"
          fill
          priority
          sizes="180px"
          className="object-cover object-center"
        />
      </span>
    </span>
  ) : (
    <span className={cn("relative block h-12 w-[180px] overflow-hidden", className)}>
      <Image
        src="/logo-width-fit.svg"
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
