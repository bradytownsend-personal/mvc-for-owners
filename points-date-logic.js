const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

// A handful of source rows store two point values in one cell (e.g. "260 / 300"
// for a Studio S/D unit type with two sub-configurations). For affordability
// math we conservatively use the higher of the two so we never tell someone
// they can afford a stay they actually can't; the original text is still
// shown as-is in the UI.
function toPoints(v) {
  if (typeof v === "number") return v;
  if (v === undefined || v === null) return undefined;
  const nums = String(v).match(/\d+(\.\d+)?/g);
  if (!nums) return undefined;
  return Math.max(...nums.map(Number));
}

// Parses "Jan 2–Jan 29 / Dec 4–Dec 17" (or ";"-separated) into a list of
// { start: Date, end: Date } — end is inclusive of the last calendar day,
// but we treat it as the checkout-exclusive boundary by adding 1 day when
// used for night iteration (see nightsInRange).
function parseDateRanges(str, year) {
  if (!str || str.trim() === "" || str.trim() === "\u2014") return [];
  const segments = str.split(/\s*[\/;]\s*/);
  const ranges = [];
  for (const seg of segments) {
    const m = seg.trim().match(/^([A-Za-z]{3})\s+(\d{1,2})\s*[\u2013\u2011-]\s*([A-Za-z]{3})\s+(\d{1,2})$/);
    if (!m) continue;
    const [, mon1, day1, mon2, day2] = m;
    if (!(mon1 in MONTHS) || !(mon2 in MONTHS)) continue;
    let start = new Date(year, MONTHS[mon1], parseInt(day1, 10));
    let end = new Date(year, MONTHS[mon2], parseInt(day2, 10));
    if (end < start) {
      end = new Date(year + 1, MONTHS[mon2], parseInt(day2, 10));
    }
    ranges.push({ start, end });
  }
  return ranges;
}

function dateKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

// Build a unified timeline of {start,end,dayType,points} windows from a
// resort's season rows, parsing both the 2026 and 2027 columns into real
// absolute dates.
function buildTimeline(seasons) {
  const windows = [];
  for (const s of seasons) {
    for (const [colYear, dateStr] of [[2026, s.dates2026], [2027, s.dates2027]]) {
      const ranges = parseDateRanges(dateStr, colYear);
      for (const r of ranges) {
        windows.push({ start: r.start, end: r.end, dayType: s.dayType, points: s.points });
      }
    }
  }
  return windows;
}

function buildHolidayTimeline(holidays) {
  const windows = [];
  for (const h of holidays) {
    for (const [colYear, dateStr] of [[2026, h.dates2026], [2027, h.dates2027]]) {
      const ranges = parseDateRanges(dateStr, colYear);
      for (const r of ranges) {
        windows.push({ start: r.start, end: r.end, holiday: h.holiday, points: h.points });
      }
    }
  }
  return windows;
}

// Normalize "Fri–Sat" / "Sun–Thu" labels (dash variants) for comparison
function normDayType(s) { return s.replace(/[\u2013\u2011]/g, "-").trim(); }

const DOW_ABBR = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };

// Parses a dayType label like "Fri-Sat", "Sun-Thu", "Mon-Thu", or a single
// day "Sun" into the set of weekday indices (0=Sun..6=Sat) it covers.
// Different resorts split the week differently (some 2-way: weekend/weekday;
// some 3-way: weekend/Sunday/weekday), so this has to be driven by the
// label itself rather than a hardcoded pair of buckets.
function dayTypeToWeekdaySet(label) {
  const dt = normDayType(label);
  if (dt === "Full Week") return null; // not a per-night row
  const parts = dt.split("-").map((p) => p.trim());
  if (parts.length === 1) {
    const d = DOW_ABBR[parts[0]];
    return d === undefined ? null : new Set([d]);
  }
  const start = DOW_ABBR[parts[0]];
  const end = DOW_ABBR[parts[1]];
  if (start === undefined || end === undefined) return null;
  const set = new Set();
  let i = start;
  while (true) {
    set.add(i);
    if (i === end) break;
    i = (i + 1) % 7;
  }
  return set;
}

// Find the season window containing a given night's date, matching whichever
// dayType row's weekday set includes that night's day of week.
function findRateForNight(timeline, night) {
  const weekday = night.getDay();
  for (const w of timeline) {
    if (night >= w.start && night <= w.end) {
      const days = dayTypeToWeekdaySet(w.dayType);
      if (days && days.has(weekday)) return w;
    }
  }
  return null;
}

function findHolidayForNight(holidayTimeline, night) {
  for (const w of holidayTimeline) {
    if (night >= w.start && night <= w.end) return w;
  }
  return null;
}

// Compute total points required per unit type for a stay [checkIn, checkOut)
function computeStayCost(resort, checkIn, checkOut) {
  const timeline = buildTimeline(resort.seasons);
  const holidayTimeline = buildHolidayTimeline(resort.holidays);

  const nights = [];
  for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
    nights.push(new Date(d));
  }

  const totals = {};
  resort.unitTypes.forEach((ut) => totals[ut] = 0);
  const nightDetails = [];
  let anyHolidayNight = false;
  let unresolvedNight = false;

  for (const night of nights) {
    const hol = findHolidayForNight(holidayTimeline, night);
    if (hol) {
      anyHolidayNight = true;
      resort.unitTypes.forEach((ut) => {
        // Approximate: spread the holiday full-week rate over 7 nights
        const raw = toPoints(hol.points[ut]);
        const perNight = raw !== undefined ? raw / 7 : undefined;
        if (perNight !== undefined) totals[ut] += perNight;
      });
      nightDetails.push({ date: night, type: "holiday", label: hol.holiday, rateSource: hol });
      continue;
    }
    const rate = findRateForNight(timeline, night);
    if (!rate) {
      unresolvedNight = true;
      nightDetails.push({ date: night, type: "unresolved" });
      continue;
    }
    resort.unitTypes.forEach((ut) => {
      const val = toPoints(rate.points[ut]);
      if (val !== undefined) totals[ut] += val;
    });
    nightDetails.push({ date: night, type: "regular", rateSource: rate });
  }

  resort.unitTypes.forEach((ut) => totals[ut] = Math.round(totals[ut]));

  return { totals, nights: nightDetails, anyHolidayNight, unresolvedNight, nightCount: nights.length };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseDateRanges, buildTimeline, buildHolidayTimeline, computeStayCost, dateKey, toPoints };
}
