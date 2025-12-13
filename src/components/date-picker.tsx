"use client";

import { format } from "date-fns";
import { LucideCalendar } from "lucide-react";
import { useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ImperativeHandleFromDatePicker = {
  reset: () => void;
};

type DatePickerProps = {
  id: string;
  name: string;
  defaultValue?: string | undefined;
  imperativeHandleRef?: React.RefObject<ImperativeHandleFromDatePicker>;
  disablePastDates?: boolean;
};

const DatePicker = ({
  id,
  name,
  defaultValue,
  imperativeHandleRef,
  disablePastDates = true, // Por padrão, datas passadas são desabilitadas
}: DatePickerProps) => {
  // Obtenha a data atual com a hora definida como 00:00:00
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Determinar a data anterior a hoje (para desabilitar datas passadas, exceto hoje)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Inicializar com a data padrão, hoje, ou undefined
  const defaultDate = defaultValue ? new Date(defaultValue) : undefined;

  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [open, setOpen] = useState(false);

  useImperativeHandle(imperativeHandleRef, () => ({
    reset: () => setDate(new Date()),
  }));

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false);
  };

  // Função para desabilitar datas
  const disableDate = (date: Date) => {
    if (disablePastDates) {
      // Modificado para desabilitar apenas datas ANTERIORES a hoje (não incluindo hoje)
      return date < yesterday;
    }
    return false;
  };

  const formattedStringDate = date ? format(date, "yyyy-MM-dd") : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger id={id} className="w-full" asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal rounded-lg border-muted/30 focus-visible:ring-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-sm"
        >
          <LucideCalendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {formattedStringDate || (
            <span className="text-muted-foreground">Selecione uma data</span>
          )}
          <input type="hidden" name={name} value={formattedStringDate} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-lg shadow-md border-muted/20"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={disableDate}
          initialFocus
          className="rounded-md"
          fromDate={disablePastDates ? undefined : undefined}
          // Removido o fromDate que forçava apenas datas a partir de today
          // Agora usamos a função disableDate para tratar isso
        />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };
