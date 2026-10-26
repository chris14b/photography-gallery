import { describe, expect, test } from "vitest";
import { formatDates } from "./dates";

describe("formatDates", () => {
  test("a range within one month shows that month once", () => {
    expect(formatDates("2023-12-02", "2023-12-20")).toBe("December 2023");
  });

  test("the first and last days of a month stay in that month", () => {
    expect(formatDates("2024-03-01", "2024-03-31")).toBe("March 2024");
  });

  test("a range across months of one year closes up the dash", () => {
    expect(formatDates("2023-08-28", "2023-09-04")).toBe(
      "August–September 2023",
    );
  });

  test("a range across years puts spaces around the dash", () => {
    expect(formatDates("2024-10-15", "2025-04-02")).toBe(
      "October 2024 – April 2025",
    );
  });

  test("a range from December to January shows both years", () => {
    expect(formatDates("2024-12-20", "2025-01-05")).toBe(
      "December 2024 – January 2025",
    );
  });

  test("the same month in different years shows both years", () => {
    expect(formatDates("2024-06-01", "2025-06-30")).toBe(
      "June 2024 – June 2025",
    );
  });
});
