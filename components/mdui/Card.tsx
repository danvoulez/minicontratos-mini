"use client";

import type * as React from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as UICard,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MDUICardProps {
  title?: string;
  icon?: string;
  status?: "default" | "success" | "warning" | "error";
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const statusStyles = {
  default: "border-border",
  success: "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
  warning: "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20",
  error: "border-red-500/50 bg-red-50/50 dark:bg-red-950/20",
};

export function Card({
  title,
  icon,
  status = "default",
  description,
  children,
  className,
}: MDUICardProps) {
  return (
    <UICard className={cn(statusStyles[status], className)}>
      {(title || icon || description) && (
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            {title && <CardTitle className="text-lg">{title}</CardTitle>}
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
    </UICard>
  );
}
