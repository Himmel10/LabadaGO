// Philippine geocooordinates for common municipalities and cities
// Format: { municipality: { latitude, longitude }, ... }

export const MUNICIPALITY_COORDINATES: {
  [key: string]: { latitude: number; longitude: number };
} = {
  // Metro Manila
  'Manila': { latitude: 14.5994, longitude: 120.9842 },
  'Quezon City': { latitude: 14.6349, longitude: 121.0388 },
  'Makati': { latitude: 14.5564, longitude: 121.0195 },
  'Pasay': { latitude: 14.5533, longitude: 121.0096 },
  'Taguig': { latitude: 14.5272, longitude: 121.0444 },
  'Parañaque': { latitude: 14.3455, longitude: 121.0274 },
  'Caloocan': { latitude: 14.6352, longitude: 120.9614 },
  'Valenzuela': { latitude: 14.7565, longitude: 120.9697 },
  'Malabon': { latitude: 14.6780, longitude: 120.9331 },
  'Navotas': { latitude: 14.6568, longitude: 120.8754 },
  'Las Piñas': { latitude: 14.3645, longitude: 120.9648 },
  'Marikina': { latitude: 14.6477, longitude: 121.0963 },
  'Pasig': { latitude: 14.5732, longitude: 121.1098 },
  'San Juan': { latitude: 14.5837, longitude: 121.0378 },
  'Mandaluyong': { latitude: 14.5800, longitude: 121.0197 },

  // National Capital Region (Outside NCR proper)
  'Bacoor': { latitude: 14.4066, longitude: 120.8833 },
  'Cavite City': { latitude: 14.3061, longitude: 120.8950 },
  'Dasmariñas': { latitude: 14.2928, longitude: 120.9428 },

  // Region 1 (Ilocos)
  'Vigan': { latitude: 16.4100, longitude: 120.3933 },
  'Laoag': { latitude: 16.9918, longitude: 120.5933 },
  'San Fernando': { latitude: 16.5893, longitude: 120.3244 },

  // Region 2 (Cagayan Valley)
  'Tuguegarao': { latitude: 17.6340, longitude: 121.7457 },
  'Cabanatuan': { latitude: 15.4909, longitude: 121.1277 },

  // Region 3 (Central Luzon)
  'Balanga': { latitude: 14.7611, longitude: 120.4708 },
  'Malolos': { latitude: 14.8360, longitude: 120.8203 },

  // Region 4 (CALABARZON)
  'Lucena': { latitude: 14.1854, longitude: 121.6143 },
  'Tagaytay': { latitude: 14.1338, longitude: 120.9613 },
  'Batangas City': { latitude: 13.7636, longitude: 121.1833 },
  'Lipa': { latitude: 13.9383, longitude: 121.1919 },
  'Sto. Tomas': { latitude: 14.5167, longitude: 121.3667 },

  // Region 5 (Bicol)
  'Legazpi': { latitude: 13.1426, longitude: 123.7365 },
  'Naga City': { latitude: 13.6226, longitude: 123.1860 },
  'Iriga City': { latitude: 13.4667, longitude: 123.1667 },

  // Region 6 (Western Visayas)
  'Iloilo City': { latitude: 10.6897, longitude: 122.5635 },
  'Kalibo': { latitude: 11.9856, longitude: 122.3633 },
  'Capiznon': { latitude: 11.4908, longitude: 122.9586 },

  // Region 7 (Central Visayas)
  'Cebu City': { latitude: 10.3157, longitude: 123.8854 },
  'Mandaue': { latitude: 10.4017, longitude: 123.9754 },
  'Lapu-Lapu': { latitude: 10.3181, longitude: 124.0132 },
  'Tagbilaran': { latitude: 9.6412, longitude: 123.8540 },

  // Region 8 (Eastern Visayas)
  'Tacloban': { latitude: 11.2858, longitude: 124.9950 },
  'Calbayog': { latitude: 12.0722, longitude: 124.6175 },
  'Borongan': { latitude: 11.5914, longitude: 125.4700 },

  // Region 9 (Zamboanga Peninsula)
  'Zamboanga City': { latitude: 6.9271, longitude: 122.0725 },
  'Pagadian': { latitude: 7.8167, longitude: 123.4833 },
  'Dipolog': { latitude: 8.5352, longitude: 123.3374 },

  // Region 10 (Northern Mindanao)
  'Cagayan de Oro': { latitude: 8.4865, longitude: 124.6636 },
  'Iligan': { latitude: 8.2276, longitude: 124.2143 },

  // Region 11 (Davao Region)
  'Davao City': { latitude: 7.1108, longitude: 125.6423 },
  'Tagum': { latitude: 7.4510, longitude: 125.7844 },
  'Digos': { latitude: 6.7386, longitude: 125.3836 },
  'Mati': { latitude: 6.9167, longitude: 126.2333 },

  // Region 12 (SOCCSKSARGEN)
  'General Santos': { latitude: 6.1184, longitude: 125.1789 },
  'Koronadal': { latitude: 6.5016, longitude: 125.0121 },
  'Isulan': { latitude: 6.7459, longitude: 124.8114 },
  'Alabel': { latitude: 6.5464, longitude: 125.7114 },

  // Region 13 (CARAGA)
  'Surigao City': { latitude: 9.7922, longitude: 125.4962 },

  // ARMM (Autonomous Region in Muslim Mindanao)
  'Cotabato': { latitude: 6.2167, longitude: 124.2500 },
  'Marawi': { latitude: 7.9897, longitude: 124.1900 },
  'Jolo': { latitude: 6.0537, longitude: 121.0060 },
  'Bongao': { latitude: 5.0347, longitude: 119.7678 },

  // Cordillera Administrative Region
  'Baguio City': { latitude: 16.4023, longitude: 120.5960 },
  'Tabuk': { latitude: 17.4106, longitude: 121.6243 },
  'Bontoc': { latitude: 17.0842, longitude: 121.4686 },

  // Specific cities mentioned in requirements
  'Bislig': { latitude: 8.7477, longitude: 126.1405 },
  'Tandag': { latitude: 9.3667, longitude: 126.1667 },
  'Cantilan': { latitude: 9.1500, longitude: 126.2333 },
  'Carrascal': { latitude: 9.1333, longitude: 126.1333 },
  'Madrid': { latitude: 9.0667, longitude: 126.2667 },
};

export const getCoordinates = (
  municipality: string,
  province?: string
): { latitude: number; longitude: number } | null => {
  // Try exact match first
  if (MUNICIPALITY_COORDINATES[municipality]) {
    return MUNICIPALITY_COORDINATES[municipality];
  }

  // Try with province prefix
  if (province) {
    const combined = `${municipality}, ${province}`;
    if (MUNICIPALITY_COORDINATES[combined]) {
      return MUNICIPALITY_COORDINATES[combined];
    }
  }

  // Return null if not found
  return null;
};
