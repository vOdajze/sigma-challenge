import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDisplayDate } from "@/lib/formatters";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 cursor-pointer">
          <div
            className={`flex items-center gap-1.5 border rounded-md px-2.5 h-9 text-sm hover:bg-accent transition-colors ${!value?.from ? "text-muted-foreground" : ""}`}
          >
            <CalendarDays
              size={13}
              className="shrink-0"
            />
            {value?.from ? formatDisplayDate(value.from) : "De"}
          </div>
          <ArrowRight
            size={13}
            className="text-muted-foreground shrink-0"
          />
          <div
            className={`flex items-center gap-1.5 border rounded-md px-2.5 h-9 text-sm hover:bg-accent transition-colors ${!value?.to ? "text-muted-foreground" : ""}`}
          >
            <CalendarDays
              size={13}
              className="shrink-0"
            />
            {value?.to ? formatDisplayDate(value.to) : "Até"}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        side="bottom"
      >
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range) => {
            onChange(range);
            if (range?.from && range?.to) setOpen(false);
          }}
          locale={ptBR}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
}
