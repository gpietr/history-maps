import { Story } from "@fact-o-map/types";

export const story: Story = {
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
  }