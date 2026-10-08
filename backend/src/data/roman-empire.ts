import type { Story } from '@fact-o-map/types'

// SUBJECTO values from the aourednik historical-basemaps snapshots (500 BC – 1492), as they
// appear around the Mediterranean. Rome is crimson, its Eastern/Byzantine half imperial purple;
// rivals get their own colours and every other polity is faded out via `othersColor`.
const WEST = '#A8323E'
const EAST = '#5E2A84'
const ROME = '#8B1E3F'
const HELLENISTIC = '#3E6A9E'
const PERSIA = '#C8662B'
const CALIPHATE = '#2E7D4F'
const GERMANIC = '#7D6B3D'
const FRANKISH = '#C29B38'

const ROMAN_POLITIES: Record<string, string> = {
  // Rome
  'Rome':                 ROME,
  'Roman Republic':       ROME,
  'Roman Empire':         ROME,
  'Rome (Diocletianus)':  EAST,
  'Rome (Galerius)':      '#7A3E9D',
  'Rome (Maximian)':      WEST,
  'Rome (Constantinus)':  '#C0505A',
  'Western Roman Empire': WEST,
  'Eastern Roman Empire': EAST,
  'Byzantine Empire':     EAST,
  'Trebizond':            '#8A5BB0',

  // Italy and the western Mediterranean
  'Etrurians':           '#6B7F3A',
  'Carthaginian Empire': '#1F6F78',
  'Carthage':            '#1F6F78',
  'Numidia':             '#4E8F8A',
  'Venice':              '#2B7A9B',

  // Greek and Hellenistic world
  'Greek city-states':           '#4C7DB5',
  'Empire of Alexander':         HELLENISTIC,
  'Kingdom of Antigonus':        HELLENISTIC,
  'Kingdom of Kassander':        '#5A8FC2',
  'Kingdom of Lysimachus':       '#2F5C8A',
  'Macedon and Hellenic League': '#2F5C8A',
  'Seleucid Kingdom':            HELLENISTIC,
  'Ptolemaic Kingdom':           '#C9A227',

  // Persia
  'Achaemenid Empire': PERSIA,
  'Parthia':           PERSIA,
  'Parthian Empire':   PERSIA,
  'Persi':             PERSIA,
  'Sasanian Empire':   PERSIA,

  // Migration period
  'Hunnic Empire':      '#5C4A2E',
  'Visigoths':          GERMANIC,
  'Visigothic Kingdom': GERMANIC,
  'Vandals':            '#6E5A8A',
  'Franks':             FRANKISH,
  'Frankish Kingdom':   FRANKISH,
  'Carolingian Empire': FRANKISH,
  'Holy Roman Empire':  FRANKISH,

  // Medieval rivals
  'Umayyad Caliphate':  CALIPHATE,
  'Abbasid Caliphate':  CALIPHATE,
  'Fatimid Caliphate':  '#3C9A5F',
  'Bulgars':            '#9A7B2F',
  'Danube Bulgars':     '#9A7B2F',
  'Bulgar Khanate':     '#9A7B2F',
  'Seljuk Empire':      '#A0522D',
  'Seljuk Caliphate':   '#A0522D',
  'Mamluke Sultanate':  '#6B8E23',
  'Ottoman Empire':     '#2F6B3A',
}

// Map zoom levels used for event fly-to
const CITY = 6
const REGION = 5
const EMPIRE = 3.5

const ROME_PALATINE: [number, number] = [12.4875, 41.8894]

export const romanEmpireStory: Story = {
  id: 'roman-empire',
  title: 'Rome: The Twenty-Two Centuries',
  description:
    'From a hilltop village on the Tiber to an empire spanning three continents — and its eastern half, Byzantium, which held out until 1461. Territory shown from historical boundary snapshots.',
  displayMode: 'choropleth',
  choropleth: {
    geoJsonUrl: '/geojson/political',
    valueFormula: 'political',
    colorStops: [],  // unused in political mode
    polities: ROMAN_POLITIES,
    othersColor: 'rgba(70, 64, 54, 0.2)',
  },
  map: { center: [20, 40], zoom: 3.3, defaultStyle: 'physical' },
  timeRange: { start: '-000760-01-01T00:00:00Z', end: '1470-01-01T00:00:00Z' },
  // Boundaries sit on the turning-point dates (First Punic War, Gracchi, Augustus, Diocletian,
  // Leo III, the 1204 sack) so each event lands in its era. `end` is exclusive: the death of
  // Marcus Aurelius (17 Mar 180) opens the crisis era rather than closing the Pax Romana.
  periods: [
    {
      id: 'kingdom-early-republic',
      title: 'Kingdom & Early Republic',
      description: 'Seven kings, then a republic of consuls and Senate that fights its way to mastery of Italy.',
      start: '-000752-01-01T00:00:00Z',
      end: '-000263-06-01T00:00:00Z',
    },
    {
      id: 'punic-wars',
      title: 'Punic Wars & Mediterranean Conquest',
      description: 'Three wars with Carthage and the defeat of the Hellenistic kingdoms make Rome master of the Mediterranean.',
      start: '-000263-06-01T00:00:00Z',
      end: '-000132-06-01T00:00:00Z',
    },
    {
      id: 'fall-of-republic',
      title: 'Fall of the Republic',
      description: 'Generals with private armies tear the Republic apart in a century of civil war.',
      start: '-000132-06-01T00:00:00Z',
      end: '-000026-01-16T00:00:00Z',
    },
    {
      id: 'pax-romana',
      title: 'Pax Romana',
      description: 'Two centuries of relative peace under the emperors; the empire reaches its greatest extent.',
      start: '-000026-01-16T00:00:00Z',
      end: '0180-03-17T00:00:00Z',
    },
    {
      id: 'third-century-crisis',
      title: 'Iron & Rust: The Crisis',
      description: 'Civil wars, plague and invasions from Persia and across the Rhine and Danube; after 235 some 26 emperors rule in 50 years.',
      start: '0180-03-17T00:00:00Z',
      end: '0284-11-20T00:00:00Z',
    },
    {
      id: 'late-empire',
      title: 'Late Empire',
      description: 'Diocletian and Constantine rebuild the state, adopt Christianity and found a new capital in the East.',
      start: '0284-11-20T00:00:00Z',
      end: '0395-01-18T00:00:00Z',
    },
    {
      id: 'fall-of-the-west',
      title: 'Fall of the West',
      description: 'The western half dissolves into Germanic kingdoms while the East holds firm.',
      start: '0395-01-18T00:00:00Z',
      end: '0476-09-05T00:00:00Z',
    },
    {
      id: 'early-byzantium',
      title: 'Early Byzantium',
      description: 'Justinian reconquers the West, then plague, Persia and the Arab conquests strip the empire to its core.',
      start: '0476-09-05T00:00:00Z',
      end: '0717-03-25T00:00:00Z',
    },
    {
      id: 'middle-byzantium',
      title: 'Middle Byzantium',
      description: 'A Greek, Orthodox empire survives the Arabs, peaks under Basil II, then loses Anatolia to the Turks.',
      start: '0717-03-25T00:00:00Z',
      end: '1204-04-13T00:00:00Z',
    },
    {
      id: 'late-byzantium',
      title: 'Last Centuries',
      description: 'Sacked by crusaders and encircled by the Ottomans, Byzantium shrinks to a city and a few outposts.',
      start: '1204-04-13T00:00:00Z',
      end: '1461-12-31T00:00:00Z',
    },
  ],
  events: [
    // ── Kingdom and early Republic ──────────────────────────────────────────
    {
      id: 'founding-of-rome',
      eraKey: 'bc500',
      title: 'Founding of Rome',
      description:
        'By tradition, Romulus founds the city on the Palatine Hill after killing his twin Remus. Archaeology shows Iron Age huts on the Palatine from around this time; Rome is ruled by kings for the next two and a half centuries.',
      timestamp: '-000752-04-21T00:00:00Z',
      location: { type: 'point', coordinates: ROME_PALATINE, zoom: CITY },
      category: 'politics',
    },
    {
      id: 'republic-founded',
      eraKey: 'bc500',
      title: 'The Republic Is Founded',
      description:
        'The last king, Tarquin the Proud, is expelled. Power passes to two annually elected consuls and the Senate — a constitution that will endure for nearly five centuries. Rome is still a modest city-state in the shadow of the Etruscans.',
      timestamp: '-000508-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [12.4823, 41.8933], zoom: REGION },
      category: 'politics',
    },
    {
      id: 'gallic-sack',
      eraKey: 'bc400',
      title: 'The Gauls Sack Rome',
      description:
        'Senones under Brennus rout the Roman army at the Allia and sack the city. "Vae victis" — woe to the vanquished. The trauma leads Rome to build the Servian Wall and never again leave itself undefended.',
      timestamp: '-000389-07-18T00:00:00Z',
      location: { type: 'point', coordinates: [12.56, 42.02], zoom: REGION },
      category: 'battle',
    },
    {
      id: 'sentinum',
      eraKey: 'bc300',
      title: 'Battle of Sentinum',
      description:
        'Rome defeats a coalition of Samnites, Gauls, Etruscans and Umbrians — the largest battle yet fought in Italy. It decides the Samnite Wars and makes Rome master of central Italy.',
      timestamp: '-000294-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [12.86, 43.43], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'asculum',
      eraKey: 'bc300',
      title: 'Pyrrhus at Asculum',
      description:
        'King Pyrrhus of Epirus beats the Romans for the second time but loses so many men that he reportedly says one more such victory will ruin him. Rome outlasts him and by 270 BC controls the entire Italian peninsula.',
      timestamp: '-000278-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [15.56, 41.21], zoom: REGION },
      category: 'battle',
    },

    // ── Punic Wars and the Mediterranean ────────────────────────────────────
    {
      id: 'aegates',
      eraKey: 'bc300',
      title: 'Aegates Islands — First Punic War Won',
      description:
        'A newly built Roman fleet destroys the Carthaginian navy off western Sicily, ending a 23-year war. Sicily becomes Rome\'s first overseas province, soon followed by Sardinia and Corsica.',
      timestamp: '-000240-03-10T00:00:00Z',
      location: { type: 'point', coordinates: [12.25, 37.97], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'hannibal-alps',
      eraKey: 'bc200',
      title: 'Hannibal Crosses the Alps',
      description:
        'Hannibal marches from Spain over the Pyrenees and the Alps with some 40,000 men and his war elephants, invading Italy from the north and opening the Second Punic War.',
      timestamp: '-000217-10-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [6.95, 45.25], zoom: REGION },
      category: 'military',
    },
    {
      id: 'cannae',
      eraKey: 'bc200',
      title: 'Battle of Cannae',
      description:
        'Hannibal\'s double envelopment annihilates a Roman army of some 80,000 in a single afternoon — one of the bloodiest days in the history of warfare. Rome refuses to negotiate and fights on.',
      timestamp: '-000215-08-02T00:00:00Z',
      location: { type: 'point', coordinates: [16.1325, 41.3064], zoom: REGION },
      category: 'battle',
    },
    {
      id: 'zama',
      eraKey: 'bc200',
      title: 'Battle of Zama',
      description:
        'Scipio Africanus carries the war to Africa and defeats Hannibal near Carthage. Carthage surrenders its fleet and its Spanish lands; Rome is now the leading power of the western Mediterranean.',
      timestamp: '-000201-10-19T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [9.45, 36.3], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'pydna',
      eraKey: 'bc200',
      title: 'Battle of Pydna',
      description:
        'The legion breaks the Macedonian phalanx. The Antigonid kingdom of Alexander\'s homeland is dissolved, and the Hellenistic East begins to fall under Roman sway.',
      timestamp: '-000167-06-22T00:00:00Z',
      location: { type: 'point', coordinates: [22.58, 40.37], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'carthage-destroyed',
      eraKey: 'bc100',
      title: 'Carthage and Corinth Destroyed',
      description:
        'After a three-year siege, Carthage is razed and its people enslaved; the same year Corinth is sacked. Africa and Macedonia become provinces. The Mediterranean is becoming "Mare Nostrum" — our sea.',
      timestamp: '-000145-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [10.323, 36.853], zoom: REGION },
      category: 'disaster',
    },

    // ── Fall of the Republic ────────────────────────────────────────────────
    {
      id: 'alesia',
      eraKey: 'bc1',
      title: 'Siege of Alesia',
      description:
        'Julius Caesar besieges Vercingetorix inside Alesia while holding off a Gallic relief army behind a second ring of fortifications. The surrender ends Gallic resistance and gives Caesar a loyal, battle-hardened army.',
      timestamp: '-000051-09-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [4.5, 47.54], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'rubicon',
      eraKey: 'bc1',
      title: 'Caesar Crosses the Rubicon',
      description:
        '"The die is cast." Caesar leads a legion across the river marking the border of Italy, an act of treason that starts the civil war against Pompey and the Senate.',
      timestamp: '-000048-01-10T00:00:00Z',
      location: { type: 'point', coordinates: [12.43, 44.16], zoom: CITY },
      category: 'politics',
    },
    {
      id: 'ides-of-march',
      eraKey: 'bc1',
      title: 'The Ides of March',
      description:
        'Caesar, now dictator for life, is stabbed 23 times by senators led by Brutus and Cassius in the Curia of Pompey. Their attempt to save the Republic triggers another thirteen years of civil war.',
      timestamp: '-000043-03-15T00:00:00Z',
      location: { type: 'point', coordinates: [12.4765, 41.8953], zoom: CITY },
      category: 'politics',
    },
    {
      id: 'actium',
      eraKey: 'bc1',
      title: 'Battle of Actium',
      description:
        'Octavian\'s fleet under Agrippa defeats Mark Antony and Cleopatra. Within a year both are dead and Egypt — the last great Hellenistic kingdom — is annexed as Octavian\'s personal province.',
      timestamp: '-000030-09-02T00:00:00Z',
      location: { type: 'point', coordinates: [20.75, 38.95], zoom: REGION },
      category: 'victory',
    },

    // ── Principate ──────────────────────────────────────────────────────────
    {
      id: 'augustus',
      eraKey: 'bc1',
      title: 'Octavian Becomes Augustus',
      description:
        'The Senate grants Octavian the name Augustus. Keeping the forms of the Republic while holding real power, he becomes the first emperor. The Pax Romana — two centuries of relative peace — begins.',
      timestamp: '-000026-01-16T00:00:00Z',
      location: { type: 'point', coordinates: [12.4853, 41.8925], zoom: CITY },
      category: 'politics',
    },
    {
      id: 'teutoburg',
      eraKey: 'bc1',
      title: 'Teutoburg Forest',
      description:
        'Arminius, a Germanic officer in Roman service, lures three legions under Varus into an ambush and destroys them. "Varus, give me back my legions!" Rome abandons plans to push the frontier to the Elbe; the Rhine becomes the border.',
      timestamp: '0009-09-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [8.13, 52.41], zoom: REGION },
      category: 'battle',
    },
    {
      id: 'britain',
      eraKey: '100',
      title: 'Invasion of Britain',
      description:
        'Claudius sends four legions across the Channel, landing at Richborough. Southern Britain becomes a province; the conquest pushes north for the next four decades.',
      timestamp: '0043-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [1.33, 51.29], zoom: REGION },
      category: 'military',
    },
    {
      id: 'great-fire',
      eraKey: '100',
      title: 'Great Fire of Rome',
      description:
        'A fire starting near the Circus Maximus burns for six days and guts much of the city. Nero rebuilds lavishly, including his Golden House, and blames the city\'s Christians.',
      timestamp: '0064-07-19T00:00:00Z',
      location: { type: 'point', coordinates: [12.4853, 41.8858], zoom: CITY },
      category: 'disaster',
    },
    {
      id: 'jerusalem',
      eraKey: '100',
      title: 'Siege of Jerusalem',
      description:
        'Titus captures Jerusalem and destroys the Second Temple, crushing the First Jewish–Roman War. The spoils help pay for the Colosseum, and the scene is carved on the Arch of Titus in Rome.',
      timestamp: '0070-08-30T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [35.2354, 31.7781], zoom: REGION },
      category: 'military',
    },
    {
      id: 'vesuvius',
      eraKey: '100',
      title: 'Eruption of Vesuvius',
      description:
        'Pompeii and Herculaneum are buried under ash and pyroclastic flows. Pliny the Elder dies trying to rescue survivors; the cities lie preserved for 1,700 years.',
      timestamp: '0079-10-24T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [14.4847, 40.7491], zoom: CITY },
      category: 'disaster',
    },
    {
      id: 'dacia',
      eraKey: '100',
      title: 'Conquest of Dacia',
      description:
        'Trajan takes the Dacian capital Sarmizegetusa; King Decebalus takes his own life. The gold mines of Dacia fund a building boom in Rome, and the campaign is recorded on Trajan\'s Column.',
      timestamp: '0106-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [23.31, 45.62], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'greatest-extent',
      eraKey: '100',
      title: 'The Empire at Its Greatest Extent',
      description:
        'After taking the Parthian capital Ctesiphon, Trajan reaches the Persian Gulf. At his death the empire covers some 5 million km² and perhaps 60 million people, from Scotland to Mesopotamia. Hadrian soon gives up the Mesopotamian conquests.',
      timestamp: '0117-08-08T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [44.58, 33.09], zoom: EMPIRE },
      category: 'military',
    },
    {
      id: 'hadrians-wall',
      eraKey: '100',
      title: 'Hadrian\'s Wall',
      description:
        'Hadrian turns from expansion to consolidation. In Britain he builds a 117 km wall from coast to coast — the most famous of the fortified frontiers that now ring the empire.',
      timestamp: '0122-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [-2.33, 55.01], zoom: REGION },
      category: 'military',
    },
    {
      id: 'marcus-aurelius',
      eraKey: '200',
      title: 'Death of Marcus Aurelius',
      description:
        'The philosopher-emperor dies on campaign against the Marcomanni on the Danube, probably at Vindobona (Vienna). His son Commodus succeeds him; the historian Cassius Dio marks this as the fall from an age of gold to one of iron and rust.',
      timestamp: '0180-03-17T00:00:00Z',
      location: { type: 'point', coordinates: [16.37, 48.21], zoom: REGION },
      category: 'politics',
    },
    {
      id: 'constitutio-antoniniana',
      eraKey: '200',
      title: 'Citizenship for All',
      description:
        'Caracalla\'s Constitutio Antoniniana grants Roman citizenship to nearly every free person in the empire — the culmination of centuries of gradual enfranchisement.',
      timestamp: '0212-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [12.4846, 41.8932], zoom: CITY },
      category: 'politics',
    },

    // ── Crisis and recovery ─────────────────────────────────────────────────
    {
      id: 'edessa',
      eraKey: '300',
      title: 'An Emperor Captured',
      description:
        'At the height of the Crisis of the Third Century, Emperor Valerian is defeated and captured by the Persian king Shapur I at Edessa — he dies in captivity. The empire briefly splinters into Gallic, Palmyrene and central realms.',
      timestamp: '0260-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [38.79, 37.16], zoom: REGION },
      category: 'battle',
    },
    {
      id: 'palmyra',
      eraKey: '300',
      title: 'Aurelian Reunites the Empire',
      description:
        'Aurelian defeats Queen Zenobia of Palmyra in the east and then the Gallic Empire in the west, earning the title Restitutor Orbis — Restorer of the World. He also rings Rome with new walls.',
      timestamp: '0273-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [38.27, 34.55], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'tetrarchy',
      eraKey: '300',
      title: 'The Tetrarchy',
      description:
        'Diocletian splits imperial rule between two senior emperors (Augusti) and two juniors (Caesars), each with his own capital — Nicomedia, Milan, Sirmium, Trier. The map shows the four zones of authority.',
      timestamp: '0293-03-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [29.92, 40.77], zoom: EMPIRE },
      category: 'politics',
    },
    {
      id: 'milvian-bridge',
      eraKey: '300',
      title: 'Battle of the Milvian Bridge',
      description:
        'Constantine defeats his rival Maxentius outside Rome, reportedly after a vision of the cross. The next year the Edict of Milan grants toleration to Christians.',
      timestamp: '0312-10-28T00:00:00Z',
      location: { type: 'point', coordinates: [12.4673, 41.9355], zoom: CITY },
      category: 'religion',
    },
    {
      id: 'nicaea',
      eraKey: '300',
      title: 'Council of Nicaea',
      description:
        'Constantine summons some 300 bishops to settle the Arian controversy. The Nicene Creed becomes the foundation of Christian orthodoxy — and the emperor the arbiter of the Church.',
      timestamp: '0325-05-20T00:00:00Z',
      location: { type: 'point', coordinates: [29.72, 40.43], zoom: CITY },
      category: 'religion',
    },
    {
      id: 'constantinople',
      eraKey: '300',
      title: 'Constantinople Dedicated',
      description:
        'Constantine refounds the Greek city of Byzantium on the Bosporus as his "New Rome". Commanding the crossing between Europe and Asia, it will be the empire\'s capital for over 1,100 years.',
      timestamp: '0330-05-11T00:00:00Z',
      location: { type: 'point', coordinates: [28.9768, 41.0082], zoom: CITY },
      category: 'politics',
    },

    // ── Fall of the West ────────────────────────────────────────────────────
    {
      id: 'adrianople',
      eraKey: '400',
      title: 'Battle of Adrianople',
      description:
        'Gothic refugees, mistreated after crossing the Danube, revolt and destroy the eastern field army. Emperor Valens is killed. The Goths settle inside the empire as a semi-independent people.',
      timestamp: '0378-08-09T00:00:00Z',
      location: { type: 'point', coordinates: [26.56, 41.68], zoom: REGION },
      category: 'battle',
    },
    {
      id: 'division',
      eraKey: '400',
      title: 'The Empire Divided',
      description:
        'Theodosius I, the last emperor to rule both halves, dies in Milan. The empire passes to his sons — Arcadius in the East, Honorius in the West — and is never united under one ruler again.',
      timestamp: '0395-01-17T00:00:00Z',
      location: { type: 'point', coordinates: [9.19, 45.46], zoom: EMPIRE },
      category: 'politics',
    },
    {
      id: 'sack-of-rome-410',
      eraKey: '400',
      title: 'Alaric Sacks Rome',
      description:
        'The Visigoths under Alaric sack Rome — the first time in 800 years the city has fallen to a foreign enemy. The court has already moved to Ravenna, but the shock echoes across the Roman world; Augustine writes "The City of God" in response.',
      timestamp: '0410-08-24T00:00:00Z',
      location: { type: 'point', coordinates: [12.4911, 41.9031], zoom: CITY },
      category: 'disaster',
    },
    {
      id: 'catalaunian-plains',
      eraKey: '400',
      title: 'Catalaunian Plains',
      description:
        'The general Aetius, with Visigothic allies, halts Attila\'s invasion of Gaul in one of the last great victories of the Western empire. Attila invades Italy the following year, then dies in 453.',
      timestamp: '0451-06-20T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [4.36, 48.95], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'fall-of-the-west',
      eraKey: '500',
      title: 'End of the Western Empire',
      description:
        'The Germanic general Odoacer deposes the boy-emperor Romulus Augustulus at Ravenna and sends the imperial regalia to Constantinople. The traditional end of the Western Roman Empire — the East carries on.',
      timestamp: '0476-09-04T00:00:00Z',
      location: { type: 'point', coordinates: [12.2, 44.42], zoom: REGION },
      category: 'disaster',
    },

    // ── Byzantium ───────────────────────────────────────────────────────────
    {
      id: 'justinian-reconquest',
      eraKey: '600',
      title: 'Justinian\'s Reconquest',
      description:
        'Belisarius destroys the Vandal kingdom and retakes Carthage. Over the next two decades Italy and southern Spain follow, and the Mediterranean is briefly a Roman lake again. Justinian\'s Code meanwhile preserves Roman law for posterity.',
      timestamp: '0533-09-13T00:00:00Z',
      location: { type: 'point', coordinates: [10.2, 36.75], zoom: EMPIRE },
      category: 'victory',
    },
    {
      id: 'hagia-sophia',
      eraKey: '600',
      title: 'Hagia Sophia Consecrated',
      description:
        'Justinian\'s great church, built in under six years, is consecrated. Crowned by a 31-metre dome, it will remain the largest cathedral in the world for nearly a thousand years. "Solomon, I have outdone thee."',
      timestamp: '0537-12-27T00:00:00Z',
      location: { type: 'point', coordinates: [28.9802, 41.0086], zoom: CITY },
      category: 'culture',
    },
    {
      id: 'plague-of-justinian',
      eraKey: '600',
      title: 'Plague of Justinian',
      description:
        'The first recorded pandemic of bubonic plague arrives via Egypt and reaches Constantinople in 542, killing perhaps a fifth of the capital. Recurring waves for two centuries sap the empire\'s manpower and revenue.',
      timestamp: '0541-01-01T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [32.57, 31.04], zoom: REGION },
      category: 'disaster',
    },
    {
      id: 'nineveh',
      eraKey: '600',
      title: 'Heraclius Triumphs at Nineveh',
      description:
        'After the Persians overrun Syria, Egypt and reach the Bosporus, Heraclius strikes into Mesopotamia and wins decisively at Nineveh, ending the last great Roman–Persian war. Both empires are left exhausted.',
      timestamp: '0627-12-12T00:00:00Z',
      location: { type: 'point', coordinates: [43.15, 36.36], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'yarmouk',
      eraKey: '700',
      title: 'Battle of the Yarmouk',
      description:
        'The armies of the new Islamic Caliphate crush the Byzantine army. Syria, Palestine and soon Egypt are lost forever; within a decade the empire is reduced to Anatolia, the Balkans and fragments of Italy and Africa.',
      timestamp: '0636-08-20T00:00:00Z',
      location: { type: 'point', coordinates: [35.95, 32.8], zoom: REGION },
      category: 'battle',
    },
    {
      id: 'siege-717',
      eraKey: '700',
      title: 'Second Arab Siege of Constantinople',
      description:
        'The Theodosian Walls, Greek fire, a Bulgar alliance and a brutal winter defeat a vast Umayyad army and fleet. Leo III\'s victory halts the Arab advance into Europe from the east.',
      timestamp: '0717-07-15T00:00:00Z',
      datePrecision: 'year',
      location: { type: 'point', coordinates: [28.925, 41.02], zoom: CITY },
      category: 'victory',
    },
    {
      id: 'charlemagne',
      eraKey: '800',
      title: 'A Rival Emperor in the West',
      description:
        'Pope Leo III crowns Charlemagne "Emperor of the Romans" in St Peter\'s. Constantinople is outraged — to the Byzantines, they alone are the Romans. The "two-emperors problem" lasts for centuries.',
      timestamp: '0800-12-25T00:00:00Z',
      location: { type: 'point', coordinates: [12.4534, 41.9022], zoom: CITY },
      category: 'politics',
    },
    {
      id: 'kleidion',
      eraKey: '1000',
      title: 'Basil the Bulgar-Slayer',
      description:
        'Basil II traps the Bulgarian army at Kleidion; according to the chroniclers he blinds 15,000 prisoners. Bulgaria is annexed by 1018, and at Basil\'s death the empire is at its medieval peak.',
      timestamp: '1014-07-29T00:00:00Z',
      location: { type: 'point', coordinates: [23.1, 41.4], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'great-schism',
      eraKey: '1000',
      title: 'The Great Schism',
      description:
        'Papal legates lay a bull excommunicating the Patriarch on the altar of Hagia Sophia; he excommunicates them in turn. The split between the Catholic West and Orthodox East has never fully healed.',
      timestamp: '1054-07-16T00:00:00Z',
      location: { type: 'point', coordinates: [28.985, 41.012], zoom: CITY },
      category: 'religion',
    },
    {
      id: 'manzikert',
      eraKey: '1100',
      title: 'Battle of Manzikert',
      description:
        'The Seljuk Turks under Alp Arslan defeat and capture Emperor Romanos IV. Civil war follows, and Turkish settlers pour into Anatolia — the empire\'s heartland and recruiting ground.',
      timestamp: '1071-08-26T00:00:00Z',
      location: { type: 'point', coordinates: [42.52, 39.14], zoom: REGION },
      category: 'battle',
    },
    {
      id: 'first-crusade-nicaea',
      eraKey: '1100',
      title: 'Nicaea Retaken',
      description:
        'Alexios I Komnenos appeals to the West for help; the First Crusade arrives and, with Byzantine support, retakes Nicaea from the Seljuks. The Komnenian emperors restore much of western Anatolia.',
      timestamp: '1097-06-19T00:00:00Z',
      location: { type: 'point', coordinates: [29.72, 40.43], zoom: REGION },
      category: 'victory',
    },
    {
      id: 'sack-1204',
      eraKey: '1200',
      title: 'The Fourth Crusade Sacks Constantinople',
      description:
        'Diverted by Venetian debts and Byzantine dynastic intrigue, the crusaders storm and loot the city. A Latin Empire is set up; Byzantine successor states survive at Nicaea, Epirus and Trebizond.',
      timestamp: '1204-04-13T00:00:00Z',
      location: { type: 'point', coordinates: [28.945, 41.035], zoom: CITY },
      category: 'disaster',
    },
    {
      id: 'recapture-1261',
      eraKey: '1279',
      title: 'Constantinople Regained',
      description:
        'Forces of the Empire of Nicaea slip into the lightly defended city. Michael VIII Palaiologos enters through the Golden Gate; the empire is restored, though poorer and smaller than ever.',
      timestamp: '1261-07-25T00:00:00Z',
      location: { type: 'point', coordinates: [28.922, 40.993], zoom: CITY },
      category: 'victory',
    },
    {
      id: 'gallipoli',
      eraKey: '1400',
      title: 'The Ottomans Cross into Europe',
      description:
        'An earthquake shatters the walls of Gallipoli and the Ottomans occupy it — their first permanent foothold in Europe. Within decades they surround Constantinople on all sides.',
      timestamp: '1354-03-02T00:00:00Z',
      location: { type: 'point', coordinates: [26.67, 40.41], zoom: REGION },
      category: 'military',
    },
    {
      id: 'ankara',
      eraKey: '1400',
      title: 'Timur at Ankara',
      description:
        'Timur destroys the Ottoman army and captures Sultan Bayezid, who was besieging Constantinople. The Ottoman state falls into civil war, buying the Byzantine city-state another half-century.',
      timestamp: '1402-07-20T00:00:00Z',
      location: { type: 'point', coordinates: [32.9, 40.05], zoom: REGION },
      category: 'battle',
    },
    {
      id: 'fall-of-constantinople',
      eraKey: '1400',
      title: 'Fall of Constantinople',
      description:
        'After a 53-day siege by Mehmed II\'s cannon, the Ottomans break through near the Gate of St Romanus. Constantine XI dies in the fighting. The Roman Empire, 2,200 years after the founding of the city, comes to an end.',
      timestamp: '1453-05-29T00:00:00Z',
      location: { type: 'point', coordinates: [28.922, 41.019], zoom: 4.5 },
      category: 'disaster',
    },
    {
      id: 'trebizond',
      eraKey: '1492',
      title: 'The Last Roman State Falls',
      description:
        'Trebizond, the Black Sea empire of the Grand Komnenoi, surrenders to Mehmed II. With it disappears the last independent Byzantine state; Mehmed styles himself Kayser-i Rûm — Caesar of Rome.',
      timestamp: '1461-08-15T00:00:00Z',
      location: { type: 'point', coordinates: [39.72, 41.0], zoom: REGION },
      category: 'disaster',
    },
  ],
}
