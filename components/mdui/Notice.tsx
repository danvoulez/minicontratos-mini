"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export interface MDUINoticeProps {
  type?: "info" | "warning" | "error";
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const noticeIcons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const noticeVariants = {
  info: "info",
  warning: "warning",
  error: "destructive",
} as const;

export function Notice({
  type = "info",
  title,
  children,
  className,
}: MDUINoticeProps) {
  const Icon = noticeIcons[type];

  return (
    <Alert className={className} variant={noticeVariants[type]}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      {children && <AlertDescription>{children}</AlertDescription>}
    </Alert>
  );
}
