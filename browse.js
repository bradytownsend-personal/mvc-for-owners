/* ===========================================================
   Resort Browser — browse.js
   Full resort list, sourced from marriottvacationclubs.com's
   official resort directory (July 2026). City/state assignments
   are accurate to the resort's actual location; category
   (Coastal / Theme Park / City Collection / Mountains / Desert &
   Golf) is a best-guess fit based on each resort's setting and
   is flagged where it's a closer call — easy to correct below.
   =========================================================== */

const REGION_META = {
  us: { label: "United States" },
  caribbean: { label: "Caribbean & Latin America" },
  europe: { label: "Europe" },
  asia: { label: "Asia" },
  australia: { label: "Australia" },
};

const CATEGORY_META = {
  coastal: { label: "Coastal", blurb: "Beachfront and island resorts." },
  themepark: { label: "Theme Park", blurb: "Near major theme park destinations." },
  city: { label: "City Collection", blurb: "Urban, hotel-style stays." },
  mountains: { label: "Mountains", blurb: "Ski towns and mountain resorts." },
  desertgolf: { label: "Desert & Golf", blurb: "Desert resorts and golf-centered properties." },
};

const STATE_META = {
  AZ: "Arizona", CA: "California", CO: "Colorado", DC: "Washington, D.C.",
  FL: "Florida", HI: "Hawaii", MA: "Massachusetts", MO: "Missouri",
  NJ: "New Jersey", NV: "Nevada", NY: "New York", SC: "South Carolina",
  UT: "Utah", VA: "Virginia",
};

const BRAND_META = {
  marriott: { label: "Marriott" },
  sheraton: { label: "Sheraton" },
  westin: { label: "Westin" },
};

// Brand isn't stored per-resort — derived from the name so every resort
// (including Ritz-Carlton Club and Vistana properties, both part of the
// Marriott portfolio) always resolves to one of the three brand buckets.
// Explicit overrides for resorts whose name doesn't reflect their
// operating brand (checked before the substring fallback below).
const BRAND_OVERRIDES = {
  "Harborside Resort at Atlantis": "sheraton",
  "Vistana Beach Club": "sheraton",
};

function getBrand(name) {
  if (BRAND_OVERRIDES[name]) return BRAND_OVERRIDES[name];
  if (name.includes("Sheraton")) return "sheraton";
  if (name.includes("Westin")) return "westin";
  return "marriott";
}

const RESORTS = [
  { name: "Marriott's Canyon Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-canyon-villas.html", city: "Phoenix / Scottsdale", state: "AZ", region: "us", category: "desertgolf", flag: false },
  { name: "Sheraton Desert Oasis", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/sheraton-desert-oasis.html", city: "Phoenix / Scottsdale", state: "AZ", region: "us", category: "desertgolf", flag: false },
  { name: "The Westin Kierland Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-kierland-villas.html", city: "Phoenix / Scottsdale", state: "AZ", region: "us", category: "desertgolf", flag: false },
  { name: "Marriott Grand Residence Club® 1, Lake Tahoe", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-grand-residence-club-1-lake-tahoe.html", city: "Lake Tahoe", state: "CA", region: "us", category: "mountains", flag: false },
  { name: "Marriott Grand Residence Club® 2, Lake Tahoe", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-grand-residence-club-2-lake-tahoe.html", city: "Lake Tahoe", state: "CA", region: "us", category: "mountains", flag: false },
  { name: "Marriott Vacation Club®, San Diego", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-san-diego.html", city: "San Diego", state: "CA", region: "us", category: "city", flag: false },
  { name: "Marriott Vacation Club®, San Francisco", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-san-francisco.html", city: "San Francisco", state: "CA", region: "us", category: "city", flag: false },
  { name: "Marriott's Desert Springs Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-desert-springs-villas.html", city: "Palm Desert", state: "CA", region: "us", category: "desertgolf", flag: false },
  { name: "Marriott's Desert Springs Villas II", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-desert-springs-villas-ii.html", city: "Palm Desert", state: "CA", region: "us", category: "desertgolf", flag: false },
  { name: "Marriott's Newport Coast® Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-newport-coast-villas.html", city: "Newport Coast", state: "CA", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Shadow Ridge", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-shadow-ridge.html", city: "Palm Desert", state: "CA", region: "us", category: "desertgolf", flag: false },
  { name: "Marriott's Shadow Ridge II – The Enclaves", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-shadow-ridge-ii-the-enclaves.html", city: "Palm Desert", state: "CA", region: "us", category: "desertgolf", flag: false },
  { name: "Marriott's Timber Lodge®", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-timber-lodge.html", city: "Lake Tahoe", state: "CA", region: "us", category: "mountains", flag: false },
  { name: "The Ritz-Carlton Club® and Residences, San Francisco", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-ritz-carlton-club-and-residences-san-francisco.html", city: "San Francisco", state: "CA", region: "us", category: "city", flag: false },
  { name: "The Ritz-Carlton Club®, Lake Tahoe", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-ritz-carlton-club-lake-tahoe.html", city: "Lake Tahoe", state: "CA", region: "us", category: "mountains", flag: false },
  { name: "The Westin Desert Willow Villas, Palm Desert", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-desert-willow-villas-palm-desert.html", city: "Palm Desert", state: "CA", region: "us", category: "desertgolf", flag: false },
  { name: "The Westin Mission Hills Resort Villas, Palm Springs", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-mission-hills-resort-villas-palm-springs.html", city: "Palm Springs", state: "CA", region: "us", category: "desertgolf", flag: false },
  { name: "Marriott's Mountain Valley Lodge", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-mountain-valley-lodge.html", city: "Breckenridge", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "Marriott's StreamSide – Birch", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-streamside-birch.html", city: "Vail / Avon", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "Marriott's StreamSide – Douglas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-streamside-douglas.html", city: "Vail / Avon", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "Marriott's StreamSide – Evergreen", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-streamside-evergreen.html", city: "Vail / Avon", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "Sheraton Lakeside Terrace Villas at Mountain Vista", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/sheraton-lakeside-terrace-villas-at-mountain-vista.html", city: "Avon", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "Sheraton Mountain Vista", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/sheraton-mountain-vista.html", city: "Avon", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "Sheraton Steamboat Resort Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/sheraton-steamboat-resort-villas.html", city: "Steamboat Springs", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "The Ritz-Carlton Club®, Aspen Highlands", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-ritz-carlton-club-aspen-highlands.html", city: "Aspen", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "The Ritz-Carlton Club®, Vail", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-ritz-carlton-club-vail.html", city: "Vail / Avon", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "The Westin Riverfront Mountain Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-riverfront-mountain-villas.html", city: "Avon", state: "CO", region: "us", category: "mountains", flag: false },
  { name: "Marriott Vacation Club®, South Beach", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-south-beach.html", city: "Miami Beach", state: "FL", region: "us", category: "coastal", flag: false },
  { name: "Marriott's BeachPlace Towers", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-beachplace-towers.html", city: "Fort Lauderdale", state: "FL", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Crystal Shores", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-crystal-shores.html", city: "Marco Island", state: "FL", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Cypress Harbour", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-cypress-harbour.html", city: "Orlando", state: "FL", region: "us", category: "themepark", flag: false },
  { name: "Marriott's Grande Vista", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-grande-vista.html", city: "Orlando", state: "FL", region: "us", category: "themepark", flag: false },
  { name: "Marriott's Harbour Lake", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-harbour-lake.html", city: "Orlando", state: "FL", region: "us", category: "themepark", flag: false },
  { name: "Marriott's Imperial Palms", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-imperial-palms.html", city: "Orlando", state: "FL", region: "us", category: "themepark", flag: false },
  { name: "Marriott's Lakeshore Reserve", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-lakeshore-reserve.html", city: "Orlando", state: "FL", region: "us", category: "themepark", flag: false },
  { name: "Marriott's Legends Edge at Bay Point", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-legends-edge-at-bay-point.html", city: "Panama City Beach", state: "FL", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Ocean Pointe", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-ocean-pointe.html", city: "Palm Beach Shores", state: "FL", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Oceana Palms", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-oceana-palms.html", city: "Singer Island", state: "FL", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Royal Palms", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-royal-palms.html", city: "Orlando", state: "FL", region: "us", category: "themepark", flag: false },
  { name: "Marriott's Sabal Palms", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-sabal-palms.html", city: "Orlando", state: "FL", region: "us", category: "themepark", flag: false },
  { name: "Marriott's Villas at Doral", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-villas-at-doral.html", city: "Doral", state: "FL", region: "us", category: "desertgolf", flag: true },
  { name: "Sheraton PGA Vacation Resort", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/sheraton-pga-vacation-resort.html", city: "Port St. Lucie", state: "FL", region: "us", category: "desertgolf", flag: false },
  { name: "Sheraton Vistana Resort", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/sheraton-vistana-resort.html", city: "Orlando", state: "FL", region: "us", category: "themepark", flag: false },
  { name: "Sheraton Vistana Villages", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/sheraton-vistana-villages.html", city: "Orlando", state: "FL", region: "us", category: "themepark", flag: false },
  { name: "Vistana Beach Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/vistana-beach-club.html", city: "Fort Lauderdale", state: "FL", region: "us", category: "coastal", flag: true },
  { name: "Marriott Vacation Club®, Waikīkī", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-waikiki.html", city: "Waikīkī, O'ahu", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Kauaʻi Beach Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-kauai-beach-club.html", city: "Kauaʻi", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Kauaʻi Lagoons – Kalanipuʻu", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-kauai-lagoons-kalanipuu.html", city: "Kauaʻi", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Ko Olina Beach Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-ko-olina-beach-club.html", city: "O'ahu", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Maui Ocean Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-maui-ocean-club-lahaina-and-napili-towers.html", city: "Maui", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Maui Ocean Club – Molokai, Maui, and Lanai Towers", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-maui-ocean-club.html", city: "Maui", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Waikoloa Ocean Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-waikoloa-ocean-club.html", city: "Big Island", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Waiohai Beach Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-waiohai-beach-club.html", city: "Kauaʻi", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "Sheraton Kauaʻi Resort Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/sheraton-kauai-resort.html", city: "Kauaʻi", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "The Westin Kāʻanapali Ocean Resort Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-kaanapali-ocean-resort-villas.html", city: "Maui", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "The Westin Kāʻanapali Ocean Resort Villas North", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-kaanapali-ocean-resort-villas-north.html", city: "Maui", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "The Westin Nanea Ocean Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-nanea-ocean-villas.html", city: "Maui", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "The Westin Princeville Ocean Resort Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-princeville-ocean-resort-villas.html", city: "Kauaʻi", state: "HI", region: "us", category: "coastal", flag: false },
  { name: "Marriott Vacation Club® at Custom House, Boston", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-at-custom-house-boston.html", city: "Boston", state: "MA", region: "us", category: "city", flag: false },
  { name: "Marriott's Willow Ridge Lodge", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-willow-ridge-lodge.html", city: "Branson", state: "MO", region: "us", category: "themepark", flag: true },
  { name: "Marriott's Grand Chateau®", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-grand-chateau.html", city: "Las Vegas", state: "NV", region: "us", category: "city", flag: false },
  { name: "Marriott's Fairway Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-fairway-villas.html", city: "New Jersey", state: "NJ", region: "us", category: "desertgolf", flag: true },
  { name: "Marriott Vacation Club®, New York City", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-new-york-city.html", city: "New York City", state: "NY", region: "us", category: "city", flag: false },
  { name: "Marriott's Barony Beach Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-barony-beach-club.html", city: "Hilton Head Island", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Grande Ocean", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-grande-ocean.html", city: "Hilton Head Island", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Harbour Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-harbour-club.html", city: "Hilton Head Island", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Harbour Point", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-harbour-point.html", city: "Hilton Head Island", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Heritage Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-heritage-club.html", city: "Hilton Head Island", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Monarch", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-monarch.html", city: "Hilton Head Island", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Marriott's OceanWatch", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-oceanwatch.html", city: "Myrtle Beach", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Marriott's Sunset Pointe", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-sunset-pointe.html", city: "Hilton Head Island", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Marriott's SurfWatch®", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-surfwatch.html", city: "Hilton Head Island", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Sheraton Broadway Resort", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/sheraton-broadway-resort.html", city: "Myrtle Beach", state: "SC", region: "us", category: "coastal", flag: false },
  { name: "Marriott's MountainSide", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-mountainside.html", city: "Park City", state: "UT", region: "us", category: "mountains", flag: false },
  { name: "Marriott's Summit Watch", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-summit-watch.html", city: "Park City", state: "UT", region: "us", category: "mountains", flag: false },
  { name: "Marriott's Manor Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-manor-club.html", city: "Williamsburg", state: "VA", region: "us", category: "themepark", flag: true },
  { name: "Marriott's Manor Club – Sequel", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-manor-club-sequel.html", city: "Williamsburg", state: "VA", region: "us", category: "themepark", flag: true },
  { name: "Marriott Vacation Club® at The Mayflower, Washington, D.C.", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-at-the-mayflower-washington-dc.html", city: "Washington, D.C.", state: "DC", region: "us", category: "city", flag: false },
  { name: "The Westin Los Cabos Resort Villas & Spa", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-los-cabos-resort-villas-spa.html", city: "Los Cabos, Mexico", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "The Westin Los Cabos Resort Villas & Spa Baja Point", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-los-cabos-resort-villas-spa-baja-point.html", city: "Los Cabos, Mexico", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "The Westin Lagunamar Ocean Resort", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-lagunamar-ocean-resort.html", city: "Cancún, Mexico", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "Marriott's Aruba Ocean Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-aruba-ocean-club.html", city: "Aruba", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "Marriott's Aruba Surf Club®", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-aruba-surf-club.html", city: "Aruba", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "Marriott's St. Kitts Beach Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-st-kitts-beach-club.html", city: "St. Kitts", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "Harborside Resort at Atlantis", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/harborside-resort-at-atlantis.html", city: "Nassau, Bahamas", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "Marriott's Frenchman's Cove", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-frenchmans-cove.html", city: "St. Thomas, USVI", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "The Ritz-Carlton Club®, St. Thomas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-ritz-carlton-club-st-thomas.html", city: "St. Thomas, USVI", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "The Westin St. John Resort Villas", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/the-westin-st-john-resort-villas.html", city: "St. John, USVI", state: null, region: "caribbean", category: "coastal", flag: false },
  { name: "Marriott Vacation Club® at Los Sueños", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-at-los-suenos.html", city: "Los Sueños, Costa Rica", state: null, region: "caribbean", category: "coastal", flag: true },
  { name: "Marriott's Village d'Ile-de-France", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-village-dile-de-france.html", city: "Île-de-France, France", state: null, region: "europe", category: "themepark", flag: false },
  { name: "Marriott's Club Son Antem", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-club-son-antem.html", city: "Mallorca, Spain", state: null, region: "europe", category: "desertgolf", flag: false },
  { name: "Marriott's Marbella Beach Resort", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-marbella-beach-resort.html", city: "Marbella, Spain", state: null, region: "europe", category: "coastal", flag: false },
  { name: "Marriott's Playa Andaluza", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-playa-andaluza.html", city: "Estepona, Spain", state: null, region: "europe", category: "coastal", flag: false },
  { name: "Marriott's Bali Nusa Dua Gardens", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-bali-nusa-dua-gardens.html", city: "Bali, Indonesia", state: null, region: "asia", category: "coastal", flag: false },
  { name: "Marriott's Bali Nusa Dua Terrace", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-bali-nusa-dua-terrace.html", city: "Bali, Indonesia", state: null, region: "asia", category: "coastal", flag: false },
  { name: "Marriott Vacation Club® at The Empire Place©, Bangkok", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-at-the-empire-place.html", city: "Bangkok, Thailand", state: null, region: "asia", category: "city", flag: false },
  { name: "Marriott Vacation Club®, Khao Lak Beach Resort", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-khao-lak-beach-resort.html", city: "Khao Lak, Thailand", state: null, region: "asia", category: "coastal", flag: false },
  { name: "Marriott's Mai Khao Resort – Phuket", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-mai-khao-resort-phuket.html", city: "Phuket, Thailand", state: null, region: "asia", category: "coastal", flag: false },
  { name: "Marriott's Phuket Beach Club", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriotts-phuket-beach-club.html", city: "Phuket, Thailand", state: null, region: "asia", category: "coastal", flag: false },
  { name: "Marriott Vacation Club® at Surfers Paradise", url: "https://www.marriottvacationclubs.com/content/tmvcs/us/en/experiences/resorts/marriott-vacation-club-at-surfers-paradise.html", city: "Gold Coast, Australia", state: null, region: "australia", category: "coastal", flag: false },
];
// ---------------- Navigation state ----------------
const nav = { mode: null, region: null, state: null, category: null, brand: null };

function resetNav() {
  nav.mode = null; nav.region = null; nav.state = null; nav.category = null; nav.brand = null;
  render();
}

function goBack() {
  if (nav.state !== null) { nav.state = null; }
  else if (nav.category !== null) { nav.category = null; }
  else if (nav.brand !== null) { nav.brand = null; }
  else if (nav.region !== null) { nav.region = null; }
  else { nav.mode = null; }
  render();
}

// ---------------- Helpers ----------------
function groupBy(list, keyFn) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.appendChild(c));
  return node;
}

function tile(title, opts = {}) {
  const t = el("button", { class: "browse-tile", type: "button", onclick: opts.onClick || (() => {}) });
  const head = el("div", { class: "browse-tile-head" });
  head.appendChild(el("span", { class: "browse-tile-title", text: title }));
  if (opts.count !== undefined) {
    head.appendChild(el("span", { class: "browse-tile-count", text: opts.count }));
  }
  t.appendChild(head);
  if (opts.sub) t.appendChild(el("p", { class: "browse-tile-sub", text: opts.sub }));
  return t;
}

function resortListing(resorts, groupFn) {
  const wrap = el("div", { class: "resort-groups" });
  const groups = groupBy(resorts, groupFn);
  [...groups.entries()].forEach(([label, items]) => {
    const group = el("div", { class: "resort-group" });
    group.appendChild(el("p", { class: "resort-group-label", text: `${label} (${items.length})` }));
    const list = el("ul", { class: "resort-group-list" });
    items.forEach((r) => {
      const li = el("li");
      li.appendChild(el("span", { class: "resort-name", text: r.name }));
      li.appendChild(el("a", {
        class: "resort-link", href: r.url, target: "_blank", rel: "noopener noreferrer", text: "View resort ↗"
      }));
      list.appendChild(li);
    });
    group.appendChild(list);
    wrap.appendChild(group);
  });
  return wrap;
}

// Flat, alphabetized — no per-city/region grouping. Used for brand results.
function flatResortListing(resorts) {
  const sorted = [...resorts].sort((a, b) => a.name.localeCompare(b.name));
  const wrap = el("div", { class: "resort-groups flat" });
  const group = el("div", { class: "resort-group" });
  const list = el("ul", { class: "resort-group-list" });
  sorted.forEach((r) => {
    const li = el("li");
    li.appendChild(el("span", { class: "resort-name", text: r.name }));
    li.appendChild(el("a", {
      class: "resort-link", href: r.url, target: "_blank", rel: "noopener noreferrer", text: "View resort ↗"
    }));
    list.appendChild(li);
  });
  group.appendChild(list);
  wrap.appendChild(group);
  return wrap;
}

// ---------------- Render ----------------
function render() {
  const content = document.getElementById("browse-content");
  content.innerHTML = "";
  document.getElementById("btn-back").classList.toggle("visible", nav.mode !== null);
  renderBreadcrumb();

  // Level 0: choose mode
  if (nav.mode === null) {
    const grid = el("div", { class: "browse-grid browse-grid-3" });
    grid.appendChild(tile("By Location", {
      sub: "Start with a region, then narrow down.",
      onClick: () => { nav.mode = "location"; render(); }
    }));
    grid.appendChild(tile("By Category", {
      sub: "Start with a type of trip.",
      onClick: () => { nav.mode = "category"; render(); }
    }));
    grid.appendChild(tile("By Brand", {
      sub: "Start with Marriott, Sheraton, or Westin.",
      onClick: () => { nav.mode = "brand"; render(); }
    }));
    content.appendChild(grid);
    return;
  }

  // ---------------- Location branch ----------------
  if (nav.mode === "location") {
    if (nav.region === null) {
      const grid = el("div", { class: "browse-grid browse-grid-3" });
      Object.entries(REGION_META).forEach(([key, meta]) => {
        const count = RESORTS.filter((r) => r.region === key).length;
        grid.appendChild(tile(meta.label, {
          count,
          onClick: () => { nav.region = key; render(); }
        }));
      });
      content.appendChild(grid);
      return;
    }

    if (nav.region === "us" && nav.state === null) {
      const grid = el("div", { class: "browse-grid browse-grid-4" });
      const usResorts = RESORTS.filter((r) => r.region === "us");
      const byState = groupBy(usResorts, (r) => r.state);
      [...byState.keys()].sort((a, b) => STATE_META[a].localeCompare(STATE_META[b])).forEach((code) => {
        grid.appendChild(tile(STATE_META[code], {
          count: byState.get(code).length,
          onClick: () => { nav.state = code; render(); }
        }));
      });
      content.appendChild(grid);
      return;
    }

    // Final listing: either a US state, or a non-US region
    let resorts, heading;
    if (nav.region === "us") {
      resorts = RESORTS.filter((r) => r.region === "us" && r.state === nav.state);
      heading = STATE_META[nav.state];
    } else {
      resorts = RESORTS.filter((r) => r.region === nav.region);
      heading = REGION_META[nav.region].label;
    }
    content.appendChild(el("h2", { class: "browse-result-heading", text: `${heading} (${resorts.length})` }));
    content.appendChild(resortListing(resorts, (r) => r.city));
    return;
  }

  // ---------------- Category branch ----------------
  if (nav.mode === "category") {
    if (nav.category === null) {
      const grid = el("div", { class: "browse-grid browse-grid-3" });
      Object.entries(CATEGORY_META).forEach(([key, meta]) => {
        const count = RESORTS.filter((r) => r.category === key).length;
        grid.appendChild(tile(meta.label, {
          count,
          sub: meta.blurb,
          onClick: () => { nav.category = key; render(); }
        }));
      });
      content.appendChild(grid);
      return;
    }

    const resorts = RESORTS.filter((r) => r.category === nav.category);
    const flagged = resorts.some((r) => r.flag);
    content.appendChild(el("h2", { class: "browse-result-heading", text: `${CATEGORY_META[nav.category].label} (${resorts.length})` }));
    if (flagged) {
      content.appendChild(el("p", { class: "browse-flag-note", text: "A few resorts in this list are a best-guess fit for this category — flag anything that looks off and we'll fix it." }));
    }
    content.appendChild(resortListing(resorts, (r) => {
      const region = REGION_META[r.region].label;
      return r.region === "us" ? `${r.city}, ${r.state}` : `${r.city} \u2014 ${region}`;
    }));
    return;
  }

  // ---------------- Brand branch ----------------
  if (nav.mode === "brand") {
    if (nav.brand === null) {
      const grid = el("div", { class: "browse-grid browse-grid-3" });
      Object.entries(BRAND_META).forEach(([key, meta]) => {
        const count = RESORTS.filter((r) => getBrand(r.name) === key).length;
        grid.appendChild(tile(meta.label, {
          count,
          onClick: () => { nav.brand = key; render(); }
        }));
      });
      content.appendChild(grid);
      return;
    }

    const resorts = RESORTS.filter((r) => getBrand(r.name) === nav.brand);
    content.appendChild(el("h2", { class: "browse-result-heading", text: `${BRAND_META[nav.brand].label} (${resorts.length})` }));
    content.appendChild(flatResortListing(resorts));
    return;
  }
}

function renderBreadcrumb() {
  const bc = document.getElementById("breadcrumb");
  const parts = ["Browse"];
  if (nav.mode === "location") {
    parts.push("By Location");
    if (nav.region) parts.push(REGION_META[nav.region].label);
    if (nav.state) parts.push(STATE_META[nav.state]);
  } else if (nav.mode === "category") {
    parts.push("By Category");
    if (nav.category) parts.push(CATEGORY_META[nav.category].label);
  } else if (nav.mode === "brand") {
    parts.push("By Brand");
    if (nav.brand) parts.push(BRAND_META[nav.brand].label);
  }
  bc.innerHTML = parts
    .map((p, i) => i === parts.length - 1 ? `<span class="crumb-current">${p}</span>` : `<span>${p}</span>`)
    .join('<span class="sep">/</span>');
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-back").addEventListener("click", goBack);
  document.getElementById("btn-start-over").addEventListener("click", resetNav);
  render();
});
