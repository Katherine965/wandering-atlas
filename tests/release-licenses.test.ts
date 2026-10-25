import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { assetRightsGates, copyReleaseLicenses, checkReleaseLicenses } from "../scripts/release-licenses.ts";
import { checkCitySources } from "../scripts/city-source-check.ts";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
test("an unresolved reference holds only its exact output; FIRST review priority alone does not HOLD other images", () => {
  const inventory = 'file_path,manual_review_priority,distribution_decision\npublic/travel/themes/deep-sea/a.png,FIRST,Candidate\npublic/travel/themes/fairy-tale/b.png,NORMAL,HOLD: reference permission unknown\npublic/travel/themes/cyber/c.png,NORMAL,Candidate\n';
  const gates = assetRightsGates(inventory);
  assert.equal(gates.length, 1);
  assert.ok(gates[0].includes("fairy-tale/b.png"));
  assert.ok(!gates[0].includes("deep-sea/a.png"));
});
test("all 99 coordinates and CSV evidence agree with retained source features/TSV rows", async () => {
  await checkCitySources(fileURLToPath(root));
});
test("city lookup schema preserves all 99 options, finite WGS84 coordinates and confirmed dataset hashes", async () => {
  const data = JSON.parse(await readFile(new URL("public/data/travel-city-mapping.json", root), "utf8"));
  assert.equal(data.schema_version, 1);
  assert.equal(typeof data.description, "string");
  assert.equal(data.countries.length, 28);
  let count = 0;
  const countries = new Set<string>();
  for (const country of data.countries) {
    assert.equal(typeof country.name, "string");
    assert.ok(country.name.length && !countries.has(country.name));
    countries.add(country.name);
    assert.ok(Array.isArray(country.cities) && country.cities.length);
    const cities = new Set<string>();
    for (const city of country.cities) {
      assert.deepEqual(Object.keys(city).sort(), ["latitude", "longitude", "name"]);
      assert.equal(typeof city.name, "string");
      assert.ok(city.name.length && !cities.has(city.name));
      cities.add(city.name);
      assert.ok(Number.isFinite(city.latitude) && Math.abs(city.latitude) <= 90);
      assert.ok(Number.isFinite(city.longitude) && Math.abs(city.longitude) <= 180);
      count++;
    }
  }
  assert.equal(count, 99);
  const sources = JSON.parse(await readFile(new URL("docs/DATA_SOURCES.json", root), "utf8"));
  assert.equal(sources.datasets.length, 3);
  for (const dataset of [...sources.datasets, sources.city_mapping]) {
    const bytes = await readFile(new URL(dataset.file_path, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), dataset.sha256);
    if (dataset !== sources.city_mapping) {
      const geojson = JSON.parse(bytes.toString());
      assert.equal(geojson.type, "FeatureCollection");
      assert.ok(geojson.features.length > 0);
      assert.equal(dataset.license, "Public Domain");
      assert.ok(dataset.source_url.includes(dataset.upstream_revision));
    }
  }
});

test("static release checks reject missing notices, altered data/assets, excluded themes and native binaries", async t => {
  const output = await mkdtemp(join(tmpdir(), "atlas-license-test-"));
  try {
    await cp(new URL("public/", root), output, { recursive: true });
    await copyReleaseLicenses(output);
    await t.test("attachments and the owner-confirmed v1.0 publication review pass", async () => {
      const gates = await checkReleaseLicenses(output);
      assert.equal(gates.length, 0);
      await checkReleaseLicenses(output, true);
    });
    await t.test("missing font license fails", async () => {
      const path = join(output, "licenses/fontsource-instrument-serif-LICENSE.txt");
      const bytes = await readFile(path);
      await rm(path);
      await assert.rejects(checkReleaseLicenses(output), /ENOENT/);
      await writeFile(path, bytes);
    });
    await t.test("changed data fails the source hash", async () => {
      const path = join(output, "data/travel-city-mapping.json");
      const bytes = await readFile(path);
      await writeFile(path, "{}");
      await assert.rejects(checkReleaseLicenses(output), /travel-city-mapping/);
      await writeFile(path, bytes);
    });
    await t.test("changed bitmap fails the inventory hash", async () => {
      const path = join(output, "travel/themes/cyber/cyber-background.png");
      const bytes = await readFile(path);
      await writeFile(path, "changed");
      await assert.rejects(checkReleaseLicenses(output), /cyber-background/);
      await writeFile(path, bytes);
    });
    await t.test("excluded film/game theme fails", async () => {
      const path = join(output, "travel/themes/stranger-things");
      await mkdir(path);
      await assert.rejects(checkReleaseLicenses(output), /Excluded\/unreviewed theme/);
      await rm(path, { recursive: true });
    });
    await t.test("unexpected native binary triggers separate review", async () => {
      const path = join(output, "native.node");
      await writeFile(path, "fixture");
      await assert.rejects(checkReleaseLicenses(output), /Native binary requires/);
      await rm(path);
    });
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
