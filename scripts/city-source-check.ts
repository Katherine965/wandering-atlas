import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type Place = { name: string; latitude: number; longitude: number };
type Country = { name: string; cities: Place[] };
type Source = { license: string; sha256: string; country_code?: string };
type RecordEvidence = {
  country: string; city: string; source_key: string; source_id: string;
  tsv_line?: string; record_sha256: string;
  feature?: { properties: { NE_ID: number; LATITUDE: number; LONGITUDE: number } };
};
const digest = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");

export function csvRows(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (c === "," && !quoted) { row.push(field); field = ""; }
    else if (c === "\n" && !quoted) { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  assert.ok(!quoted, "Unclosed CSV quote");
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export async function checkCitySources(base: string, built = false): Promise<void> {
  const metadata = JSON.parse(await readFile(join(base, "docs/DATA_SOURCES.json"), "utf8")).city_mapping;
  assert.ok(metadata.status.startsWith("Resolved"), "City coordinate source not resolved");
  const snapshotBytes = await readFile(join(base, metadata.source_snapshot_file));
  const csvBytes = await readFile(join(base, metadata.row_evidence_file));
  assert.equal(digest(snapshotBytes), metadata.source_snapshot_sha256, "Source snapshot hash");
  assert.equal(digest(csvBytes), metadata.row_evidence_sha256, "Row evidence hash");
  const snapshot = JSON.parse(snapshotBytes.toString()) as { sources: Record<string, Source>; records: RecordEvidence[] };
  const path = built ? metadata.file_path.replace(/^public\//, "") : metadata.file_path;
  const mappingBytes = await readFile(join(base, path));
  assert.equal(digest(mappingBytes), metadata.sha256, "City mapping hash");
  const mapping = JSON.parse(mappingBytes.toString()) as { schema_version: number; countries: Country[] };
  assert.equal(mapping.schema_version, 1); assert.equal(mapping.countries.length, 28);
  const points = mapping.countries.flatMap(country => country.cities.map(city => ({ country: country.name, city })));
  assert.equal(points.length, 99); assert.equal(snapshot.records.length, 99);
  const [headers, ...rows] = csvRows(csvBytes.toString()); assert.equal(rows.length, 99);
  const seen = new Set<string>(); let naturalEarth = 0; let geonames = 0;
  for (const [index, point] of points.entries()) {
    const record = snapshot.records[index]; const source = snapshot.sources[record.source_key];
    const row = Object.fromEntries(headers.map((header, i) => [header, rows[index][i]]));
    const key = `${point.country}/${point.city.name}`;
    assert.ok(!seen.has(key), key); seen.add(key);
    assert.equal(record.country, point.country); assert.equal(record.city, point.city.name);
    assert.deepEqual(Object.keys(point.city).sort(), ["latitude", "longitude", "name"]);
    assert.ok(Number.isFinite(point.city.latitude) && Math.abs(point.city.latitude) <= 90);
    assert.ok(Number.isFinite(point.city.longitude) && Math.abs(point.city.longitude) <= 180);
    let latitude: number; let longitude: number;
    if (record.source_key === "natural-earth") {
      const props = record.feature!.properties;
      assert.equal(String(props.NE_ID), record.source_id); assert.equal(source.license, "Public Domain");
      latitude = props.LATITUDE; longitude = props.LONGITUDE; naturalEarth++;
    } else {
      const fields = record.tsv_line!.split("\t"); assert.equal(fields.length, 19);
      assert.equal(digest(record.tsv_line!), record.record_sha256);
      assert.equal(fields[0], record.source_id); assert.equal(fields[8], source.country_code);
      assert.equal(source.license, "CC-BY-4.0");
      latitude = Number(fields[4]); longitude = Number(fields[5]); geonames++;
    }
    assert.equal(point.city.latitude, latitude, key); assert.equal(point.city.longitude, longitude, key);
    assert.equal(row.country, point.country); assert.equal(row.city, point.city.name);
    assert.equal(Number(row.latitude), latitude); assert.equal(Number(row.longitude), longitude);
    assert.equal(row.source_id, record.source_id); assert.equal(row.license, source.license);
    assert.equal(row.source_archive_sha256, source.sha256);
  }
  assert.equal(naturalEarth, 95); assert.equal(geonames, 4);
}
