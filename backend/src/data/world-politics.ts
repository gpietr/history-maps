import type { Story } from '@fact-o-map/types'
import { POLITY_COLORS } from './political-eras'

export const worldPoliticsStory: Story = {
  id: 'world-politics',
  title: 'World Political Map (100–2010)',
  description:
    'Two millennia of empires, conquests, and nations — from Imperial Rome to the present day, rendered using actual historical boundaries.',
  displayMode: 'choropleth',
  choropleth: {
    // Base URL; frontend appends /{eraKey} to get the per-era GeoJSON
    geoJsonUrl: '/geojson/political',
    valueFormula: 'political',
    colorStops: [],  // unused in political mode
    polities: POLITY_COLORS,
  },
  map: { center: [15, 20], zoom: 1.5, defaultStyle: 'physical' },
  timeRange: { start: '0100-01-01T00:00:00Z', end: '2010-12-31T00:00:00Z' },
  events: [
    {
      id: 'era-100',
      eraKey: '100',
      title: '100 — Height of Rome',
      description:
        'The Roman Empire spans from Britain to Mesopotamia at its territorial peak. Han China and Parthia rule the other great empires of the age, linked by the Silk Road.',
      timestamp: '0100-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-200',
      eraKey: '200',
      title: '200 — Three Empires',
      description:
        'Rome, Parthia, and Han China dominate Eurasia\'s breadth. All three are approaching internal crises that will fracture them within a generation.',
      timestamp: '0200-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-300',
      eraKey: '300',
      title: '300 — Fracturing Giants',
      description:
        'The Roman Empire is reeling from the Crisis of the Third Century; Han China has already splintered into rival kingdoms. The Gupta and Ghana empires are rising in India and West Africa.',
      timestamp: '0300-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-400',
      eraKey: '400',
      title: '400 — Rome Divided',
      description:
        'The Roman Empire has split into Western and Eastern halves. Hunnic invasions batter Europe while the Franks emerge in Gaul.',
      timestamp: '0400-01-01T00:00:00Z',
      category: 'war',
    },
    {
      id: 'era-500',
      eraKey: '500',
      title: '500 — Rome Falls in the West',
      description:
        'The Western Roman Empire has collapsed; the Eastern Roman (Byzantine) Empire endures. The Gupta Empire rules northern India and the Sasanians rule Persia.',
      timestamp: '0500-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-600',
      eraKey: '600',
      title: '600 — Sui China Reunifies',
      description:
        'The Sui dynasty has reunified China after centuries of division. The Sasanian and Byzantine empires are locked in decades of exhausting war.',
      timestamp: '0600-01-01T00:00:00Z',
      category: 'war',
    },
    {
      id: 'era-700',
      eraKey: '700',
      title: '700 — Islam\'s First Century',
      description:
        'Islamic armies have swept from Arabia across Persia, North Africa, and into Iberia within a single century. The Byzantine Empire survives, diminished.',
      timestamp: '0700-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-800',
      eraKey: '800',
      title: '800 — Charlemagne\'s Empire',
      description:
        'Charlemagne is crowned emperor, reviving the idea of a Western empire. The Abbasid Caliphate rules from Baghdad while Tang China is at its height.',
      timestamp: '0800-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-900',
      eraKey: '900',
      title: '900 — Islamic Golden Age',
      description:
        'The Abbasid Caliphate presides over a golden age of science and trade, though its political unity is fraying. Viking kingdoms are forming across Northern Europe.',
      timestamp: '0900-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1000',
      eraKey: '1000',
      title: '1000 — Fractured Caliphate',
      description:
        'The Abbasid Caliphate has splintered into rival caliphates at Córdoba and Cairo. The Byzantine Empire and the new Holy Roman Empire anchor Christian Europe.',
      timestamp: '1000-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1100',
      eraKey: '1100',
      title: '1100 — Age of Crusaders',
      description:
        'The First Crusade has carved Christian states into the Levant. The Khmer Empire dominates Southeast Asia while Song China thrives.',
      timestamp: '1100-01-01T00:00:00Z',
      category: 'war',
    },
    {
      id: 'era-1200',
      eraKey: '1200',
      title: '1200 — Eve of the Mongols',
      description:
        'The Khwarazmian, Byzantine, and Song empires anchor Eurasia\'s great civilizations — none yet aware of the storm about to arrive from the Mongolian steppe.',
      timestamp: '1200-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1279',
      eraKey: '1279',
      title: '1279 — Mongol World Empire',
      description:
        'The Mongol Empire, the largest contiguous land empire in history, has just conquered Song China. It now stretches from Korea to Eastern Europe.',
      timestamp: '1279-01-01T00:00:00Z',
      category: 'war',
    },
    {
      id: 'era-1300',
      eraKey: '1300',
      title: '1300 — Mongol Successor Khanates',
      description:
        'The unified Mongol Empire has split into rival khanates — the Golden Horde, the Yuan dynasty in China, the Ilkhanate in Persia.',
      timestamp: '1300-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1400',
      eraKey: '1400',
      title: '1400 — Rise of the Ottomans',
      description:
        'The Ottoman Empire is expanding into the crumbling Byzantine world. The Mamluk Sultanate rules Egypt while Mongol successor states still dominate Central Asia.',
      timestamp: '1400-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1492',
      eraKey: '1492',
      title: '1492 — Contact',
      description:
        'Columbus reaches the Americas, beginning sustained contact between the Old World and the New. The Ottoman Empire, Ming China, and independent American civilizations each dominate their regions, unaware of one another.',
      timestamp: '1492-10-12T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1500',
      eraKey: '1500',
      title: '1500 — Age of Empires',
      description:
        'The Aztec and Inca empires rule Mesoamerica and the Andes. The Ottoman and Ming empires dominate the Old World; European maritime powers are just beginning to reach beyond their shores.',
      timestamp: '1500-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1530',
      eraKey: '1530',
      title: '1530 — Conquest of the Americas',
      description:
        'Spanish conquistadors have toppled the Inca Empire and are consolidating control of the Americas. The Mughal Empire has just been founded in India.',
      timestamp: '1530-01-01T00:00:00Z',
      category: 'war',
    },
    {
      id: 'era-1600',
      eraKey: '1600',
      title: '1600 — Global Trade Networks',
      description:
        'The Dutch Republic and other European trading powers are establishing footholds worldwide. The Ottoman, Ming, and Mughal empires remain the era\'s dominant land powers.',
      timestamp: '1600-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1650',
      eraKey: '1650',
      title: '1650 — Ming Falls, Qing Rises',
      description:
        'The Manchu conquest has toppled the Ming dynasty; the Qing Empire now rules China. Europe emerges from the Thirty Years\' War exhausted.',
      timestamp: '1650-01-01T00:00:00Z',
      category: 'war',
    },
    {
      id: 'era-1700',
      eraKey: '1700',
      title: '1700 — Balance of Power',
      description:
        'The Ottoman, Qing, Mughal, and Habsburg empires anchor a multipolar world, while European colonial claims in the Americas continue to consolidate.',
      timestamp: '1700-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1715',
      eraKey: '1715',
      title: '1715 — Sun King\'s Twilight',
      description:
        'Louis XIV\'s France dominates continental Europe as his long reign nears its end. The Ottoman Empire is in slow retreat from Central Europe.',
      timestamp: '1715-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1783',
      eraKey: '1783',
      title: '1783 — American Independence',
      description:
        'The Treaty of Paris ends the Revolutionary War; the United States becomes a sovereign nation. Britain, France, Spain and Portugal still hold most of the Americas and dominate global trade.',
      timestamp: '1783-09-03T00:00:00Z',
      category: 'treaty',
    },
    {
      id: 'era-1800',
      eraKey: '1800',
      title: '1800 — Revolutionary Europe',
      description:
        'The French Revolution has toppled the old monarchy. Napoleon Bonaparte is First Consul and France\'s armies are reshaping the map of continental Europe.',
      timestamp: '1800-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1815',
      eraKey: '1815',
      title: '1815 — Congress of Vienna',
      description:
        'Napoleon\'s defeat at Waterloo ends decades of war. The great powers redraw Europe at Vienna, setting a balance of power that holds, largely, until 1914.',
      timestamp: '1815-06-09T00:00:00Z',
      category: 'treaty',
    },
    {
      id: 'era-1880',
      eraKey: '1880',
      title: '1880 — The Imperial Age',
      description:
        'European empires dominate the globe. The scramble for Africa has not yet begun — most of the continent\'s interior remains outside colonial control.',
      timestamp: '1880-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1900',
      eraKey: '1900',
      title: '1900 — Africa Divided',
      description:
        'The Berlin Conference (1884–85) has carved up Africa between the European powers. The British Empire alone covers a quarter of the world\'s land area.',
      timestamp: '1900-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1914',
      eraKey: '1914',
      title: '1914 — World War I Begins',
      description:
        'Imperial rivalries erupt into war. Germany is at the peak of its colonial empire; Japan has annexed Korea. The great powers mobilise in August.',
      timestamp: '1914-07-28T00:00:00Z',
      category: 'war',
    },
    {
      id: 'era-1920',
      eraKey: '1920',
      title: '1920 — Post-War Order',
      description:
        'The German and Austro-Hungarian empires are gone. The Ottoman Sultanate is collapsing. The Bolsheviks have won the Russian Civil War and the USSR is taking shape.',
      timestamp: '1920-01-10T00:00:00Z',
      category: 'treaty',
    },
    {
      id: 'era-1930',
      eraKey: '1930',
      title: '1930 — Uneasy Peace',
      description:
        'The Wall Street Crash has plunged the world into depression. Mussolini\'s Fascist Italy is a decade old and the Weimar Republic is faltering, but Hitler has not yet taken power and Japan has not yet invaded Manchuria.',
      timestamp: '1930-01-01T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1938',
      eraKey: '1938',
      title: '1938 — Eve of World War II',
      description:
        'Nazi Germany has annexed Austria and the Sudetenland. The Japanese Empire expands across East Asia. Europe teeters on the edge.',
      timestamp: '1938-09-30T00:00:00Z',
      category: 'war',
    },
    {
      id: 'era-1945',
      eraKey: '1945',
      title: '1945 — World War II Ends',
      description:
        'Nazi Germany and Imperial Japan are defeated. The USSR expands westward. Decolonisation pressure is building everywhere — India, Indochina, Indonesia.',
      timestamp: '1945-09-02T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-1960',
      eraKey: '1960',
      title: '1960 — Year of Africa',
      description:
        '17 African nations gain independence in a single year. India became independent in 1947, Indonesia in 1949. The age of formal empire is ending rapidly.',
      timestamp: '1960-01-01T00:00:00Z',
      category: 'independence',
    },
    {
      id: 'era-1994',
      eraKey: '1994',
      title: '1994 — Post-Cold War World',
      description:
        'The USSR dissolved in 1991, producing 15 new states. Yugoslavia has fragmented. South Africa holds its first democratic elections. The modern state system is nearly complete.',
      timestamp: '1994-04-27T00:00:00Z',
      category: 'politics',
    },
    {
      id: 'era-2010',
      eraKey: '2010',
      title: '2010 — The Present Century',
      description:
        'South Sudan\'s independence is a year away. The map now largely reflects today\'s nation-states — the age of large multinational empires has given way to a world of roughly 190 sovereign states.',
      timestamp: '2010-01-01T00:00:00Z',
      category: 'politics',
    },
  ],
}
