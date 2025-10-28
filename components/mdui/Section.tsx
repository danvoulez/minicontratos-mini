"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

export interface MDUISectionProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className }: MDUISectionProps) {
  return (
    <div className={cn("mt-4 space-y-2", className)}>
      {title && (
        <h4 className="font-medium text-muted-foreground text-sm">{title}</h4>
      )}
      <div className="space-y-2 border-border border-l-2 pl-4">{children}</div>
    </div>
  );
}
