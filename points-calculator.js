/* ===========================================================
   Points Calculator — points-calculator.js
   Reads POINTS_CALCULATOR_DATA (points-data.js) and the date/cost
   logic (points-date-logic.js) to answer: for these exact dates,
   this resort, and this many points — what can I book?
   =========================================================== */

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.appendChild(c));
  return node;
}

function populateResortSelect(selectId) {
  const select = document.getElementById(selectId);
  const sorted = [...POINTS_CALCULATOR_DATA].sort((a, b) => a.name.localeCompare(b.name));
  sorted.forEach((resort) => {
    select.appendChild(el("option", { value: resort.name, text: resort.name }));
  });
}

// "2026-02-06" (from <input type="date">) -> local Date at midnight, avoiding
// the UTC-parsing offset bug that plain `new Date("2026-02-06")` has.
function parseInputDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function fmtDate(d) {
  return `${DOW[d.getDay()]}, ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function renderResults() {
  const results = document.getElementById("calc-results");
  results.innerHTML = "";

  const pointsRaw = document.getElementById("calc-points").value.trim();
  const checkInRaw = document.getElementById("calc-checkin").value;
  const checkOutRaw = document.getElementById("calc-checkout").value;
  const resortName = document.getElementById("calc-resort").value;

  if (!pointsRaw || !checkInRaw || !checkOutRaw || !resortName) {
    results.appendChild(el("p", {
      class: "calc-placeholder",
      text: "Enter your points, your travel dates, and a resort above to see if you have enough."
    }));
    return;
  }

  const points = parseInt(pointsRaw, 10);
  if (isNaN(points) || points < 0) {
    results.appendChild(el("p", { class: "calc-placeholder", text: "Enter a valid number of points." }));
    return;
  }

  const checkIn = parseInputDate(checkInRaw);
  const checkOut = parseInputDate(checkOutRaw);
  if (checkOut <= checkIn) {
    results.appendChild(el("p", { class: "calc-placeholder", text: "Check-out needs to be after check-in." }));
    return;
  }
  const nightCount = Math.round((checkOut - checkIn) / 86400000);
  if (nightCount > 21) {
    results.appendChild(el("p", { class: "calc-placeholder", text: "That's a long stay to check at once — try 21 nights or fewer." }));
    return;
  }

  const resort = POINTS_CALCULATOR_DATA.find((r) => r.name === resortName);
  if (!resort) return;

  const stay = computeStayCost(resort, checkIn, checkOut);

  // Header
  const head = el("div", { class: "calc-resort-head" });
  head.appendChild(el("h2", { text: resort.name }));
  if (resort.url) {
    head.appendChild(el("a", { href: resort.url, target: "_blank", rel: "noopener noreferrer", text: "View resort \u2197" }));
  }
  results.appendChild(head);

  results.appendChild(el("p", {
    class: "calc-summary",
    html: `<strong>${nightCount} night${nightCount === 1 ? "" : "s"}</strong> \u2014 ${fmtDate(checkIn)} to ${fmtDate(checkOut)}`
  }));

  if (stay.anyHolidayNight) {
    results.appendChild(el("p", {
      class: "calc-warning",
      text: "These dates overlap a holiday week. Holiday weeks are typically reserved as a fixed 7-night block rather than nightly, so the totals below are a proportional estimate \u2014 confirm exact holiday booking rules with MVC."
    }));
  }
  if (stay.unresolvedNight) {
    results.appendChild(el("p", {
      class: "calc-warning",
      text: "Some of these nights fall outside the points chart data currently available for this resort, so totals below may be incomplete."
    }));
  }

  // Verdict table: one row per unit type
  const wrap = el("div", { class: "calc-table-wrap" });
  const table = el("table", { class: "calc-table" });
  const thead = el("thead", {}, [
    el("tr", {}, [
      el("th", { text: "Unit Type" }),
      el("th", { text: "Points Required" }),
      el("th", { text: "Result" }),
    ])
  ]);
  table.appendChild(thead);

  const tbody = el("tbody");
  resort.unitTypes.forEach((ut) => {
    const needed = stay.totals[ut];
    const tr = el("tr");
    tr.appendChild(el("td", { text: ut }));
    tr.appendChild(el("td", { text: needed.toLocaleString() }));
    if (points >= needed) {
      tr.appendChild(el("td", {
        class: "calc-cell-afford",
        text: `\u2713 Fits (${(points - needed).toLocaleString()} points to spare)`
      }));
    } else {
      tr.appendChild(el("td", {
        class: "calc-cell-noafford",
        text: `\u2717 Short by ${(needed - points).toLocaleString()} points`
      }));
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  results.appendChild(wrap);

  // Night-by-night breakdown, collapsed by default
  const details = el("details", { class: "calc-breakdown" });
  details.appendChild(el("summary", { text: "Night-by-night breakdown" }));
  const bWrap = el("div", { class: "calc-table-wrap" });
  const bTable = el("table", { class: "calc-table" });
  const bHead = el("thead", {}, [
    el("tr", {}, [
      el("th", { text: "Date" }),
      el("th", { text: "Rate type" }),
      ...resort.unitTypes.map((ut) => el("th", { text: ut })),
    ])
  ]);
  bTable.appendChild(bHead);
  const bBody = el("tbody");
  stay.nights.forEach((n) => {
    const tr = el("tr", n.type === "holiday" ? { class: "calc-row-holiday" } : {});
    tr.appendChild(el("td", { text: fmtDate(n.date) }));
    let label;
    if (n.type === "holiday") label = `Holiday (${n.rateSource.holiday})`;
    else if (n.type === "regular" && n.rateSource) label = n.rateSource.dayType.replace(/[\u2013\u2011]/g, "\u2013");
    else label = "\u2014";
    tr.appendChild(el("td", { text: label }));
    resort.unitTypes.forEach((ut) => {
      let cellText = "\u2014";
      if (n.rateSource) {
        const raw = n.rateSource.points[ut];
        if (raw !== undefined) {
          cellText = n.type === "holiday" ? `${raw} \u00f7 7` : String(raw);
        }
      }
      tr.appendChild(el("td", { text: cellText }));
    });
    bBody.appendChild(tr);
  });
  bTable.appendChild(bBody);
  bWrap.appendChild(bTable);
  details.appendChild(bWrap);
  results.appendChild(details);
}

document.addEventListener("DOMContentLoaded", () => {
  populateResortSelect("calc-resort");
  ["calc-points", "calc-checkin", "calc-checkout", "calc-resort"].forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener("input", renderResults);
    field.addEventListener("change", renderResults);
  });
});

// ===========================================================
// Calendar view — pick a resort, see its full points chart.
// No points/dates required; this is a plain reference display.
// ===========================================================

function cleanDayType(label) {
  return label.replace(/[\u2013\u2011]/g, "\u2013");
}

// Groups season rows that share the same date range (e.g. the Fri-Sat,
// Sun-Thu, and Full Week rows for the same physical week) into one card,
// preserving the order they first appear in.
function groupSeasonsByDateRange(seasons) {
  const groups = [];
  const index = new Map();
  seasons.forEach((s) => {
    const key = s.dates2026 + "||" + s.dates2027;
    if (!index.has(key)) {
      index.set(key, { dates2026: s.dates2026, dates2027: s.dates2027, rows: [] });
      groups.push(index.get(key));
    }
    index.get(key).rows.push(s);
  });
  return groups;
}

function renderCalendarView() {
  const results = document.getElementById("calendar-results");
  results.innerHTML = "";

  const resortName = document.getElementById("calendar-resort").value;
  if (!resortName) {
    results.appendChild(el("p", { class: "calc-placeholder", text: "Select a resort above to see its full points calendar." }));
    return;
  }

  const resort = POINTS_CALCULATOR_DATA.find((r) => r.name === resortName);
  if (!resort) return;

  const head = el("div", { class: "calendar-resort-head" });
  head.appendChild(el("h2", { text: resort.name }));
  if (resort.url) {
    head.appendChild(el("a", { href: resort.url, target: "_blank", rel: "noopener noreferrer", text: "View resort \u2197" }));
  }
  results.appendChild(head);

  // Regular season, grouped into one card per date range
  if (resort.seasons.length) {
    results.appendChild(el("p", { class: "calendar-section-label", text: "Regular season" }));
    const groups = groupSeasonsByDateRange(resort.seasons);
    groups.forEach((g) => {
      const card = el("div", { class: "season-card" });
      const dates = el("div", { class: "season-card-dates" });
      dates.appendChild(el("span", {}, [el("strong", { text: "2026" }), document.createTextNode(g.dates2026 || "\u2014")]));
      dates.appendChild(el("span", {}, [el("strong", { text: "2027" }), document.createTextNode(g.dates2027 || "\u2014")]));
      card.appendChild(dates);

      const wrap = el("div", { class: "calc-table-wrap" });
      const table = el("table", { class: "calc-table" });
      const thead = el("thead", {}, [
        el("tr", {}, [
          el("th", { text: "Day Type" }),
          ...resort.unitTypes.map((ut) => el("th", { text: ut })),
        ])
      ]);
      table.appendChild(thead);
      const tbody = el("tbody");
      g.rows.forEach((row) => {
        const tr = el("tr");
        tr.appendChild(el("td", { text: cleanDayType(row.dayType) }));
        resort.unitTypes.forEach((ut) => {
          const val = row.points[ut];
          tr.appendChild(el("td", { text: val !== undefined ? String(val) : "\u2014" }));
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      card.appendChild(wrap);
      results.appendChild(card);
    });
  }

  // Holiday weeks, one card per holiday
  if (resort.holidays.length) {
    results.appendChild(el("p", { class: "calendar-section-label", text: "Holiday weeks" }));
    resort.holidays.forEach((h) => {
      const card = el("div", { class: "holiday-card" });
      card.appendChild(el("p", { class: "holiday-name", text: h.holiday }));
      const dates = el("div", { class: "season-card-dates" });
      dates.appendChild(el("span", {}, [el("strong", { text: "2026" }), document.createTextNode(h.dates2026 || "\u2014")]));
      dates.appendChild(el("span", {}, [el("strong", { text: "2027" }), document.createTextNode(h.dates2027 || "\u2014")]));
      card.appendChild(dates);

      const wrap = el("div", { class: "calc-table-wrap" });
      const table = el("table", { class: "calc-table" });
      const thead = el("thead", {}, [
        el("tr", {}, [
          el("th", { text: "Day Type" }),
          ...resort.unitTypes.map((ut) => el("th", { text: ut })),
        ])
      ]);
      table.appendChild(thead);
      const tbody = el("tbody");
      const tr = el("tr");
      tr.appendChild(el("td", { text: cleanDayType(h.dayType) }));
      resort.unitTypes.forEach((ut) => {
        const val = h.points[ut];
        tr.appendChild(el("td", { text: val !== undefined ? String(val) : "\u2014" }));
      });
      tbody.appendChild(tr);
      table.appendChild(tbody);
      wrap.appendChild(table);
      card.appendChild(wrap);
      results.appendChild(card);
    });
  }
}

function setupTabs() {
  const tabReservation = document.getElementById("tab-reservation");
  const tabCalendar = document.getElementById("tab-calendar");
  const panelReservation = document.getElementById("panel-reservation");
  const panelCalendar = document.getElementById("panel-calendar");

  function activate(tab) {
    const showCalendar = tab === "calendar";
    tabReservation.classList.toggle("is-active", !showCalendar);
    tabCalendar.classList.toggle("is-active", showCalendar);
    tabReservation.setAttribute("aria-selected", String(!showCalendar));
    tabCalendar.setAttribute("aria-selected", String(showCalendar));
    panelReservation.hidden = showCalendar;
    panelCalendar.hidden = !showCalendar;
  }

  tabReservation.addEventListener("click", () => activate("reservation"));
  tabCalendar.addEventListener("click", () => activate("calendar"));
}

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  populateResortSelect("calendar-resort");
  document.getElementById("calendar-resort").addEventListener("change", renderCalendarView);
});
