import type { Story } from '@chronomap/types'

export const stories: Story[] = [
  {
    id: 'dday-normandy',
    title: 'D-Day: The Normandy Landings',
    description:
      'The Allied invasion of Nazi-occupied France on June 6, 1944 — the largest seaborne invasion in history.',
    map: {
      center: [-0.85, 49.38],
      zoom: 9,
      pitch: 30,
    },
    timeRange: {
      start: '1944-06-06T00:00:00Z',
      end: '1944-08-25T00:00:00Z',
    },
    events: [
      {
        id: 'airborne-drop',
        title: 'Allied Airborne Drops',
        description:
          'American 82nd and 101st Airborne divisions drop behind enemy lines to secure roads and bridges.',
        timestamp: '1944-06-06T00:16:00Z',
        location: { type: 'point', coordinates: [-1.23, 49.43] },
        category: 'military',
      },
      {
        id: 'utah-beach',
        title: 'Utah Beach',
        description:
          'US 4th Infantry Division lands at Utah Beach. Lightest casualties of any beach — about 197 men.',
        timestamp: '1944-06-06T06:30:00Z',
        location: { type: 'point', coordinates: [-1.19, 49.41] },
        category: 'landing',
      },
      {
        id: 'omaha-beach',
        title: 'Omaha Beach — Bloody Omaha',
        description:
          'US 1st and 29th Infantry Divisions face devastating fire. Over 2,000 American casualties in a single day.',
        timestamp: '1944-06-06T06:30:00Z',
        location: { type: 'point', coordinates: [-0.86, 49.37] },
        category: 'landing',
      },
      {
        id: 'gold-beach',
        title: 'Gold Beach',
        description:
          'British 50th Infantry Division lands at Gold Beach, capturing Arromanches and linking with Juno Beach.',
        timestamp: '1944-06-06T07:25:00Z',
        location: { type: 'point', coordinates: [-0.6, 49.34] },
        category: 'landing',
      },
      {
        id: 'juno-beach',
        title: 'Juno Beach',
        description:
          'Canadian 3rd Infantry Division lands at Juno. Canadians advance further inland than any other Allied force on D-Day.',
        timestamp: '1944-06-06T07:45:00Z',
        location: { type: 'point', coordinates: [-0.33, 49.33] },
        category: 'landing',
      },
      {
        id: 'sword-beach',
        title: 'Sword Beach',
        description:
          'British 3rd Infantry Division lands at Sword and pushes toward Caen. Deepest Allied penetration on D-Day.',
        timestamp: '1944-06-06T07:25:00Z',
        location: { type: 'point', coordinates: [-0.19, 49.31] },
        category: 'landing',
      },
      {
        id: 'cherbourg',
        title: 'Fall of Cherbourg',
        description:
          'US forces capture the vital port city of Cherbourg after weeks of fighting, giving the Allies a major supply harbour.',
        timestamp: '1944-06-26T12:00:00Z',
        location: { type: 'point', coordinates: [-1.62, 49.64] },
        category: 'battle',
      },
      {
        id: 'operation-cobra',
        title: 'Operation Cobra',
        description:
          'Massive Allied breakout from Normandy. US First Army punches through German lines near Saint-Lô.',
        timestamp: '1944-07-25T09:00:00Z',
        location: { type: 'point', coordinates: [-1.09, 49.12] },
        category: 'battle',
      },
      {
        id: 'paris-liberation',
        title: 'Liberation of Paris',
        description:
          'French 2nd Armored Division and US 4th Infantry Division enter Paris. German commander von Choltitz surrenders.',
        timestamp: '1944-08-25T15:00:00Z',
        location: { type: 'point', coordinates: [2.35, 48.85] },
        category: 'victory',
      },
    ],
  },
  {
    id: 'alan-turing',
    title: 'The Life of Alan Turing',
    description:
      'Pioneer of theoretical computer science and artificial intelligence, codebreaker and visionary mathematician.',
    map: {
      center: [-1.5, 52.2],
      zoom: 6,
    },
    timeRange: {
      start: '1912-06-23T00:00:00Z',
      end: '1954-06-07T00:00:00Z',
    },
    events: [
      {
        id: 'born-london',
        title: 'Born in London',
        description: 'Alan Mathison Turing born in Maida Vale, London.',
        timestamp: '1912-06-23T00:00:00Z',
        location: { type: 'point', coordinates: [-0.18, 51.52] },
        category: 'life',
      },
      {
        id: 'cambridge',
        title: 'King\'s College, Cambridge',
        description:
          'Turing reads mathematics at King\'s College, graduating with first-class honours in 1934.',
        timestamp: '1931-10-01T00:00:00Z',
        location: { type: 'point', coordinates: [0.12, 52.2] },
        category: 'education',
      },
      {
        id: 'turing-machine',
        title: 'The Turing Machine Paper',
        description:
          'Publishes "On Computable Numbers" — introducing the Turing Machine concept and laying the foundations of computer science.',
        timestamp: '1936-11-12T00:00:00Z',
        location: { type: 'point', coordinates: [0.12, 52.2] },
        category: 'achievement',
      },
      {
        id: 'bletchley',
        title: 'Bletchley Park — Codebreaker',
        description:
          'Turing leads the team that breaks the German Naval Enigma cipher, saving countless Allied lives.',
        timestamp: '1939-09-04T00:00:00Z',
        location: { type: 'point', coordinates: [-0.74, 52.0] },
        category: 'achievement',
      },
      {
        id: 'npm-teddington',
        title: 'National Physical Laboratory, Teddington',
        description:
          'Designs ACE (Automatic Computing Engine), one of the first designs for a stored-program computer.',
        timestamp: '1945-10-01T00:00:00Z',
        location: { type: 'point', coordinates: [-0.33, 51.42] },
        category: 'achievement',
      },
      {
        id: 'manchester',
        title: 'University of Manchester',
        description:
          'Joins Manchester Computing Laboratory; works on software for the Manchester Mark 1, one of the first electronic computers.',
        timestamp: '1948-05-01T00:00:00Z',
        location: { type: 'point', coordinates: [-2.23, 53.47] },
        category: 'education',
      },
      {
        id: 'turing-test',
        title: '"Computing Machinery and Intelligence"',
        description:
          'Publishes the paper introducing the Turing Test: "Can machines think?" — founding question of AI.',
        timestamp: '1950-10-01T00:00:00Z',
        location: { type: 'point', coordinates: [-2.23, 53.47] },
        category: 'achievement',
      },
      {
        id: 'death-wilmslow',
        title: 'Death in Wilmslow',
        description:
          'Turing found dead at his home in Wilmslow, Cheshire. Cause: cyanide poisoning. He was 41.',
        timestamp: '1954-06-07T00:00:00Z',
        location: { type: 'point', coordinates: [-2.23, 53.33] },
        category: 'life',
      },
    ],
  },
]
