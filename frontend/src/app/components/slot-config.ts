/* ===== SHARED SLOT CONFIGURATION ===== */

const SLOT_CONFIG_KEY = "shokh_slot_config";
const BOOKED_SLOTS_KEY = "shokh_booked_slots";

/* Uzbek month/weekday names */
const UZ_MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];
const UZ_MONTHS_SHORT = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
  "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek",
];
const UZ_WEEKDAYS_SHORT = [
  "Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Sha",
];
const UZ_WEEKDAYS_FULL = [
  "Yakshanba", "Dushanba", "Seshanba", "Chorshanba",
  "Payshanba", "Juma", "Shanba",
];

/* Time periods — 10 slots total */
export const SLOT_TIME_PERIODS = [
  {
    label: "Ertalab",
    range: "09:00–12:00",
    iconKey: "sun" as const,
    slots: ["09:00", "10:00", "11:00"],
  },
  {
    label: "Kunduzi",
    range: "12:00–16:00",
    iconKey: "cloudSun" as const,
    slots: ["12:00", "13:00", "14:00", "15:00"],
  },
  {
    label: "Kechqurun",
    range: "16:00–19:00",
    iconKey: "moon" as const,
    slots: ["16:00", "17:00", "18:00"],
  },
];

export const ALL_SLOT_TIMES = SLOT_TIME_PERIODS.flatMap((p) => p.slots);
export const DAILY_SLOT_LIMIT = 3;

/* Slot config stored in localStorage */
export interface SlotConfig {
  openDate: string;  /* YYYY-MM-DD — start date */
  endDate: string;   /* YYYY-MM-DD — end date (inclusive) */
}

export function loadSlotConfig(): SlotConfig | null {
  try {
    const raw = localStorage.getItem(SLOT_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    /* Migration: old configs had only openDate with 30-day window */
    if (parsed && parsed.openDate && !parsed.endDate) {
      const start = new Date(parsed.openDate + "T00:00:00");
      const end = new Date(start);
      end.setDate(start.getDate() + 29);
      const yyyy = end.getFullYear();
      const mm = String(end.getMonth() + 1).padStart(2, "0");
      const dd = String(end.getDate()).padStart(2, "0");
      parsed.endDate = `${yyyy}-${mm}-${dd}`;
      localStorage.setItem(SLOT_CONFIG_KEY, JSON.stringify(parsed));
    }
    return parsed as SlotConfig;
  } catch {
    return null;
  }
}

export function saveSlotConfig(config: SlotConfig): void {
  localStorage.setItem(SLOT_CONFIG_KEY, JSON.stringify(config));
}

/* Seed default slot config + mock booked slots if nothing exists yet */
export function ensureSlotConfig(): SlotConfig {
  const existing = loadSlotConfig();
  if (existing) return existing;

  const today = new Date();
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const start = new Date(today);
  start.setDate(today.getDate() + 1); // start from tomorrow
  const end = new Date(start);
  end.setDate(start.getDate() + 29); // 30 days total

  const config: SlotConfig = { openDate: fmt(start), endDate: fmt(end) };
  saveSlotConfig(config);

  // Seed some mock booked slots for realism
  const mockBooked: Record<string, string[]> = {};
  const seedDays = [1, 2, 3, 5, 7, 10, 14];
  const sampleSlots = [
    ["09:00", "14:00"],
    ["10:00", "15:00", "17:00"],
    ["11:00", "13:00"],
    ["09:00", "12:00", "16:00"],
    ["10:00", "18:00"],
    ["14:00", "15:00"],
    ["09:00", "11:00", "16:00"],
  ];
  seedDays.forEach((offset, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + offset);
    mockBooked[fmt(d)] = sampleSlots[i];
  });

  const existingBooked = loadBookedSlots();
  if (Object.keys(existingBooked).length === 0) {
    saveBookedSlots(mockBooked);
  }

  return config;
}

/* Booked slots stored in localStorage — { "2026-03-15": ["09:00","10:00","14:00"] } */
export function loadBookedSlots(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(BOOKED_SLOTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string[]>;
  } catch {
    return {};
  }
}

export function saveBookedSlots(data: Record<string, string[]>): void {
  localStorage.setItem(BOOKED_SLOTS_KEY, JSON.stringify(data));
}

export function getBookedSlotsForDate(date: string): string[] {
  const all = loadBookedSlots();
  return all[date] || [];
}

export function addBookedSlot(date: string, time: string): void {
  const all = loadBookedSlots();
  if (!all[date]) all[date] = [];
  if (!all[date].includes(time)) {
    all[date].push(time);
    saveBookedSlots(all);
  }
}

export function isDayFull(date: string): boolean {
  return getBookedSlotsForDate(date).length >= DAILY_SLOT_LIMIT;
}

export function dayBookedCount(date: string): number {
  return getBookedSlotsForDate(date).length;
}

/* Generate available dates from slot config (openDate to endDate inclusive) */
export interface AvailableDate {
  value: string;       /* YYYY-MM-DD */
  label: string;       /* "11 Mar" */
  weekday: string;     /* "Chor" */
  weekdayFull: string; /* "Chorshanba" */
  full: string;        /* "11 Mart" */
  fullWithYear: string; /* "11 Mart, 2026" */
}

export function generateAvailableDates(): AvailableDate[] {
  const config = loadSlotConfig();
  if (!config) return [];

  const start = new Date(config.openDate + "T00:00:00");
  const end = new Date(config.endDate + "T00:00:00");
  const dates: AvailableDate[] = [];

  const current = new Date(start);
  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    const value = `${yyyy}-${mm}-${dd}`;

    const day = current.getDate();
    const monthShort = UZ_MONTHS_SHORT[current.getMonth()];
    const monthFull = UZ_MONTHS[current.getMonth()];
    const wdShort = UZ_WEEKDAYS_SHORT[current.getDay()];
    const wdFull = UZ_WEEKDAYS_FULL[current.getDay()];

    dates.push({
      value,
      label: `${day} ${monthShort}`,
      weekday: wdShort,
      weekdayFull: wdFull,
      full: `${day} ${monthFull}`,
      fullWithYear: `${day} ${monthFull}, ${yyyy}`,
    });

    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/* Calculate day count between two dates */
export function getDayCount(openDate: string, endDate: string): number {
  const start = new Date(openDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const diff = end.getTime() - start.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function formatDateUz(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const month = UZ_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

/* ===== FROZEN DAYS (holidays) ===== */
const FROZEN_DAYS_KEY = "shokh_frozen_days";

export function loadFrozenDays(): string[] {
  try {
    const raw = localStorage.getItem(FROZEN_DAYS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveFrozenDays(days: string[]): void {
  localStorage.setItem(FROZEN_DAYS_KEY, JSON.stringify(days));
}

export function toggleFrozenDay(date: string): string[] {
  const current = loadFrozenDays();
  const idx = current.indexOf(date);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(date);
  }
  saveFrozenDays(current);
  return [...current];
}

export function isDayFrozen(date: string): boolean {
  return loadFrozenDays().includes(date);
}