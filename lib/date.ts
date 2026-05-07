import { format } from "date-fns";

export function todayKey() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date());
}

export function dateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatKoreanDate(key: string) {
  const date = parseDateKey(key);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}

export function formatShortDate(key: string) {
  const date = parseDateKey(key);
  return format(date, "M월 d일");
}

export function buildMonthGrid(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const startDay = first.getDay();
  const cells: Array<{
    key: string;
    day: number;
    inMonth: boolean;
    dow: number;
  }> = [];

  const prevLast = new Date(year, monthIndex, 0).getDate();
  for (let i = startDay - 1; i >= 0; i -= 1) {
    const day = prevLast - i;
    const date = new Date(year, monthIndex - 1, day);
    cells.push({
      key: dateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: false,
      dow: date.getDay()
    });
  }

  const last = new Date(year, monthIndex + 1, 0).getDate();
  for (let day = 1; day <= last; day += 1) {
    const date = new Date(year, monthIndex, day);
    cells.push({
      key: dateKey(year, monthIndex, day),
      day,
      inMonth: true,
      dow: date.getDay()
    });
  }

  while (cells.length < 42) {
    const date = new Date(year, monthIndex + 1, cells.length - (startDay + last) + 1);
    cells.push({
      key: dateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: false,
      dow: date.getDay()
    });
  }

  return cells;
}
