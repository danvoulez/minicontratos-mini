"use client";

import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MDUIActionButtonProps {
  label: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  action?: string;
  payload?: Record<string, unknown>;
  className?: string;
}

export function ActionButton({
  label,
  variant = "default",
  onClick,
  action,
  payload,
  className,
}: MDUIActionButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (action && payload) {
      // Dispatch custom event for action handling
      const event = new CustomEvent("mdui:action", {
        detail: { name: action, payload },
      });
      window.dispatchEvent(event);
    }
    onClick?.(e);
  };

  return (
    <Button className={className} onClick={handleClick} variant={variant}>
      {label}
    </Button>
  );
}
