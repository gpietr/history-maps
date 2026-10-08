import { unzipSync } from 'fflate'
import { mkdir, rename } from 'node:fs/promises'
import { join } from 'node:path'

// Cliopatria (Seshat Global History Databank, CC BY 4.0): ~14k polity records, each valid for a
// FromYear–ToYear range, so borders can be drawn for any year from 3400 BCE to 2024 — unlike the
// century-ish snapshots of historical-basemaps. https://github.com/Seshat-Global-History-Databank/cliopatria
//
// The dataset is ~170 MB unzipped and ~600 MB once parsed, so the server never loads it. Missing
// years are extracted by running this file as a child process, which writes one small snapshot per
// year to backend/.cache and exits — returning its memory. Snapshots persist across restarts.

// Pinned to a commit so borders don't shift under the stories when the dataset is revised.
const COMMIT = '5f433377139a6eeaeacbdc894b70f8805b72c8b5'
const ZIP_URL = `https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/${COMMIT}/cliopatria.geojson.zip`
const CACHE_DIR = join(import.meta.dir, '..', '.cache')
const DATASET_FILE = join(CACHE_DIR, `cliopatria-${COMMIT.slice(0, 8)}.geojson`)
// Bump the suffix when snapshot() output changes, so stale snapshots are re-extracted.
const SNAPSHOT_DIR = join(CACHE_DIR, `cliopatria-${COMMIT.slice(0, 8)}-v1`)

export const MIN_YEAR = -3400
export const MAX_YEAR = 2024

const snapshotFile = (year: number) => join(SNAPSHOT_DIR, `${year}.json`)

// ── Server side ──────────────────────────────────────────────────────────────

let pending: Promise<void> | null = null

async function runExtraction(years: number[]) {
  const proc = Bun.spawn([process.execPath, import.meta.path, ...years.map(String)], {
    stdout: 'inherit',
    stderr: 'inherit',
  })
  if ((await proc.exited) !== 0) throw new Error(`Cliopatria extraction failed for ${years.join(', ')}`)
}

/**
 * Borders for `year` as a GeoJSON response. `warmYears` are extracted in the same pass, so one
 * parse of the dataset covers every year the stories use.
 */
export async function getCliopatriaYear(year: number, warmYears: number[] = []): Promise<Response> {
  while (!(await Bun.file(snapshotFile(year)).exists())) {
    if (pending) {
      await pending
      continue
    }
    const candidates = [...new Set([year, ...warmYears])]
    const exists = await Promise.all(candidates.map((y) => Bun.file(snapshotFile(y)).exists()))
    pending = runExtraction(candidates.filter((_, i) => !exists[i])).finally(() => { pending = null })
  }
  return new Response(Bun.file(snapshotFile(year)), { headers: { 'content-type': 'application/json' } })
}

// ── Extraction (child process) ───────────────────────────────────────────────

type ClioFeature = {
  geometry: { type: string; coordinates: unknown } | null
  properties: { Name: string; FromYear: number; ToYear: number }
}

async function loadDataset(): Promise<ClioFeature[]> {
  let text: string
  if (await Bun.file(DATASET_FILE).exists()) {
    text = await Bun.file(DATASET_FILE).text()
  } else {
    console.log('Downloading Cliopatria dataset (~46 MB)…')
    const res = await fetch(ZIP_URL)
    if (!res.ok) throw new Error(`Cliopatria download failed: ${res.status}`)
    const entries = unzipSync(new Uint8Array(await res.arrayBuffer()))
    const name = Object.keys(entries).find((n) => n.endsWith('.geojson'))
    if (!name) throw new Error('Cliopatria zip contains no .geojson')
    await mkdir(CACHE_DIR, { recursive: true })
    await Bun.write(DATASET_FILE, entries[name])
    text = new TextDecoder().decode(entries[name])
  }
  return (JSON.parse(text) as { features: ClioFeature[] }).features
}

// ~11 m precision is plenty for country-scale borders and roughly halves the payload.
function round(coords: unknown): unknown {
  return Array.isArray(coords) ? coords.map(round) : Math.round((coords as number) * 1e4) / 1e4
}

function snapshot(features: ClioFeature[], year: number): object {
  return {
    type: 'FeatureCollection',
    features: features
      // Names in parentheses are overlay relations (personal unions, vassalage) that duplicate
      // the member polities' polygons; drawing them would stack fills on top of each other.
      .filter((f) => f.geometry && f.properties.FromYear <= year && year <= f.properties.ToYear
        && !f.properties.Name.startsWith('('))
      .map((f) => ({
        type: 'Feature',
        // NAME/SUBJECTO match the historical-basemaps schema the frontend colours and labels by.
        properties: { NAME: f.properties.Name, SUBJECTO: f.properties.Name },
        geometry: { type: f.geometry!.type, coordinates: round(f.geometry!.coordinates) },
      })),
  }
}

if (import.meta.main) {
  const years = process.argv.slice(2).map(Number)
  const features = await loadDataset()
  await mkdir(SNAPSHOT_DIR, { recursive: true })
  for (const y of years) {
    // Write then rename, so the server never serves a half-written snapshot.
    await Bun.write(`${snapshotFile(y)}.tmp`, JSON.stringify(snapshot(features, y)))
    await rename(`${snapshotFile(y)}.tmp`, snapshotFile(y))
  }
  console.log(`Cliopatria: extracted ${years.length} year(s)`)
}
