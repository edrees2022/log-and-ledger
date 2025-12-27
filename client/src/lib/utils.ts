import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function format(
  date: Date | string | number,
  pattern: string = "yyyy-MM-dd"
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const pad = (n: number) => n.toString().padStart(2, "0");

  const map: Record<string, string> = {
    yyyy: d.getFullYear().toString(),
    MM: pad(d.getMonth() + 1),
    dd: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  };

  return pattern.replace(/yyyy|MM|dd|HH|mm|ss/g, (matched) => map[matched]);
}
