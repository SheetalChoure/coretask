import React from "react";
import { TOKENS } from "../../constants/tokens";

export function Skeleton({ className = "", style = {} }) {
  return <div className={`animate-pulse rounded-md ${className}`} style={{ background: TOKENS.surfaceAlt, ...style }} />;
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-2 w-full mt-2" />
      <div className="flex items-center justify-between mt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-3 flex-1" />
      <Skeleton className="h-5 w-16 rounded-md" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
  );
}
