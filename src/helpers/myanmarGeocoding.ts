// Comprehensive Myanmar cities and operational regions database for offline reverse-geocoding

export interface MyanmarLocationInfo {
  city: string;
  state_division: string;
}

interface KnownPoint {
  city: string;
  state_division: string;
  lat: number;
  lng: number;
}

// Bounding box for Myanmar states and regions (latMin, latMax, lngMin, lngMax)
interface RegionBox {
  state_division: string;
  defaultCity: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

const REGION_BOUNDS: RegionBox[] = [
  // Naypyidaw (checked early due to being surrounded by Mandalay/Bago/Shan)
  { state_division: "Naypyidaw", defaultCity: "Naypyidaw", latMin: 19.45, latMax: 20.25, lngMin: 95.85, lngMax: 96.45 },

  // Yangon Region
  { state_division: "Yangon Region", defaultCity: "Yangon", latMin: 16.35, latMax: 17.55, lngMin: 95.75, lngMax: 96.65 },

  // Bago Region
  { state_division: "Bago Region", defaultCity: "Bago", latMin: 16.85, latMax: 19.45, lngMin: 94.80, lngMax: 97.20 },

  // Ayeyarwady Region
  { state_division: "Ayeyarwady Region", defaultCity: "Pathein", latMin: 15.65, latMax: 18.05, lngMin: 94.15, lngMax: 95.95 },

  // Magway Region (Central oil & gas operations)
  { state_division: "Magway Region", defaultCity: "Magway", latMin: 18.85, latMax: 22.25, lngMin: 93.85, lngMax: 95.85 },

  // Mandalay Region
  { state_division: "Mandalay Region", defaultCity: "Mandalay", latMin: 19.55, latMax: 22.65, lngMin: 95.30, lngMax: 96.85 },

  // Rakhine State (Offshore gas & coastal facilities)
  { state_division: "Rakhine State", defaultCity: "Sittwe", latMin: 17.35, latMax: 21.85, lngMin: 91.50, lngMax: 94.60 },

  // Sagaing Region
  { state_division: "Sagaing Region", defaultCity: "Monywa", latMin: 21.50, latMax: 27.85, lngMin: 93.80, lngMax: 96.30 },

  // Shan State
  { state_division: "Shan State", defaultCity: "Taunggyi", latMin: 19.30, latMax: 24.50, lngMin: 96.30, lngMax: 101.30 },

  // Mon State
  { state_division: "Mon State", defaultCity: "Mawlamyine", latMin: 14.85, latMax: 17.65, lngMin: 96.85, lngMax: 98.45 },

  // Kayin State
  { state_division: "Kayin State", defaultCity: "Hpa-an", latMin: 15.20, latMax: 19.50, lngMin: 96.70, lngMax: 98.90 },

  // Tanintharyi Region (Southern offshore pipelines)
  { state_division: "Tanintharyi Region", defaultCity: "Dawei", latMin: 9.60, latMax: 15.30, lngMin: 97.70, lngMax: 99.20 },

  // Kachin State
  { state_division: "Kachin State", defaultCity: "Myitkyina", latMin: 23.40, latMax: 28.85, lngMin: 95.80, lngMax: 98.90 },

  // Kayah State
  { state_division: "Kayah State", defaultCity: "Loikaw", latMin: 18.50, latMax: 19.90, lngMin: 96.80, lngMax: 97.90 },

  // Chin State
  { state_division: "Chin State", defaultCity: "Hakha", latMin: 20.60, latMax: 24.20, lngMin: 93.00, lngMax: 94.40 },
];

// Curated reference database of Myanmar cities, towns, and key oil/gas operation locations
const MYANMAR_POINTS: KnownPoint[] = [
  // --- Yangon Region ---
  { city: "Yangon", state_division: "Yangon Region", lat: 16.8409, lng: 96.1735 },
  { city: "Thanlyin", state_division: "Yangon Region", lat: 16.7456, lng: 96.2526 },
  { city: "Insein", state_division: "Yangon Region", lat: 16.8920, lng: 96.0963 },
  { city: "Hmawbi", state_division: "Yangon Region", lat: 17.1082, lng: 95.9984 },
  { city: "Taikkyi", state_division: "Yangon Region", lat: 17.3083, lng: 95.9733 },
  { city: "Kyauktada", state_division: "Yangon Region", lat: 16.7744, lng: 96.1585 },
  { city: "Twante", state_division: "Yangon Region", lat: 16.7114, lng: 95.9322 },

  // --- Bago Region ---
  { city: "Bago", state_division: "Bago Region", lat: 17.3221, lng: 96.4664 },
  { city: "Pyay", state_division: "Bago Region", lat: 18.8242, lng: 95.2147 },
  { city: "Taungoo", state_division: "Bago Region", lat: 18.9422, lng: 96.4354 },
  { city: "Nattalin", state_division: "Bago Region", lat: 18.5833, lng: 95.5333 },
  { city: "Tharrawaddy", state_division: "Bago Region", lat: 17.6500, lng: 95.7833 },
  { city: "Daik-U", state_division: "Bago Region", lat: 17.8000, lng: 96.6833 },
  { city: "Shwedaung", state_division: "Bago Region", lat: 18.7000, lng: 95.2167 },
  { city: "Kawa", state_division: "Bago Region", lat: 17.0833, lng: 96.4667 },
  { city: "Waw", state_division: "Bago Region", lat: 17.4722, lng: 96.6778 },
  { city: "Paungde", state_division: "Bago Region", lat: 18.4833, lng: 95.5000 },
  { city: "Yedashe", state_division: "Bago Region", lat: 19.1667, lng: 96.2667 },

  // --- Naypyidaw ---
  { city: "Naypyidaw", state_division: "Naypyidaw", lat: 19.7633, lng: 96.0785 },
  { city: "Pyinmana", state_division: "Naypyidaw", lat: 19.7378, lng: 96.2089 },
  { city: "Lewe", state_division: "Naypyidaw", lat: 19.6333, lng: 96.2167 },
  { city: "Tatkon", state_division: "Naypyidaw", lat: 20.1333, lng: 96.2000 },

  // --- Mandalay Region ---
  { city: "Mandalay", state_division: "Mandalay Region", lat: 21.9588, lng: 96.0891 },
  { city: "Pyin Oo Lwin", state_division: "Mandalay Region", lat: 22.0366, lng: 96.4633 },
  { city: "Meiktila", state_division: "Mandalay Region", lat: 20.8786, lng: 95.8611 },
  { city: "Myingyan", state_division: "Mandalay Region", lat: 21.4608, lng: 95.3906 },
  { city: "Kyaukse", state_division: "Mandalay Region", lat: 21.6039, lng: 96.1331 },
  { city: "Nyaung-U", state_division: "Mandalay Region", lat: 21.1969, lng: 94.9089 },
  { city: "Yamethin", state_division: "Mandalay Region", lat: 20.4333, lng: 96.1500 },
  { city: "Mogok", state_division: "Mandalay Region", lat: 22.9167, lng: 96.5000 },

  // --- Magway Region (Key Oil & Gas Operational Hubs) ---
  { city: "Magway", state_division: "Magway Region", lat: 20.1544, lng: 94.9455 },
  { city: "Chauk", state_division: "Magway Region", lat: 20.8986, lng: 94.8219 },
  { city: "Yenangyaung", state_division: "Magway Region", lat: 20.4633, lng: 94.8778 },
  { city: "Minbu", state_division: "Magway Region", lat: 20.1783, lng: 94.8767 },
  { city: "Pakokku", state_division: "Magway Region", lat: 21.3325, lng: 95.0789 },
  { city: "Thayet", state_division: "Magway Region", lat: 19.3167, lng: 95.1833 },
  { city: "Taungdwingyi", state_division: "Magway Region", lat: 20.0000, lng: 95.5333 },
  { city: "Aunglan", state_division: "Magway Region", lat: 19.3667, lng: 95.2167 },
  { city: "Gangaw", state_division: "Magway Region", lat: 22.1667, lng: 94.1333 },
  { city: "Natmauk", state_division: "Magway Region", lat: 20.4167, lng: 95.4167 },
  { city: "Yesagyo", state_division: "Magway Region", lat: 21.6167, lng: 95.2500 },

  // --- Ayeyarwady Region ---
  { city: "Pathein", state_division: "Ayeyarwady Region", lat: 16.7792, lng: 94.7324 },
  { city: "Hinthada", state_division: "Ayeyarwady Region", lat: 17.6500, lng: 95.4667 },
  { city: "Maubin", state_division: "Ayeyarwady Region", lat: 16.7333, lng: 95.6500 },
  { city: "Myaungmya", state_division: "Ayeyarwady Region", lat: 16.6000, lng: 94.9333 },
  { city: "Pyapon", state_division: "Ayeyarwady Region", lat: 16.2833, lng: 95.6833 },
  { city: "Labutta", state_division: "Ayeyarwady Region", lat: 16.1500, lng: 94.7667 },
  { city: "Bogale", state_division: "Ayeyarwady Region", lat: 16.3000, lng: 95.4000 },
  { city: "Kyaiklat", state_division: "Ayeyarwady Region", lat: 16.4500, lng: 95.7333 },
  { city: "Nyaungdon", state_division: "Ayeyarwady Region", lat: 17.0333, lng: 95.6333 },

  // --- Rakhine State (Offshore Gas Fields & Coastal Terminals) ---
  { city: "Sittwe", state_division: "Rakhine State", lat: 20.1528, lng: 92.8683 },
  { city: "Kyaukpyu", state_division: "Rakhine State", lat: 19.4286, lng: 93.5558 },
  { city: "Thandwe", state_division: "Rakhine State", lat: 18.4628, lng: 94.3606 },
  { city: "Mrauk-U", state_division: "Rakhine State", lat: 20.5961, lng: 93.1906 },
  { city: "Maungdaw", state_division: "Rakhine State", lat: 20.8167, lng: 92.3667 },
  { city: "Toungup", state_division: "Rakhine State", lat: 18.8500, lng: 94.2333 },
  { city: "Gwa", state_division: "Rakhine State", lat: 17.5833, lng: 94.5833 },
  { city: "Ann", state_division: "Rakhine State", lat: 19.7833, lng: 94.0333 },
  { city: "Shwe Offshore", state_division: "Rakhine State", lat: 19.9374, lng: 92.6041 },

  // --- Sagaing Region ---
  { city: "Monywa", state_division: "Sagaing Region", lat: 22.1086, lng: 95.1354 },
  { city: "Sagaing", state_division: "Sagaing Region", lat: 21.8787, lng: 95.9797 },
  { city: "Shwebo", state_division: "Sagaing Region", lat: 22.5694, lng: 95.6986 },
  { city: "Kale", state_division: "Sagaing Region", lat: 23.1931, lng: 94.0531 },
  { city: "Katha", state_division: "Sagaing Region", lat: 24.1833, lng: 96.3333 },
  { city: "Tamu", state_division: "Sagaing Region", lat: 24.2167, lng: 94.3000 },

  // --- Shan State ---
  { city: "Taunggyi", state_division: "Shan State", lat: 20.7888, lng: 97.0378 },
  { city: "Lashio", state_division: "Shan State", lat: 22.9356, lng: 97.7497 },
  { city: "Kalaw", state_division: "Shan State", lat: 20.6300, lng: 96.5600 },
  { city: "Muse", state_division: "Shan State", lat: 23.9961, lng: 97.9044 },
  { city: "Kengtung", state_division: "Shan State", lat: 21.2917, lng: 99.6050 },
  { city: "Tachileik", state_division: "Shan State", lat: 20.4481, lng: 99.8814 },
  { city: "Aungban", state_division: "Shan State", lat: 20.6667, lng: 96.6333 },
  { city: "Nyaungshwe", state_division: "Shan State", lat: 20.6600, lng: 96.9300 },

  // --- Mon State ---
  { city: "Mawlamyine", state_division: "Mon State", lat: 16.4905, lng: 97.6283 },
  { city: "Thaton", state_division: "Mon State", lat: 16.9208, lng: 97.3714 },
  { city: "Mottama", state_division: "Mon State", lat: 16.5333, lng: 97.6000 },
  { city: "Mudon", state_division: "Mon State", lat: 16.2583, lng: 97.7167 },
  { city: "Ye", state_division: "Mon State", lat: 15.2472, lng: 97.8542 },
  { city: "Kyaikto", state_division: "Mon State", lat: 17.3167, lng: 97.0167 },
  { city: "Bilin", state_division: "Mon State", lat: 17.2167, lng: 97.2333 },

  // --- Tanintharyi Region ---
  { city: "Dawei", state_division: "Tanintharyi Region", lat: 14.0828, lng: 98.1942 },
  { city: "Myeik", state_division: "Tanintharyi Region", lat: 12.4394, lng: 98.6006 },
  { city: "Kawthaung", state_division: "Tanintharyi Region", lat: 9.9833, lng: 98.5500 },

  // --- Kayin State ---
  { city: "Hpa-an", state_division: "Kayin State", lat: 16.8906, lng: 97.6333 },
  { city: "Myawaddy", state_division: "Kayin State", lat: 16.6889, lng: 98.5083 },
  { city: "Kawkareik", state_division: "Kayin State", lat: 16.5500, lng: 98.2333 },

  // --- Kachin State ---
  { city: "Myitkyina", state_division: "Kachin State", lat: 25.3833, lng: 97.4000 },
  { city: "Bhamo", state_division: "Kachin State", lat: 24.2667, lng: 97.2333 },
  { city: "Mohnyin", state_division: "Kachin State", lat: 24.7833, lng: 96.3667 },
  { city: "Putao", state_division: "Kachin State", lat: 27.3333, lng: 97.4167 },

  // --- Kayah State ---
  { city: "Loikaw", state_division: "Kayah State", lat: 19.6742, lng: 97.2094 },
  { city: "Demoso", state_division: "Kayah State", lat: 19.5500, lng: 97.1667 },

  // --- Chin State ---
  { city: "Hakha", state_division: "Chin State", lat: 22.6419, lng: 93.6067 },
  { city: "Tedim", state_division: "Chin State", lat: 23.3667, lng: 93.6500 },
  { city: "Falam", state_division: "Chin State", lat: 22.9167, lng: 93.6833 },
  { city: "Mindat", state_division: "Chin State", lat: 21.3667, lng: 93.9667 },
];

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 100% Offline Reverse Geocoding for Myanmar coordinates
 * Automatically determines City and State/Division from latitude and longitude.
 */
export function reverseGeocodeOffline(lat: number, lng: number): MyanmarLocationInfo {
  if (isNaN(lat) || isNaN(lng)) {
    return { city: "Yangon", state_division: "Yangon Region" };
  }

  // 1. Find nearest reference city by distance
  let nearestPoint: KnownPoint = MYANMAR_POINTS[0];
  let minDistance = Infinity;

  for (const pt of MYANMAR_POINTS) {
    const dist = haversineDistance(lat, lng, pt.lat, pt.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = pt;
    }
  }

  // 2. Identify State / Division
  let stateDivision = nearestPoint.state_division;

  // If closest city is within 65 km, its region is highly reliable
  if (minDistance <= 65) {
    return {
      city: nearestPoint.city,
      state_division: stateDivision,
    };
  }

  // Otherwise, cross-verify with administrative bounding boxes
  const matchingBox = REGION_BOUNDS.find(
    (box) =>
      lat >= box.latMin &&
      lat <= box.latMax &&
      lng >= box.lngMin &&
      lng <= box.lngMax
  );

  if (matchingBox) {
    stateDivision = matchingBox.state_division;
  }

  return {
    city: nearestPoint.city,
    state_division: stateDivision,
  };
}

/**
 * Enhanced Reverse Geocoding
 * Immediately runs offline geocoding, and if online, attempts a quick non-blocking
 * refinement query with a 1.2s timeout. Always returns instantly when offline.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<MyanmarLocationInfo> {
  const offlineResult = reverseGeocodeOffline(lat, lng);

  // If browser is offline, return offline result immediately
  if (typeof window !== "undefined" && !navigator.onLine) {
    return offlineResult;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data?.address || {};

      const detectedCity =
        addr.city ||
        addr.town ||
        addr.county ||
        addr.district ||
        addr.village ||
        offlineResult.city;

      const detectedState =
        addr.state ||
        addr.region ||
        offlineResult.state_division;

      return {
        city: detectedCity || offlineResult.city,
        state_division: detectedState || offlineResult.state_division,
      };
    }
  } catch {
    // On any network timeout, offline state, or CORS issue, seamlessly use offline result
  }

  return offlineResult;
}
