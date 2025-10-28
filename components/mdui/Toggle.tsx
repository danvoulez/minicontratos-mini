"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface MDUIToggleProps {
  id: string;
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Toggle({
  id,
  label,
  checked = false,
  onChange,
  className,
}: MDUIToggleProps) {
  const [isChecked, setIsChecked] = React.useState(checked);

  const handleChange = (newChecked: boolean) => {
    setIsChecked(newChecked);
    onChange?.(newChecked);
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch checked={isChecked} id={id} onCheckedChange={handleChange} />
      {label && <Label htmlFor={id}>{label}</Label>}
    </div>
  );
}
