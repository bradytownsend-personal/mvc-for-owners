/* ===========================================================
   Resort Map — map.js
   Starter dataset — curated from public MVC resort listings.
   Not exhaustive: the live marriottvacationclubs.com resort list
   loads dynamically and couldn't be scraped wholesale, so treat
   this as a first pass to expand on.
   =========================================================== */

const REGIONS = {
  us: {
    label: "United States",
    tone: "us",
    pin: { x: 227.8, y: 141.7 },
    view: { x: 144.7, y: 104.8, w: 179.8, h: 100 },
    cities: [
      { name: "Orlando, FL", x: 273.9, y: 170.8, resorts: [
        "Marriott's Grande Vista", "Marriott's Cypress Harbour",
        "Marriott's Harbour Lake", "Marriott's Imperial Palm Villas", "Marriott's Royal Palms"
      ]},
      { name: "Hilton Head Island, SC", x: 275.8, y: 160.6, resorts: [
        "Marriott's Barony Beach Club", "Marriott's Harbour Club",
        "Marriott's Monarch", "Marriott's SurfWatch"
      ]},
      { name: "Myrtle Beach, SC", x: 280.8, y: 156.4, resorts: [
        "Marriott's OceanWatch Villas", "Marriott's Grande Ocean"
      ]},
      { name: "Fort Lauderdale, FL", x: 277.5, y: 177.5, resorts: [
        "Marriott's BeachPlace Towers"
      ]},
      { name: "Williamsburg, VA", x: 286.9, y: 146.4, resorts: [
        "Marriott's Manor Club"
      ]},
      { name: "Boston, MA", x: 302.5, y: 132.2, resorts: [
        "Marriott Vacation Club at Custom House"
      ]},
      { name: "Palm Desert, CA", x: 176.7, y: 156.4, resorts: [
        "Marriott's Desert Springs Villas", "Marriott's Shadow Ridge"
      ]},
      { name: "Newport Coast, CA", x: 172.8, y: 156.7, resorts: [
        "Marriott's Newport Coast Villas"
      ]},
      { name: "San Diego, CA", x: 174.4, y: 159.2, resorts: [
        "Marriott Vacation Club Pulse, San Diego"
      ]},
      { name: "Lake Tahoe, CA/NV", x: 166.7, y: 141.4, resorts: [
        "Marriott's Grand Residence Club", "Marriott's Timber Lodge"
      ]},
      { name: "Las Vegas, NV", x: 180.3, y: 149.4, resorts: [
        "Marriott's Grand Chateau"
      ]},
      { name: "Phoenix / Scottsdale, AZ", x: 189.2, y: 156.7, resorts: [
        "Marriott's Canyon Villas"
      ]},
      { name: "Park City, UT", x: 190.3, y: 137.2, resorts: [
        "Marriott's MountainSide", "Marriott's Summit Watch"
      ]},
      { name: "Vail / Avon / Breckenridge, CO", x: 204.4, y: 140.0, resorts: [
        "Marriott's StreamSide", "Marriott's Mountain Valley Lodge"
      ]},
      { name: "Branson, MO", x: 241.1, y: 148.3, resorts: [
        "Marriott's Willow Ridge Lodge"
      ]},
      { name: "O'ahu, HI", x: 61.4, y: 190.8, resorts: [
        "Marriott's Ko Olina Beach Club"
      ]},
    ]
  },
  caribbean: {
    label: "Caribbean",
    tone: "caribbean",
    pin: { x: 316.7, y: 200.0 },
    view: { x: 260.7, y: 157.2, w: 110, h: 100 },
    cities: [
      { name: "St. Thomas, USVI", x: 319.7, y: 199.2, resorts: [
        "Marriott's Frenchman's Cove", "Marriott's Frenchman's Reef"
      ]},
      { name: "St. Kitts", x: 325.8, y: 201.9, resorts: [
        "Marriott's St. Kitts Beach Club"
      ]},
      { name: "Aruba", x: 305.6, y: 215.3, resorts: [
        "Marriott's Aruba Ocean Club", "Marriott's Aruba Surf Club"
      ]},
    ]
  },
  europe: {
    label: "Europe",
    tone: "europe",
    pin: { x: 494.4, y: 141.7 },
    view: { x: 441.8, y: 94.3, w: 110, h: 100 },
    cities: [
      { name: "Marbella, Spain", x: 486.4, y: 148.6, resorts: [
        "Marriott's Marbella Beach Resort"
      ]},
      { name: "Mallorca, Spain", x: 507.2, y: 140.0, resorts: [
        "Marriott's Club Son Antem"
      ]},
    ]
  },
  sea: {
    label: "Southeast Asia",
    tone: "sea",
    pin: { x: 794.4, y: 238.9 },
    view: { x: 741.5, y: 199.6, w: 110, h: 100 },
    cities: [
      { name: "Phuket, Thailand", x: 773.3, y: 228.1, resorts: [
        "Marriott Vacation Club at Mai Khao Beach"
      ]},
      { name: "Khao Lak, Thailand", x: 773.1, y: 225.8, resorts: [
        "Marriott Vacation Club\u00ae, Khao Lak Beach Resort"
      ]},
      { name: "Bali, Indonesia", x: 820.0, y: 273.3, resorts: [
        "Marriott's Bali Nusa Dua Terrace", "Marriott's Bali Nusa Dua Gardens"
      ]},
    ]
  },
  australia: {
    label: "Australia",
    tone: "australia",
    pin: { x: 875.0, y: 319.4 },
    view: { x: 871.1, y: 277.8, w: 110, h: 100 },
    cities: [
      { name: "Gold Coast, Australia", x: 926.1, y: 327.8, resorts: [
        "Marriott Vacation Club at Surfers Paradise"
      ]},
    ]
  },
};

const svgNS = "http://www.w3.org/2000/svg";
let activeRegionKey = null;
let selectedCityPin = null;

function el(tag, attrs, children) {
  const node = document.createElementNS(svgNS, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  (children || []).forEach((c) => node.appendChild(c));
  return node;
}

function buildMap() {
  const regionLayer = document.getElementById("region-pins");
  const cityLayer = document.getElementById("city-pins");

  Object.entries(REGIONS).forEach(([key, region]) => {
    // Region pin
    const g = el("g", {
      class: `region-pin tone-${region.tone}`,
      "data-region": key,
      tabindex: "0",
      role: "button",
      "aria-label": `Zoom into ${region.label}`
    }, [
      el("circle", { class: "pin-pulse", cx: region.pin.x, cy: region.pin.y, r: 15 }),
      el("circle", { class: "pin-dot", cx: region.pin.x, cy: region.pin.y, r: 9 }),
      el("text", { class: "pin-label", x: region.pin.x, y: region.pin.y - 18 }, [
        document.createTextNode(region.label)
      ])
    ]);
    g.addEventListener("click", () => zoomToRegion(key));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zoomToRegion(key); }
    });
    regionLayer.appendChild(g);

    // City pins (hidden until region active)
    region.cities.forEach((city) => {
      const cg = el("g", {
        class: "city-pin",
        "data-region": key,
        tabindex: "-1",
        role: "button",
        "aria-label": `Show resorts in ${city.name}`
      }, [
        el("circle", { class: "pin-dot", cx: city.x, cy: city.y, r: 6 }),
        el("text", { class: "pin-label", x: city.x + 10, y: city.y + 4 }, [
          document.createTextNode(city.name)
        ])
      ]);
      cg.addEventListener("click", (e) => {
        e.stopPropagation();
        selectCity(cg, city, region);
      });
      cityLayer.appendChild(cg);
    });
  });
}

function computeTransform(view) {
  const canvasW = 1000, canvasH = 500;
  const scale = Math.min(canvasW / view.w, canvasH / view.h) * 1.0;
  const cx = view.x + view.w / 2;
  const cy = view.y + view.h / 2;
  const tx = canvasW / 2 - cx * scale;
  const ty = canvasH / 2 - cy * scale;
  return `translate(${tx}, ${ty}) scale(${scale})`;
}

function zoomToRegion(key) {
  const region = REGIONS[key];
  const zoomGroup = document.getElementById("zoom-group");
  const shell = document.getElementById("map-shell");
  activeRegionKey = key;
  closePanel();

  zoomGroup.style.transform = computeTransform(region.view);
  shell.setAttribute("data-active-region", key);

  document.querySelectorAll(".city-pin").forEach((pin) => {
    pin.classList.toggle("is-visible", pin.getAttribute("data-region") === key);
  });

  updateBreadcrumb(region.label);
  document.getElementById("btn-back").classList.add("visible");
}

function resetToWorld() {
  const zoomGroup = document.getElementById("zoom-group");
  const shell = document.getElementById("map-shell");
  activeRegionKey = null;
  closePanel();

  zoomGroup.style.transform = "translate(0px, 0px) scale(1)";
  shell.removeAttribute("data-active-region");

  document.querySelectorAll(".city-pin").forEach((pin) => pin.classList.remove("is-visible"));
  document.getElementById("btn-back").classList.remove("visible");
  updateBreadcrumb(null);
}

function updateBreadcrumb(regionLabel, cityLabel) {
  const bc = document.getElementById("breadcrumb");
  let html = `<span>World</span>`;
  if (regionLabel) {
    html += `<span class="sep">/</span><span class="${cityLabel ? "" : "crumb-current"}">${regionLabel}</span>`;
  }
  if (cityLabel) {
    html += `<span class="sep">/</span><span class="crumb-current">${cityLabel}</span>`;
  }
  bc.innerHTML = html;
}

function selectCity(pinEl, city, region) {
  if (selectedCityPin) selectedCityPin.classList.remove("is-selected");
  pinEl.classList.add("is-selected");
  selectedCityPin = pinEl;

  document.getElementById("panel-eyebrow").textContent = region.label;
  document.getElementById("panel-title").textContent = city.name;

  const list = document.getElementById("resort-list");
  list.innerHTML = "";
  city.resorts.forEach((name) => {
    const li = document.createElement("li");
    const nameSpan = document.createElement("span");
    nameSpan.className = "resort-name";
    nameSpan.textContent = name;
    const link = document.createElement("span");
    link.className = "resort-link";
    link.setAttribute("aria-disabled", "true");
    link.textContent = "Link soon";
    li.appendChild(nameSpan);
    li.appendChild(link);
    list.appendChild(li);
  });

  updateBreadcrumb(region.label, city.name);
  document.getElementById("resort-panel").classList.add("is-open");
}

function closePanel() {
  document.getElementById("resort-panel").classList.remove("is-open");
  if (selectedCityPin) {
    selectedCityPin.classList.remove("is-selected");
    selectedCityPin = null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  buildMap();
  document.getElementById("btn-back").addEventListener("click", resetToWorld);
  document.getElementById("panel-close").addEventListener("click", closePanel);

  // Hawaii inset: not part of the main projected map (too far from the
  // mainland cluster to frame both at once), so it's wired up separately
  // but opens the same resort popup as any other city pin.
  const hawaiiPin = document.getElementById("hawaii-pin");
  const oahuCity = REGIONS.us.cities.find((c) => c.name.startsWith("O'ahu"));
  if (hawaiiPin && oahuCity) {
    hawaiiPin.addEventListener("click", (e) => {
      e.stopPropagation();
      selectCity(hawaiiPin, oahuCity, REGIONS.us);
    });
    hawaiiPin.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hawaiiPin.click(); }
    });
  }

  updateBreadcrumb(null);
});
