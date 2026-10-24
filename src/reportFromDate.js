import { format, isValid, parse } from "date-fns";

// Each report's From Date is saved in this browser, so the report opens on the
// From Date picked last time. Saved as a calendar day, not a time, so the day
// doesn't shift with the time zone.
const DAY_FORMAT = "yyyy-MM-dd";
const key = (report) => `reportFromDate.${report}`;

// The saved From Date of a report, or fallback if none is saved (or storage is blocked).
export const savedFromDate = (report, fallback) => {
  try {
    const saved = localStorage.getItem(key(report));
    const date = saved ? parse(saved, DAY_FORMAT, new Date()) : null;
    return date && isValid(date) ? date : fallback;
  } catch (error) {
    return fallback;
  }
};

export const saveFromDate = (report, date) => {
  try {
    if (date && isValid(date)) localStorage.setItem(key(report), format(date, DAY_FORMAT));
    else localStorage.removeItem(key(report));
  } catch (error) {
    console.log(error);
  }
};
