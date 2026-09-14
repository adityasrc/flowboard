import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-slate-100",
        className
      )}
      {...props}
    />
  );
}