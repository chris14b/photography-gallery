const monthYear = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * The months an album covers, such as "December 2023", "August–September 2023" or "October 2024 – April 2025".
 * Dates are YYYY-MM-DD, which Date reads as UTC.
 */
export function formatDates(start: string, end: string): string {
  const parts = monthYear.formatRangeToParts(new Date(start), new Date(end));
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
