"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MDUIDatePickerProps {
  id: string;
  label?: string;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({
  id,
  label,
  defaultValue,
  onChange,
  className,
}: MDUIDatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(defaultValue);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange?.(selectedDate);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            id={id}
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Selecione uma data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            initialFocus
            mode="single"
            onSelect={handleSelect}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
