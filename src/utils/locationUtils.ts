// Pre-computed location map for O(1) lookups
const LOCATION_MAP = {
  holms: "homs",
  hasekeh: "hasaka",
  "al hasakah": "hasaka",
  "deir ez zor": "deir_ezzor",
  "deir-ez-zor": "deir_ezzor",
  "deir al-zor": "deir_ezzor",
  "as suwayda": "sweida",
  "as-suwayda": "sweida",
  "al suwayda": "sweida",
  "al-suwayda": "sweida",
  "dar`a": "daraa",
  dara: "daraa",
  "dara`a": "daraa",
  daraah: "daraa",
  "al qunaytirah": "quneitra",
  "al-qunaytirah": "quneitra",
  qunaytirah: "quneitra",
  "al ladhiqiyah": "latakia",
  "al-ladhiqiyah": "latakia",
  ladhiqiyah: "latakia",
  tartus: "tartous",
  tarus: "tartous",
} as const;

// Memoization cache for normalizeLocation
const normalizeCache = new Map<string, string>();
const cleanLocationCache = new Map<string, string>();

// Maps common location name variations to their standard keys
export const normalizeLocation = (location: string): string => {
  if (!location) return "";

  // Check cache first
  if (normalizeCache.has(location)) {
    return normalizeCache.get(location)!;
  }

  const key = location.toLowerCase().trim().replace(/\s+/g, "_");
  const result = LOCATION_MAP[key as keyof typeof LOCATION_MAP] || key;

  // Cache result
  normalizeCache.set(location, result);
  return result;
};

/**
 * Cleans up location strings that contain duplicate city/neighborhood names
 * Examples:
 *   - "Afrin, Afrin, Afrin" -> "Afrin"
 *   - "Al-Aziziyah, Aleppo, Aleppo" -> "Al-Aziziyah, Aleppo"
 *   - "Damascus, Damascus" -> "Damascus"
 */
export const cleanLocationString = (location: string): string => {
  if (!location) return "";

  // Check cache first
  if (cleanLocationCache.has(location)) {
    return cleanLocationCache.get(location)!;
  }

  const parts = location
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) {
    cleanLocationCache.set(location, location);
    return location;
  }

  // Use Set for deduplication (case-insensitive)
  const uniqueParts = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const key = part.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueParts.push(part);
    }
    // Limit to first 2 parts for better UX
    if (uniqueParts.length >= 2) break;
  }

  const result = uniqueParts.join(", ");
  cleanLocationCache.set(location, result);
  return result;
};
