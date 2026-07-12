// Maps SUBJECTO property values (as they appear in the aourednik historical-basemaps GeoJSON)
// to display colours. Entries cover all major empires and their variant names across eras.
export const POLITY_COLORS: Record<string, string> = {
  // British Empire
  'United Kingdom':                             '#9B1C2A',
  'Great Britain':                              '#9B1C2A',
  'United Kingdom of Great Britain and Ireland':'#9B1C2A',
  'UK':                                          '#9B1C2A',
  'British East India Company':                 '#9B1C2A',

  // French Empire
  'France':                 '#002395',
  'French Indo-China':      '#002395',
  'French Indochina':       '#002395',
  'French Guiana':          '#002395',
  'Cochin China':           '#002395',
  'Annam':                  '#002395',
  'Madagascar (France)':    '#002395',

  // Russian Empire / Soviet Union
  'Russian Empire': '#6B2737',
  'Russia':         '#6B2737',
  'USSR':           '#CC2222',
  'Far Eastern SSR':'#CC2222',
  'South Russia':   '#CC2222',
  'White Russia':   '#AA1111',
  'Ukraine':        '#BB3333',

  // Germany / Prussia
  'Germany':               '#3D3D3D',
  'German Empire':         '#3D3D3D',
  'German South-West Africa': '#3D3D3D',
  'Kamerun':               '#3D3D3D',
  'Togoland':              '#3D3D3D',
  'Prussia':               '#3D3D3D',

  // Austria / Austro-Hungarian Empire
  'Austria':                 '#B8860B',
  'Austrian Empire':         '#B8860B',
  'Habsburg Austria':        '#B8860B',
  'Austria Hungary':         '#B8860B',
  'Austro-Hungarian Empire': '#B8860B',

  // Japan
  'Imperial Japan': '#BC002D',
  'Empire of Japan':'#BC002D',
  'Japan':          '#D9607A',

  // Ottoman Empire / Turkey
  'Ottoman Empire':   '#7B7B35',
  'Ottoman Sultanate':'#7B7B35',
  'Turkey':           '#B5B573',

  // United States
  'United States of America': '#1B3F8F',
  'United States':            '#1B3F8F',
  'USA':                      '#1B3F8F',

  // Portugal
  'Portugal': '#1A6B1A',

  // Belgium
  'Belgium': '#663399',

  // Netherlands
  'Netherlands':              '#D95B00',
  'Dutch East Indies':        '#D95B00',
  'United Kingdom of Netherlands': '#D95B00',

  // Italy
  'Italy': '#2E7D5E',

  // Spain
  'Spain': '#C8930A',

  // Denmark (Greenland, Iceland)
  'Denmark':         '#4A7C59',
  'Denmark-Norway':  '#4A7C59',
}
