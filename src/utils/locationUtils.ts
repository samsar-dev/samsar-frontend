// Maps common location name variations to their standard keys
export const normalizeLocation = (location: string): string => {
  if (!location) return '';
  
  const locationMap: Record<string, string> = {
    'holms': 'homs',
    'hasekeh': 'hasaka',
    'al hasakah': 'hasaka',
    'deir ez zor': 'deir_ezzor',
    'deir-ez-zor': 'deir_ezzor',
    'deir al-zor': 'deir_ezzor',
    'as suwayda': 'sweida',
    'as-suwayda': 'sweida',
    'al suwayda': 'sweida',
    'al-suwayda': 'sweida',
    'dar`a': 'daraa',
    'dara': 'daraa',
    'dara`a': 'daraa',
    'daraah': 'daraa',
    'al qunaytirah': 'quneitra',
    'al-qunaytirah': 'quneitra',
    'qunaytirah': 'quneitra',
    'al ladhiqiyah': 'latakia',
    'al-ladhiqiyah': 'latakia',
    'ladhiqiyah': 'latakia',
    'tartus': 'tartous',
    'tarus': 'tartous'
  };

  const normalized = location.toLowerCase().trim().replace(/\s+/g, '_');
  return locationMap[normalized] || normalized;
};

/**
 * Cleans up location strings that contain duplicate city/neighborhood names
 * Examples:
 *   - "Afrin, Afrin, Afrin" -> "Afrin"
 *   - "Al-Aziziyah, Aleppo, Aleppo" -> "Al-Aziziyah, Aleppo"
 *   - "Damascus, Damascus" -> "Damascus"
 */
export const cleanLocationString = (location: string): string => {
  if (!location) return '';
  
  // Split by commas and clean up each part
  const parts = location
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0);
  
  if (parts.length <= 1) return location;
  
  // Remove consecutive duplicates
  const uniqueParts = [];
  let lastPart = '';
  
  for (const part of parts) {
    if (part.toLowerCase() !== lastPart.toLowerCase()) {
      uniqueParts.push(part);
      lastPart = part;
    }
  }
  
  // If we have more than 2 parts (neighborhood, city, city), take the first two
  if (uniqueParts.length > 2) {
    return `${uniqueParts[0]}, ${uniqueParts[1]}`;
  }
  
  return uniqueParts.join(', ');
};
