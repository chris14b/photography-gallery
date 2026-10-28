const monthYear = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const shortMonth = new Intl.DateTimeFormat("en", {
  month: "short",
  timeZone: "UTC",
});
const shortMonthYear = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * The months an album covers, such as "December 2023", "August–September 2023" or "October 2024 – April 2025", or
 * "July 2026 – present" without an end. Dates are YYYY-MM-DD, which Date reads as UTC.
 */
export function formatDates(start: string, end?: string): string {
  return formatRange(monthYear, start, end);
}

/**
 * The months an album covers, short and without the year it starts in, for under a year heading: "Dec", "Aug–Sep",
 * "Jul–present", or "Oct 2024 – Apr 2025" when it runs into another year. Dates are YYYY-MM-DD.
 */
export function formatMonths(start: string, end?: string): string {
  const oneYear = start.slice(0, 4) === (end ?? today()).slice(0, 4);
  return formatRange(oneYear ? shortMonth : shortMonthYear, start, end);
}

/**
 * The year an album spends the most days in, to list it under on the home page: 2024 for 27 December 2023 to
 * 25 January 2024. A tie goes to the earlier year. An album with no end runs to today. Dates are YYYY-MM-DD.
 */
export function mainYear(start: string, end = today()): string {
  let main = start.slice(0, 4);
  let mostDays = 0;
  for (let year = Number(main); year <= Number(end.slice(0, 4)); year++) {
    const from = Math.max(Date.parse(start), Date.UTC(year, 0, 1));
    const to = Math.min(Date.parse(end), Date.UTC(year, 11, 31));
    const days = (to - from) / DAY + 1;
    if (days > mostDays) {
      main = String(year);
      mostDays = days;
    }
  }
  return main;
}

const DAY = 24 * 60 * 60 * 1000;

/** Today in UTC, as YYYY-MM-DD. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatRange(
  format: Intl.DateTimeFormat,
  start: string,
  end: string | undefined,
): string {
  // Space the dash after a year, as between years below, and close it up after a month alone.
  if (end === undefined) {
    const dash = format.resolvedOptions().year === undefined ? "–" : " – ";
    return `${format.format(new Date(start))}${dash}present`;
  }
  const parts = format.formatRangeToParts(new Date(start), new Date(end));
  // Intl puts thin spaces around the dash. Close it up between months of one year, and use normal spaces between years.
  const acrossYears = parts.some(
    (part) => part.type === "year" && part.source === "startRange",
  );
  return parts
    .map((part) =>
      part.type === "literal" && part.value.trim() === "–"
        ? acrossYears
          ? " – "
          : "–"
        : part.value,
    )
    .join("");
}

/** The years some dates span, such as "2023–2026", or "2023" when they're all in one year. Dates are YYYY-MM-DD. */
export function formatYears(dates: string[]): string {
  const years = dates.map((date) => date.slice(0, 4)).sort();
  const first = years.at(0);
  const last = years.at(-1);
  return first === last ? (first ?? "") : `${first}–${last}`;
}
