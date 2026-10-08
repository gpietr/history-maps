import type { Story } from '@fact-o-map/types'

// Polity names from Cliopatria (see backend/src/cliopatria.ts), which has borders for any year
// — so the Second Partition, the Duchy of Warsaw or the 1939 German–Soviet partition all show.
// Poland is crimson throughout (the Piast duchies of the fragmentation era in separate shades);
// the three partitioning powers get strong colours (Prussia/Germany grey, Russia blue, Austria
// ochre) so the partition-era maps, where Poland is absent, show who held its lands.
const POLAND = '#C8102E'
const GERMAN = '#3D3D3D'
const RUSSIA = '#2E4A8B'
const AUSTRIA = '#C08A2E'
const LITHUANIA = '#D9B84A'
const MONGOL = '#8B5A2B'

const POLISH_POLITIES: Record<string, string> = {
  // Poland
  'Kingdom of Poland':              POLAND,
  'House of Jagiellon':             POLAND,
  'Polish-Lithuanian Commonwealth': POLAND,
  'Duchy of Warsaw':                POLAND,
  'Poles':                          POLAND,  // November Uprising
  'Free City of Krakow':            '#E0566A',
  'Second Polish Republic':         POLAND,
  'Republic of Poland':             POLAND,

  // Piast duchies of the fragmentation era
  'Duchy of Greater Poland': '#D9304A',
  'Duchy of Masovia':        '#A3122A',
  'Duchy of Sandomierz':     '#E8606F',
  'Duchy of Silesia':        '#B5172E',
  'Duchy of Opole':          '#F08A96',

  // German states
  'Teutonic Order':                  '#5E5E5E',
  'Duchy of Prussia':                '#6E6E6E',
  'Margraviate of Brandenburg':      '#4A4A4A',
  'Electorate of Brandenburg':       '#4A4A4A',
  'Brandenburg-Prussia':             GERMAN,
  'Kingdom of Prussia':              GERMAN,
  'German Confederation':            GERMAN,
  'German Empire':                   GERMAN,
  'Weimar Republic':                 GERMAN,
  'Nazi Germany':                    GERMAN,
  'German Democratic Republic':      '#555555',
  'Free City of Danzig':             '#8A8A8A',
  'Holy Roman Empire':               '#A39467',
  'Holy Roman Empire Minor States':  '#A39467',

  // Russia
  "Kievan Rus'":                         '#5B7BB5',
  'Grand Principality of Moscow':        RUSSIA,
  'Tsardom of Russia':                   RUSSIA,
  'Russian Empire':                      RUSSIA,
  'Russian Republic':                    RUSSIA,
  'Republics of the Soviet Union':       RUSSIA,
  'Union of Soviet Socialist Republics': RUSSIA,
  'Russian Federation':                  RUSSIA,

  // Austria
  'Habsburg Monarchy': AUSTRIA,
  'House of Habsburg': AUSTRIA,
  'Austrian Empire':   AUSTRIA,
  'Austria-Hungary':   AUSTRIA,

  // Other neighbours
  'Grand Duchy of Lithuania':  LITHUANIA,
  'Kingdom of Lithuania':      LITHUANIA,
  'Republic of Lithuania':     LITHUANIA,
  'Mongol Empire':             MONGOL,
  'Golden Horde':              MONGOL,
  'Swedish Empire':            '#3A8FB7',
  'Kingdom of Sweden':         '#3A8FB7',
  'First French Empire':       '#7B68B5',
  'Confederation of the Rhine': '#9A8FC4',
  'Ottoman Empire':            '#2F6B3A',
  'Crimean Khanate':           '#4F7F4F',
  'Kingdom of Hungary':        '#4E8F5A',
  'Kingdom of Bohemia':        '#7A5AA0',
  'Duchy of Bohemia':          '#7A5AA0',
  'Czechoslovakia':            '#6A5A9E',
}

// Map zoom levels used for event fly-to
const CITY = 7
const REGION = 5.5
const COUNTRY = 4.5

// Spread Warsaw/Kraków events over separate landmarks so their markers don't stack.
const WARSAW_CASTLE: [number, number] = [21.0137, 52.2479]
const WAWEL: [number, number] = [19.935, 50.054]

export const polandStory: Story = {
  id: 'poland',
  title: 'Poland: A Thousand Years',
  description:
    'From the baptism of Mieszko I to the European Union — a kingdom, a vast Commonwealth, 123 years wiped off the map, and two rebirths. Each event shows the borders of its own year.',
  displayMode: 'choropleth',
  choropleth: {
    // Cliopatria: borders for any year; eraKey is the year to draw (see backend/src/cliopatria.ts)
    geoJsonUrl: '/geojson/clio',
    valueFormula: 'political',
    colorStops: [],  // unused in political mode
    polities: POLISH_POLITIES,
    attribution: 'Borders: <a href="https://github.com/Seshat-Global-History-Databank/cliopatria">Cliopatria</a> (Seshat), CC BY 4.0',
    othersColor: 'rgba(70, 64, 54, 0.2)',
  },
  map: { center: [22, 52], zoom: 4.3, defaultStyle: 'physical' },
  timeRange: { start: '0960-01-01T00:00:00Z', end: '2012-01-01T00:00:00Z' },
  // Boundaries sit on turning-point dates (end is exclusive), so each event lands in its era.
  periods: [
    {
      id: 'piast-beginnings',
      title: 'Piast Beginnings',
      description: 'A Slavic duchy on the Warta adopts Latin Christianity and becomes a kingdom.',
      start: '0966-01-01T00:00:00Z',
      end: '1138-10-28T00:00:00Z',
    },
    {
      id: 'fragmentation',
      title: 'Fragmentation',
      description: 'Split among Piast dukes for nearly two centuries, Poland faces Mongol raids and a new crusader state on the Baltic.',
      start: '1138-10-28T00:00:00Z',
      end: '1320-01-20T00:00:00Z',
    },
    {
      id: 'kingdom-reunited',
      title: 'Kingdom Reunited',
      description: 'The last Piasts rebuild a united kingdom with its capital in Kraków.',
      start: '1320-01-20T00:00:00Z',
      end: '1386-03-04T00:00:00Z',
    },
    {
      id: 'jagiellonian',
      title: 'Jagiellonian Golden Age',
      description: 'Union with Lithuania creates one of Europe\'s largest states; the Teutonic Order is humbled and the Renaissance arrives.',
      start: '1386-03-04T00:00:00Z',
      end: '1569-07-01T00:00:00Z',
    },
    {
      id: 'commonwealth',
      title: 'The Commonwealth',
      description: 'A noble republic with an elected king, religious tolerance and wars against Muscovy, Sweden and the Ottomans.',
      start: '1569-07-01T00:00:00Z',
      end: '1772-08-05T00:00:00Z',
    },
    {
      id: 'reform-and-partition',
      title: 'Reform & Partition',
      description: 'As Poland tries to reform itself, Russia, Prussia and Austria carve it up in three partitions.',
      start: '1772-08-05T00:00:00Z',
      end: '1795-10-24T00:00:00Z',
    },
    {
      id: 'partitions',
      title: 'Under the Partitions',
      description: '123 years without a state. Poles keep the nation alive through language, Church and repeated uprisings.',
      start: '1795-10-24T00:00:00Z',
      end: '1918-11-11T00:00:00Z',
    },
    {
      id: 'second-republic',
      title: 'Second Republic',
      description: 'Reborn after the First World War, Poland fights for its borders and rebuilds a divided country.',
      start: '1918-11-11T00:00:00Z',
      end: '1939-09-01T00:00:00Z',
    },
    {
      id: 'ww2',
      title: 'World War II',
      description: 'Invaded by Germany and the Soviet Union; about six million Polish citizens, half of them Jews, are killed.',
      start: '1939-09-01T00:00:00Z',
      end: '1945-05-09T00:00:00Z',
    },
    {
      id: 'peoples-republic',
      title: 'People\'s Republic',
      description: 'Shifted west and under Soviet domination; repeated protests culminate in Solidarity.',
      start: '1945-05-09T00:00:00Z',
      end: '1989-06-04T00:00:00Z',
    },
    {
      id: 'third-republic',
      title: 'Third Republic',
      description: 'Free elections, a market economy, and membership of NATO and the European Union.',
      start: '1989-06-04T00:00:00Z',
      end: '2011-01-01T00:00:00Z',
    },
  ],
  events: [
    // ── Piast Poland ────────────────────────────────────────────────────────
    {
      id: 'baptism',
      eraKey: '966',
      title: 'Baptism of Mieszko I',
      description:
        'Duke Mieszko I of the Polans is baptised, probably at Easter, bringing his realm into Latin Christendom — and out of reach of German missionary conquest. Traditionally taken as the birth of the Polish state.',
      timestamp: '0966-04-14T00:00:00Z',
      location: { type: 'point', coordinates: [16.94, 52.41], zoom: REGION },
      category: 'religion',
    },
    {
      id: 'congress-of-gniezno',
      eraKey: '1000',
      title: 'Congress of Gniezno',
      description:
        'Emperor Otto III makes a pilgrimage to the tomb of St Adalbert and recognises Bolesław the Brave as a partner. Gniezno becomes an archbishopric, giving Poland its own Church province.',
      timestamp: '1000-03-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [17.6, 52.535], zoom: REGION },
      category: 'politics',
    },
    {
      id: 'first-king',
      eraKey: '1025',
      title: 'Bolesław the Brave Crowned',
      description:
        'After decades of war with the Empire, Bohemia and Kyiv, Bolesław I is crowned the first King of Poland at Gniezno, shortly before his death.',
      timestamp: '1025-04-18T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [17.594, 52.538], zoom: REGION },
      category: 'politics',
    },
    {
      id: 'testament',
      eraKey: '1138',
      title: 'Testament of Bolesław Wrymouth',
      description:
        'Bolesław III divides the realm among his sons, with Kraków reserved for the senior prince. The arrangement collapses into nearly two centuries of feudal fragmentation.',
      timestamp: '1138-10-28T00:00:00Z',
      location: { type: 'point', coordinates: [19.937, 50.062], zoom: COUNTRY },
      category: 'politics',
    },
    {
      id: 'teutonic-order',
      eraKey: '1226',
      title: 'The Teutonic Knights Arrive',
      description:
        'Duke Konrad of Masovia invites the crusading Teutonic Order to help against the pagan Prussians. The Knights conquer Prussia for themselves and become Poland\'s most dangerous neighbour for 250 years.',
      timestamp: '1226-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [18.46, 53.35], zoom: REGION },
      category: 'military',
    },
    {
      id: 'legnica',
      eraKey: '1241',
      title: 'Battle of Legnica',
      description:
        'A Mongol army ravaging Central Europe destroys the knights of Duke Henry the Pious, who is killed. The Mongols turn south to Hungary; Kraków\'s trumpet call, broken off mid-note, recalls these raids.',
      timestamp: '1241-04-09T00:00:00Z',
      location: { type: 'point', coordinates: [16.16, 51.21], zoom: REGION },
      category: 'battle',
    },
    {
      id: 'lokietek-coronation',
      eraKey: '1320',
      title: 'Kingdom Reunited',
      description:
        'Władysław the Elbow-high, who has fought for decades to reunite the Piast duchies, is crowned in Wawel Cathedral — the first coronation in Kraków, which stays the coronation city for four centuries.',
      timestamp: '1320-01-20T00:00:00Z',
      location: { type: 'point', coordinates: WAWEL, zoom: CITY },
      category: 'politics',
    },
    {
      id: 'krakow-academy',
      eraKey: '1364',
      title: 'Kraków Academy Founded',
      description:
        'Casimir the Great — who "found Poland wooden and left it brick" — founds a university at Kraków, the second in Central Europe after Prague. Copernicus will study there a century later.',
      timestamp: '1364-05-12T00:00:00Z',
      location: { type: 'point', coordinates: [19.933, 50.061], zoom: CITY },
      category: 'culture',
    },

    // ── Jagiellonians ───────────────────────────────────────────────────────
    {
      id: 'jagiello',
      eraKey: '1386',
      title: 'Union with Lithuania',
      description:
        'Grand Duke Jogaila of Lithuania is baptised, marries the young Queen Jadwiga and is crowned King Władysław II Jagiełło. Lithuania, Europe\'s last pagan state, converts; the union reaches from the Baltic almost to the Black Sea.',
      timestamp: '1386-03-04T00:00:00Z',
      location: { type: 'point', coordinates: [19.9355, 50.0545], zoom: COUNTRY },
      category: 'politics',
    },
    {
      id: 'grunwald',
      eraKey: '1410',
      title: 'Battle of Grunwald',
      description:
        'The Polish–Lithuanian army crushes the Teutonic Knights in one of the largest battles of medieval Europe. Grand Master Ulrich von Jungingen is killed and the Order never recovers its strength.',
      timestamp: '1410-07-15T00:00:00Z',
      location: { type: 'point', coordinates: [20.09, 53.49], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'peace-of-thorn',
      eraKey: '1466',
      title: 'Second Peace of Thorn',
      description:
        'The Thirteen Years\' War ends with the Order ceding Gdańsk, Toruń and the lower Vistula — Royal Prussia — to Poland. Poland regains access to the Baltic, and the grain trade through Gdańsk makes the gentry rich.',
      timestamp: '1466-10-19T00:00:00Z',
      location: { type: 'point', coordinates: [18.6, 53.01], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'prussian-homage',
      eraKey: '1525',
      title: 'The Prussian Homage',
      description:
        'Albrecht Hohenzollern, last Grand Master, turns the Order\'s lands into a secular Lutheran duchy and kneels before Sigismund the Old in Kraków\'s market square as his vassal.',
      timestamp: '1525-04-10T00:00:00Z',
      location: { type: 'point', coordinates: [19.937, 50.0617], zoom: CITY },
      category: 'politics',
    },
    {
      id: 'copernicus',
      eraKey: '1543',
      title: 'Copernicus Moves the Earth',
      description:
        '"On the Revolutions of the Heavenly Spheres" is published as Nicolaus Copernicus lies dying in Frombork, where he served as a canon. It puts the Sun, not the Earth, at the centre of the universe.',
      timestamp: '1543-05-24T00:00:00Z',
      location: { type: 'point', coordinates: [19.68, 54.36], zoom: REGION },
      category: 'culture',
    },
    {
      id: 'union-of-lublin',
      eraKey: '1569',
      title: 'Union of Lublin',
      description:
        'The personal union becomes a single Commonwealth of Two Nations with a common king, Sejm and currency. Ukraine passes from Lithuania to the Polish Crown.',
      timestamp: '1569-07-01T00:00:00Z',
      location: { type: 'point', coordinates: [22.568, 51.248], zoom: COUNTRY },
      category: 'politics',
    },

    // ── Commonwealth ────────────────────────────────────────────────────────
    {
      id: 'warsaw-confederation',
      eraKey: '1573',
      title: 'Warsaw Confederation',
      description:
        'While Europe burns in wars of religion, the nobility guarantees peace between faiths — one of the earliest acts of religious toleration in Europe. The Commonwealth becomes a refuge for dissenters and home to Europe\'s largest Jewish community.',
      timestamp: '1573-01-28T00:00:00Z',
      location: { type: 'point', coordinates: [21.012, 52.2297], zoom: CITY },
      category: 'religion',
    },
    {
      id: 'klushino',
      eraKey: '1610',
      title: 'Poles in the Kremlin',
      description:
        'Hetman Żółkiewski\'s outnumbered army routs the Russians and Swedes at Klushino during Russia\'s Time of Troubles. Polish troops occupy the Moscow Kremlin until 1612.',
      timestamp: '1610-07-04T00:00:00Z',
      location: { type: 'point', coordinates: [34.88, 55.6], zoom: COUNTRY },
      category: 'victory',
    },
    {
      id: 'deluge',
      eraKey: '1655',
      title: 'The Deluge',
      description:
        'Sweden overruns most of the Commonwealth while Russia invades from the east. The successful defence of the Jasna Góra monastery becomes a rallying point; the country survives but is devastated.',
      timestamp: '1655-11-18T00:00:00Z',
      location: { type: 'point', coordinates: [19.097, 50.812], zoom: REGION },
      category: 'war',
    },
    {
      id: 'vienna',
      eraKey: '1683',
      title: 'Relief of Vienna',
      description:
        'King Jan III Sobieski leads the largest cavalry charge in history down the Kahlenberg, with the winged hussars at its head, and breaks the Ottoman siege of Vienna.',
      timestamp: '1683-09-12T00:00:00Z',
      location: { type: 'point', coordinates: [16.32, 48.27], zoom: REGION },
      category: 'victory',
    },

    // ── Reform and partition ────────────────────────────────────────────────
    {
      id: 'first-partition',
      eraKey: '1772',
      title: 'First Partition',
      description:
        'Russia, Prussia and Austria seize nearly a third of the Commonwealth\'s territory. Prussia takes most of Royal Prussia, leaving Gdańsk a Polish enclave cut off from the rest of the country.',
      timestamp: '1772-08-05T00:00:00Z',
      location: { type: 'point', coordinates: [19.5, 52.0], zoom: COUNTRY },
      category: 'disaster',
    },
    {
      id: 'constitution-3-may',
      eraKey: '1791',
      title: 'Constitution of 3 May',
      description:
        'The Great Sejm adopts Europe\'s first modern written constitution, ending the liberum veto and the elective monarchy. Russia invades the following year to undo it.',
      timestamp: '1791-05-03T00:00:00Z',
      location: { type: 'point', coordinates: WARSAW_CASTLE, zoom: CITY },
      category: 'politics',
    },
    {
      id: 'second-partition',
      eraKey: '1793',
      title: 'Second Partition',
      description:
        'Using the Targowica Confederation as a pretext, Russia and Prussia take more than half of what remains — Prussia gets Gdańsk, Toruń and Greater Poland. The Grodno Sejm, surrounded by Russian troops, is forced to ratify it.',
      timestamp: '1793-01-23T00:00:00Z',
      location: { type: 'point', coordinates: [23.83, 53.68], zoom: COUNTRY },
      category: 'disaster',
    },
    {
      id: 'kosciuszko',
      // Cliopatria's 1794 record already shows the Third Partition; 1793 is the rump state the rising defended
      eraKey: '1793',
      title: 'Kościuszko Uprising',
      description:
        'With the rump state under Russian garrisons, Tadeusz Kościuszko, a veteran of the American Revolution, leads a national uprising against Russia and Prussia. At Racławice peasants armed with scythes storm Russian guns, but the rising is crushed by autumn.',
      timestamp: '1794-04-04T00:00:00Z',
      location: { type: 'point', coordinates: [20.24, 50.33], zoom: REGION },
      category: 'battle',
    },

    // ── Under the partitions ────────────────────────────────────────────────
    {
      id: 'third-partition',
      eraKey: '1795',
      title: 'Poland Disappears',
      description:
        'The Third Partition divides what remains. For 123 years there is no Polish state; the map shows Prussia, Russia and Austria holding its lands.',
      timestamp: '1795-10-24T00:00:00Z',
      location: { type: 'point', coordinates: [20.0, 52.2], zoom: COUNTRY },
      category: 'disaster',
    },
    {
      id: 'duchy-of-warsaw',
      // Cliopatria lists 1807–1808 as French-held; the Duchy appears from 1809
      eraKey: '1809',
      title: 'Duchy of Warsaw',
      description:
        'Napoleon creates a Polish client state from Prussian lands. Polish legions fight for him across Europe — "Poland has not yet perished", their marching song, later becomes the national anthem.',
      timestamp: '1807-07-07T00:00:00Z',
      location: { type: 'point', coordinates: [21.0156, 52.2432], zoom: COUNTRY },
      category: 'politics',
    },
    {
      id: 'congress-of-vienna',
      eraKey: '1815',
      title: 'Congress Kingdom',
      description:
        'The Congress of Vienna redraws the partitions: a "Kingdom of Poland" is created in personal union with the Russian tsar (drawn here as part of the Russian Empire), Kraków becomes a tiny free city, and Prussia keeps Poznań.',
      timestamp: '1815-06-09T00:00:00Z',
      location: { type: 'point', coordinates: [20.5, 51.9], zoom: COUNTRY },
      category: 'politics',
    },
    {
      id: 'november-uprising',
      eraKey: '1830',
      title: 'November Uprising',
      description:
        'Officer cadets attack the Belweder palace and a year-long war with Russia follows. After its defeat the Kingdom\'s autonomy is abolished and thousands go into the "Great Emigration", Chopin among them.',
      timestamp: '1830-11-29T00:00:00Z',
      location: { type: 'point', coordinates: [21.0247, 52.2143], zoom: CITY },
      category: 'battle',
    },
    {
      id: 'january-uprising',
      eraKey: '1863',
      title: 'January Uprising',
      description:
        'A guerrilla war against Russia lasts over a year. Its suppression brings executions, Siberian exile and intense Russification — but also the emancipation of the peasants.',
      timestamp: '1863-01-22T00:00:00Z',
      location: { type: 'point', coordinates: [21.0, 52.0], zoom: REGION },
      category: 'battle',
    },

    // ── Second Republic ─────────────────────────────────────────────────────
    {
      id: 'independence',
      // Cliopatria still shows German/Austrian rule for 1918; the Republic appears from 1919
      eraKey: '1919',
      title: 'Independence Regained',
      description:
        'As the partitioning empires collapse at the end of the First World War, Józef Piłsudski takes command in Warsaw. Poland is reborn after 123 years.',
      timestamp: '1918-11-11T00:00:00Z',
      location: { type: 'point', coordinates: [21.0122, 52.2397], zoom: COUNTRY },
      category: 'politics',
    },
    {
      id: 'battle-of-warsaw',
      eraKey: '1920',
      title: 'Miracle on the Vistula',
      description:
        'With the Red Army at the gates of Warsaw, Piłsudski\'s counterattack from the Wieprz river routs it. The victory secures Polish independence and halts the westward spread of the revolution.',
      timestamp: '1920-08-15T00:00:00Z',
      location: { type: 'point', coordinates: [21.25, 52.33], zoom: REGION },
      category: 'victory',
    },

    // ── World War II ────────────────────────────────────────────────────────
    {
      id: 'westerplatte',
      eraKey: '1939',
      title: 'Germany Invades',
      description:
        'The battleship Schleswig-Holstein opens fire on the Polish garrison at Westerplatte as the Wehrmacht crosses the border. The Second World War begins.',
      timestamp: '1939-09-01T00:00:00Z',
      location: { type: 'point', coordinates: [18.665, 54.407], zoom: REGION },
      category: 'war',
    },
    {
      id: 'soviet-invasion',
      // Cliopatria's 1939 record is pre-war; 1940 shows the German–Soviet partition
      eraKey: '1940',
      title: 'The Soviets Invade',
      description:
        'Under the secret protocol of the Molotov–Ribbentrop Pact, the Red Army invades from the east. Poland is partitioned again; its government escapes into exile.',
      timestamp: '1939-09-17T00:00:00Z',
      location: { type: 'point', coordinates: [26.0, 52.0], zoom: COUNTRY },
      category: 'war',
    },
    {
      id: 'katyn',
      eraKey: '1940',
      title: 'Katyn Massacre',
      description:
        'The NKVD shoots some 22,000 captured Polish officers, police and intelligentsia in the Katyn forest and elsewhere. Moscow blames Germany and admits the truth only in 1990.',
      timestamp: '1940-04-03T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [31.7, 54.77], zoom: REGION },
      category: 'disaster',
    },
    {
      id: 'auschwitz',
      eraKey: '1940',
      title: 'Auschwitz',
      description:
        'The first transport — Polish political prisoners — arrives at the new German camp at Oświęcim. Auschwitz-Birkenau becomes the largest Nazi death camp; about 1.1 million people are murdered there, nearly all of them Jews.',
      timestamp: '1940-06-14T00:00:00Z',
      location: { type: 'point', coordinates: [19.203, 50.034], zoom: REGION },
      category: 'disaster',
    },
    {
      id: 'ghetto-uprising',
      eraKey: '1943',
      title: 'Warsaw Ghetto Uprising',
      description:
        'As the Germans move to deport the last Jews of the Warsaw Ghetto, the Jewish Combat Organisation rises. The fighters hold out for nearly a month; the ghetto is razed.',
      timestamp: '1943-04-19T00:00:00Z',
      location: { type: 'point', coordinates: [20.993, 52.249], zoom: CITY },
      category: 'battle',
    },
    {
      id: 'warsaw-uprising',
      eraKey: '1944',
      title: 'Warsaw Uprising',
      description:
        'The Home Army rises to free the capital before the Soviets arrive. The Red Army halts across the Vistula; after 63 days the city surrenders and is systematically destroyed.',
      timestamp: '1944-08-01T00:00:00Z',
      location: { type: 'point', coordinates: [21.0067, 52.2318], zoom: CITY },
      category: 'battle',
    },

    // ── People's Republic ───────────────────────────────────────────────────
    {
      id: 'potsdam',
      // Cliopatria draws 1945–1952 Poland as part of the USSR; 1953 shows the Potsdam borders
      eraKey: '1953',
      title: 'Poland Moved West',
      description:
        'The Allies shift Poland\'s borders some 200 km westward. The eastern lands go to the USSR; former German lands up to the Oder and Neisse — Breslau becomes Wrocław — are resettled with Poles, many expelled from the east.',
      timestamp: '1945-08-02T00:00:00Z',
      location: { type: 'point', coordinates: [17.03, 51.11], zoom: COUNTRY },
      category: 'politics',
    },
    {
      id: 'poznan-1956',
      eraKey: '1956',
      title: 'Poznań June',
      description:
        'Workers\' protests for "bread and freedom" are crushed by the army, but force a change of leadership. Władysław Gomułka\'s "thaw" brings limited liberalisation.',
      timestamp: '1956-06-28T00:00:00Z',
      location: { type: 'point', coordinates: [16.92, 52.41], zoom: CITY },
      category: 'politics',
    },
    {
      id: 'pope-pilgrimage',
      eraKey: '1979',
      title: 'The Pope Comes Home',
      description:
        'Eight months after the Archbishop of Kraków becomes Pope John Paul II, he celebrates Mass for a vast crowd in Warsaw\'s Victory Square: "Let your Spirit descend, and renew the face of the earth. Of this land."',
      timestamp: '1979-06-02T00:00:00Z',
      location: { type: 'point', coordinates: [21.0115, 52.2414], zoom: CITY },
      category: 'religion',
    },
    {
      id: 'solidarity',
      eraKey: '1980',
      title: 'Solidarity',
      description:
        'Strikes at the Lenin Shipyard in Gdańsk, led by electrician Lech Wałęsa, win the right to free trade unions. Solidarity grows to some ten million members, the first independent union in the Soviet bloc.',
      timestamp: '1980-08-31T00:00:00Z',
      location: { type: 'point', coordinates: [18.6487, 54.3612], zoom: CITY },
      category: 'politics',
    },
    {
      id: 'martial-law',
      eraKey: '1981',
      title: 'Martial Law',
      description:
        'General Jaruzelski declares martial law overnight; tanks appear on the streets, Solidarity is banned and thousands are interned. The movement survives underground.',
      timestamp: '1981-12-13T00:00:00Z',
      location: { type: 'point', coordinates: [21.0281, 52.2251], zoom: CITY },
      category: 'disaster',
    },

    // ── Third Republic ──────────────────────────────────────────────────────
    {
      id: 'elections-1989',
      eraKey: '1989',
      title: 'Partly Free Elections',
      description:
        'Agreed at the Round Table talks, the elections give Solidarity all but one of the seats it may contest. Tadeusz Mazowiecki becomes the first non-communist prime minister in the Soviet bloc, and the dominoes begin to fall across Eastern Europe.',
      timestamp: '1989-06-04T00:00:00Z',
      location: { type: 'point', coordinates: [21.0285, 52.2245], zoom: COUNTRY },
      category: 'politics',
    },
    {
      id: 'nato',
      eraKey: '1999',
      title: 'Joins NATO',
      description:
        'Poland, Hungary and the Czech Republic become the first former Warsaw Pact members to join the Atlantic alliance.',
      timestamp: '1999-03-12T00:00:00Z',
      location: { type: 'point', coordinates: [21.0045, 52.2105], zoom: COUNTRY },
      category: 'politics',
    },
    {
      id: 'eu',
      eraKey: '2004',
      title: 'Joins the European Union',
      description:
        'Poland enters the EU with nine other countries in the largest single enlargement. The following two decades bring some of the fastest economic growth in Europe.',
      timestamp: '2004-05-01T00:00:00Z',
      location: { type: 'point', coordinates: [21.0175, 52.2335], zoom: COUNTRY },
      category: 'politics',
    },
    {
      id: 'smolensk',
      eraKey: '2010',
      title: 'Smolensk Air Disaster',
      description:
        'The presidential plane crashes near Smolensk on the way to the 70th anniversary of Katyn, killing President Lech Kaczyński and 95 others, including much of the country\'s political and military leadership.',
      timestamp: '2010-04-10T00:00:00Z',
      location: { type: 'point', coordinates: [32.05, 54.82], zoom: REGION },
      category: 'disaster',
    },
  ],
}
