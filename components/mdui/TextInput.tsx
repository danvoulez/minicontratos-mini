"use client";

import type * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface MDUITextInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TextInput({
  id,
  label,
  placeholder,
  defaultValue,
  onChange,
  className,
}: MDUITextInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        defaultValue={defaultValue}
        id={id}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}
