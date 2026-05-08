"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "10", "20", "30", "40", "50"];

type Props = {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function TimeSelect({ name, value, defaultValue, onChange, className }: Props) {
  const initial = value ?? defaultValue ?? "";
  const [hour, setHour] = useState(initial ? initial.slice(0, 2) : "");
  const [minute, setMinute] = useState(initial ? initial.slice(3, 5) : "00");

  useEffect(() => {
    if (value !== undefined) {
      setHour(value ? value.slice(0, 2) : "");
      setMinute(value ? value.slice(3, 5) : "00");
    }
  }, [value]);

  const combined = hour ? `${hour}:${minute}` : "";

  function handleHourChange(h: string) {
    setHour(h);
    const newCombined = h ? `${h}:${minute}` : "";
    onChange?.(newCombined);
  }

  function handleMinuteChange(m: string) {
    setMinute(m);
    if (hour) onChange?.(`${hour}:${m}`);
  }

  const selectClass = cn(
    "h-9 rounded-md border border-input bg-background px-2 text-sm",
    "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    className
  );

  return (
    <div className="flex w-full items-center gap-1">
      <input type="hidden" name={name} value={combined} />
      <select value={hour} onChange={(e) => handleHourChange(e.target.value)} className={cn(selectClass, "flex-1 min-w-0")}>
        <option value="">--</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>{h}시</option>
        ))}
      </select>
      <span className="shrink-0 text-sm text-muted-foreground font-medium">:</span>
      <select value={minute} onChange={(e) => handleMinuteChange(e.target.value)} disabled={!hour} className={cn(selectClass, "flex-1 min-w-0")}>
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}분</option>
        ))}
      </select>
    </div>
  );
}
