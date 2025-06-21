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
