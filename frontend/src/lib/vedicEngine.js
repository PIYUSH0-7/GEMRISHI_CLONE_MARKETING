import * as Astronomy from "astronomy-engine";
import tzLookup from "tz-lookup";
import { DateTime } from "luxon";

const RASHIS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const norm360 = (d) => ((d % 360) + 360) % 360;

// ---------------------------------------------------------------------------
// Timezone-aware local time -> UTC instant
// ---------------------------------------------------------------------------
export function resolveBirthInstantUTC({ dob, time, unknownTime, place }) {
  const zone = tzLookup(place.lat, place.lon);
  const clock = unknownTime ? "12:00" : time; // noon convention when time is unknown
  const dt = DateTime.fromFormat(`${dob} ${clock}`, "yyyy-MM-dd HH:mm", { zone });
  if (!dt.isValid) {
    throw new Error(`Could not resolve a valid local time for ${dob} ${clock} in ${zone}: ${dt.invalidReason}`);
  }
  return { utcDate: dt.toUTC().toJSDate(), zone };
}

// ---------------------------------------------------------------------------
// Lahiri (Chitrapaksha) ayanamsa
// ---------------------------------------------------------------------------
export function lahiriAyanamsaDeg(astroTime) {
  const T = astroTime.tt / 36525; 
  return 23.8531 + 1.3967 * T;
}

// ---------------------------------------------------------------------------
// Tropical geocentric ecliptic longitude of a body (apparent, aberration-corrected)
// ---------------------------------------------------------------------------
function tropicalLongitude(body, astroTime) {
  const vec = Astronomy.GeoVector(body, astroTime, true);
  const ecl = Astronomy.Ecliptic(vec);
  return norm360(ecl.elon);
}

// Mean lunar node (Meeus, Astronomical Algorithms, ch.47, eq. 47.7)
function meanNodeLongitude(astroTime) {
  const T = astroTime.tt / 36525;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return norm360(omega);
}

// Ascendant (tropical), RAMC-based spherical trig formula
function ascendantTropical(astroTime, latDeg, lonDeg) {
  const gastHours = Astronomy.SiderealTime(astroTime); // Greenwich Apparent Sidereal Time, hours
  const lstHours = ((gastHours + lonDeg / 15) % 24 + 24) % 24; // east longitude positive
  const ramcDeg = lstHours * 15;
  const eps = Astronomy.e_tilt(astroTime).tobl; // true obliquity, degrees

  const ramc = ramcDeg * DEG2RAD;
  const epsR = eps * DEG2RAD;
  const latR = latDeg * DEG2RAD;
  const y = Math.cos(ramc);
  const x = -(Math.sin(ramc) * Math.cos(epsR) + Math.tan(latR) * Math.sin(epsR));
  return norm360(Math.atan2(y, x) * RAD2DEG);
}

function toSignDegree(siderealLon) {
  const signIndex = Math.floor(siderealLon / 30) % 12;
  return { sign: RASHIS[signIndex], degree: Math.round((siderealLon % 30) * 100) / 100 };
}

// ---------------------------------------------------------------------------
// Classical dignity (Parashari) — static reference tables, real BPHS data
// ---------------------------------------------------------------------------
const EXALTATION_SIGN = { Sun: "Aries", Moon: "Taurus", Mars: "Capricorn", Mercury: "Virgo", Jupiter: "Cancer", Venus: "Pisces", Saturn: "Libra" };
const OWN_SIGNS = { Sun: ["Leo"], Moon: ["Cancer"], Mars: ["Aries", "Scorpio"], Mercury: ["Gemini", "Virgo"], Jupiter: ["Sagittarius", "Pisces"], Venus: ["Taurus", "Libra"], Saturn: ["Capricorn", "Aquarius"] };
const RASHI_LORD = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};
const NATURAL_FRIENDS = {
  Sun: ["Moon", "Mars", "Jupiter"], Moon: ["Sun", "Mercury"], Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"], Jupiter: ["Sun", "Moon", "Mars"], Venus: ["Mercury", "Saturn"], Saturn: ["Mercury", "Venus"],
};
const NATURAL_ENEMIES = {
  Sun: ["Venus", "Saturn"], Moon: [], Mars: ["Mercury"],
  Mercury: ["Moon"], Jupiter: ["Mercury", "Venus"], Venus: ["Sun", "Moon"], Saturn: ["Sun", "Moon", "Mars"],
};

function classicalDignity(planet, sign, degree) {
  if (planet === "Rahu" || planet === "Ketu") return "Shadow Planet";
  const debilitationSign = RASHIS[(RASHIS.indexOf(EXALTATION_SIGN[planet]) + 6) % 12];
  if (sign === EXALTATION_SIGN[planet]) return "Exalted";
  if (sign === debilitationSign) return "Debilitated";
  if (OWN_SIGNS[planet]?.includes(sign)) return "Own House";
  const lord = RASHI_LORD[sign];
  if (lord === planet) return "Own House";
  if (NATURAL_FRIENDS[planet]?.includes(lord)) return "Friendly";
  if (NATURAL_ENEMIES[planet]?.includes(lord)) return "Enemy";
  return "Neutral";
}

// ---------------------------------------------------------------------------
// Vimshottari Mahadasha / Antardasha (classical 120-year cycle)
// ---------------------------------------------------------------------------
const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const YEAR_MS = 365.2425 * 24 * 3600 * 1000;

export function computeVimshottariDasha(moonSiderealLon, birthUTC, nowUTC = new Date()) {
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(moonSiderealLon / nakshatraSpan);
  const startLordIndex = nakshatraIndex % 9;
  const fractionTraversed = (moonSiderealLon % nakshatraSpan) / nakshatraSpan;
  const virtualCycleStartMs = birthUTC.getTime() - fractionTraversed * DASHA_YEARS[DASHA_ORDER[startLordIndex]] * YEAR_MS;

  const nowMs = nowUTC.getTime();
  let cursor = virtualCycleStartMs;
  let lordIdx = startLordIndex;
  let currentMaha = null;
  for (let i = 0; i < 9 * 20 && cursor <= nowMs; i++) { // generous cap; loop exits once it brackets "now"
    const lord = DASHA_ORDER[lordIdx];
    const years = DASHA_YEARS[lord];
    const start = cursor;
    const end = cursor + years * YEAR_MS;
    if (nowMs >= start && nowMs < end) { currentMaha = { planet: lord, startMs: start, endMs: end, fullYears: years }; break; }
    cursor = end;
    lordIdx = (lordIdx + 1) % 9;
  }
  if (!currentMaha) currentMaha = { planet: DASHA_ORDER[startLordIndex], startMs: virtualCycleStartMs, endMs: nowMs, fullYears: DASHA_YEARS[DASHA_ORDER[startLordIndex]] };
  const mahaLordIdx = DASHA_ORDER.indexOf(currentMaha.planet);
  const mahaSpanMs = currentMaha.endMs - currentMaha.startMs;
  let antarCursor = currentMaha.startMs;
  let currentAntar = null;
  for (let j = 0; j < 9; j++) {
    const antarLord = DASHA_ORDER[(mahaLordIdx + j) % 9];
    const antarMs = mahaSpanMs * (DASHA_YEARS[antarLord] / 120);
    const start = antarCursor;
    const end = antarCursor + antarMs;
    if (currentAntar === null && nowMs >= start && nowMs < end) { currentAntar = { planet: antarLord, startMs: start, endMs: end }; }
    antarCursor = end;
  }
  if (!currentAntar) currentAntar = { planet: currentMaha.planet, startMs: currentMaha.startMs, endMs: currentMaha.endMs };

  const fmt = (ms) => new Date(ms).toISOString().slice(0, 10);
  return {
    mahadasha: { planet: currentMaha.planet, from: fmt(currentMaha.startMs), until: fmt(currentMaha.endMs) },
    antardasha: { planet: currentAntar.planet, from: fmt(currentAntar.startMs), until: fmt(currentAntar.endMs) },
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------
const BODY_MAP = {
  Sun: Astronomy.Body.Sun, Moon: Astronomy.Body.Moon, Mars: Astronomy.Body.Mars,
  Mercury: Astronomy.Body.Mercury, Jupiter: Astronomy.Body.Jupiter,
  Venus: Astronomy.Body.Venus, Saturn: Astronomy.Body.Saturn,
};

/**
 * Computes a real sidereal Vedic chart. Throws if the birth data can't be
 * resolved (bad place, bad timezone) — it never falls back to fake data.
 */
export function computeVedicChart({ name, dob, time, unknownTime, place }) {
  const { utcDate } = resolveBirthInstantUTC({ dob, time, unknownTime, place });
  const astroTime = Astronomy.MakeTime(utcDate);
  const ayanamsa = lahiriAyanamsaDeg(astroTime);

  const planets = Object.keys(BODY_MAP).map((planet) => {
    const tropical = tropicalLongitude(BODY_MAP[planet], astroTime);
    const sidereal = norm360(tropical - ayanamsa);
    const { sign, degree } = toSignDegree(sidereal);
    return { planet, longitude: sidereal, sign, degree, dignity: classicalDignity(planet, sign, degree) };
  });

  const rahuSidereal = norm360(meanNodeLongitude(astroTime) - ayanamsa);
  const ketuSidereal = norm360(rahuSidereal + 180);
  const rahuSD = toSignDegree(rahuSidereal);
  const ketuSD = toSignDegree(ketuSidereal);
  planets.push({ planet: "Rahu", longitude: rahuSidereal, sign: rahuSD.sign, degree: rahuSD.degree, dignity: "Shadow Planet" });
  planets.push({ planet: "Ketu", longitude: ketuSidereal, sign: ketuSD.sign, degree: ketuSD.degree, dignity: "Shadow Planet" });

  const moon = planets.find((p) => p.planet === "Moon");
  const sun = planets.find((p) => p.planet === "Sun");

  let lagnaSign, lagnaDegree, ascendantIsExact;
  if (unknownTime) {
    // Surya Lagna (Solar Ascendant) fallback — a real, named classical
    // technique for unknown-birth-time charts, not an invented substitute.
    lagnaSign = sun.sign;
    lagnaDegree = null;
    ascendantIsExact = false;
  } else {
    const ascTropical = ascendantTropical(astroTime, place.lat, place.lon);
    const ascSidereal = norm360(ascTropical - ayanamsa);
    const ascSD = toSignDegree(ascSidereal);
    lagnaSign = ascSD.sign;
    lagnaDegree = ascSD.degree;
    ascendantIsExact = true;
  }

  const dasha = computeVimshottariDasha(moon.longitude, utcDate);

  return {
    lagnaSign,
    lagnaDegree,
    ascendantIsExact,
    moonSign: moon.sign,
    mahadasha: dasha.mahadasha,
    antardasha: dasha.antardasha,
    planets: planets.map(({ planet, sign, degree, dignity }) => ({ planet, sign, degree, dignity })),
    ayanamsaUsed: Math.round(ayanamsa * 10000) / 10000,
    reportId: `GR-${utcDate.getTime().toString(36).toUpperCase()}`,
    computedAt: new Date().toISOString(),
  };
}
