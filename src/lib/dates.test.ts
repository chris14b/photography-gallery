import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  formatDates,
  formatMonths,
  formatShortDates,
  formatYears,
  mainYear,
} from "./dates";

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

describe("formatDates without an end", () => {
  test("shows the start month and present", () => {
    expect(formatDates("2026-07-28")).toBe("July 2026 – present");
  });
});

describe("formatShortDates", () => {
  test("a range within one month shows that month and year", () => {
    expect(formatShortDates("2023-12-02", "2023-12-20")).toBe("Dec 2023");
  });

  test("a range across months of one year closes up the dash", () => {
    expect(formatShortDates("2023-08-28", "2023-09-04")).toBe("Aug–Sep 2023");
  });

  test("a range across years shows both years", () => {
    expect(formatShortDates("2024-10-15", "2025-04-02")).toBe(
      "Oct 2024 – Apr 2025",
    );
  });

  test("without an end, shows the start month and present", () => {
    expect(formatShortDates("2026-07-28")).toBe("Jul 2026 – present");
  });
});

describe("formatMonths", () => {
  test("a range within one month shows that month without its year", () => {
    expect(formatMonths("2023-12-02", "2023-12-20")).toBe("Dec");
  });

  test("a range across months of one year closes up the dash", () => {
    expect(formatMonths("2023-08-28", "2023-09-04")).toBe("Aug–Sep");
  });

  test("a range across years shows both years", () => {
    expect(formatMonths("2024-10-15", "2025-04-02")).toBe(
      "Oct 2024 – Apr 2025",
    );
  });
});

describe("formatMonths without an end", () => {
  beforeEach(() => vi.setSystemTime("2026-10-28"));
  afterEach(() => vi.useRealTimers());

  test("closes up the dash before present", () => {
    expect(formatMonths("2026-07-28")).toBe("Jul–present");
  });

  test("shows the year it started once it runs into another year", () => {
    expect(formatMonths("2025-11-01")).toBe("Nov 2025 – present");
  });
});

describe("mainYear", () => {
  test("an album within one year is in that year", () => {
    expect(mainYear("2023-08-28", "2023-09-04")).toBe("2023");
  });

  test("an album across years is in the year it spends the most days in", () => {
    expect(mainYear("2023-12-27", "2024-01-25")).toBe("2024");
    expect(mainYear("2024-10-25", "2025-04-18")).toBe("2025");
    expect(mainYear("2024-12-01", "2025-01-05")).toBe("2024");
  });

  test("a tie goes to the earlier year", () => {
    expect(mainYear("2024-12-30", "2025-01-02")).toBe("2024");
  });

  test("an album with no end runs to today", () => {
    vi.setSystemTime("2027-03-01");
    expect(mainYear("2026-12-01")).toBe("2027");
    expect(mainYear("2026-07-28")).toBe("2026");
    vi.useRealTimers();
  });
});

describe("formatYears", () => {
  test("dates across years show the first and last years", () => {
    expect(formatYears(["2024-07-16", "2023-06-14", "2026-01-02"])).toBe(
      "2023–2026",
    );
  });

  test("dates within one year show that year once", () => {
    expect(formatYears(["2024-03-01", "2024-10-15"])).toBe("2024");
  });

  test("no dates show nothing", () => {
    expect(formatYears([])).toBe("");
  });
});
