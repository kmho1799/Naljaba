import { Check } from "lucide-react";

import { MEMBER_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  name?: string;
  value?: string;
  compact?: boolean;
};

export function ColorPicker({ name = "color", value = MEMBER_COLORS[0].value, compact }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MEMBER_COLORS.map((color) => (
        <label key={color.value} className="relative inline-flex">
          <input
            type="radio"
            name={name}
            value={color.value}
            defaultChecked={value === color.value}
            className="peer sr-only"
          />
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-offset-background transition peer-checked:scale-105 peer-checked:ring-2 peer-checked:[&>svg]:block",
              compact ? "h-8 w-8" : "h-9 w-9"
            )}
            style={{
              backgroundColor: color.value,
              ["--tw-ring-color" as string]: color.value
            }}
            title={color.label}
          >
            <Check className="hidden h-4 w-4 text-white" />
          </span>
        </label>
      ))}
    </div>
  );
}
