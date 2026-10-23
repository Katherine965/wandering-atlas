import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCitySources, csvRows } from "./city-source-check.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const attachments = [
  "LICENSE", "ASSETS.md", "THIRD_PARTY_NOTICES.md", "licenses",
  "docs/ASSET_PROVENANCE.csv", "docs/EXTRACTION_MANIFEST.csv",
  "docs/DATA_SOURCES.json", "docs/CITY_DATA_REVIEW.md",
  "docs/DEPENDENCY_LICENSES.csv", "docs/RELEASE_BLOCKERS.md",
  "docs/CITY_COORDINATE_SOURCES.csv", "docs/data/city-source-snapshot.json",
];
const themes = new Set(["parchment", "fairy-tale", "cyber", "deep-sea", "ice-world"]);
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export function assetRightsGates(inventory: string): string[] {
  const [headers, ...rows] = csvRows(inventory);
  return rows.flatMap(fields => {
    const row = Object.fromEntries(headers.map((key, i) => [key, fields[i]]));
    const decision = row.distribution_decision || row.redistribution_status || "";
    return row.file_path?.startsWith("public/travel/themes/") && decision.startsWith("HOLD")
      ? [`P1 ${row.file_path}: ${decision}; clear the specific input rights or exclude this file.`]
      : [];
  });
}

async function filesAt(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    assert.ok(!item.isSymbolicLink(), `Release symlink requires separate review: ${item.name}`);
    const path = join(directory, item.name);
    if (item.isDirectory()) result.push(...await filesAt(path));
    else result.push(path);
  }
  return result;
}

export async function copyReleaseLicenses(output: string): Promise<void> {
  assert.notEqual(resolve(output), resolve(root), "Output must not be the source directory");
  for (const path of attachments) {
    await mkdir(resolve(output, path, ".."), { recursive: true });
    await cp(join(root, path), join(output, path), { recursive: true });
  }
}

export async function checkReleaseLicenses(output: string, ready = false): Promise<string[]> {
  for (const attachment of attachments) {
    const source = join(root, attachment);
    if (attachment === "licenses") {
      for (const file of await filesAt(source)) {
        const relative = file.slice(root.length);
        assert.equal(digest(await readFile(join(output, relative))), digest(await readFile(file)), relative);
      }
    } else {
      assert.equal(digest(await readFile(join(output, attachment))), digest(await readFile(source)), attachment);
    }
  }
  const sourceInfo = JSON.parse(await readFile(join(output, "docs/DATA_SOURCES.json"), "utf8"));
  for (const dataset of [...sourceInfo.datasets, sourceInfo.city_mapping]) {
    assert.equal(digest(await readFile(join(output, dataset.file_path.replace(/^public\//, "")))), dataset.sha256, dataset.file_path);
  }
  if (sourceInfo.city_mapping.status.startsWith("Resolved")) await checkCitySources(output, true);
  const themeRoot = join(output, "travel/themes");
  for (const item of await readdir(themeRoot, { withFileTypes: true })) {
    assert.ok(item.isDirectory() && themes.has(item.name), `Excluded/unreviewed theme: ${item.name}`);
  }
  const inventory = await readFile(join(root, "docs/ASSET_PROVENANCE.csv"), "utf8");
  const bitmaps = inventory.split(/\r?\n/).filter(line => line.startsWith("public/travel/themes/"));
  assert.equal(bitmaps.length, 59, "Expected the 59 reviewed theme bitmaps");
  for (const line of bitmaps) {
    const path = line.split(",")[0];
    const sha = /(?:^|,)([a-f0-9]{64})(?:,|$)/.exec(line)?.[1];
    assert.ok(sha, `Missing asset hash: ${path}`);
    assert.equal(digest(await readFile(join(output, path.replace(/^public\//, "")))), sha, path);
    assert.ok(line.includes("Visual Review Passed"), path);
  }
  for (const file of await filesAt(output)) {
    assert.ok(!/\.(node|dylib|dll|so(?:\.\d+)*|wasm)$/i.test(file), `Native binary requires a separate redistribution review: ${file}`);
  }
  const gates: string[] = assetRightsGates(inventory);
  if ((await readFile(join(output, "LICENSE"), "utf8")).includes("NEW_GITHUB_USERNAME")) {
    gates.push("P0 LICENSE: replace NEW_GITHUB_USERNAME on the copyright line with the new public GitHub username.");
  }
  if (sourceInfo.city_mapping.status.startsWith("HOLD")) {
    gates.push("P1 public/data/travel-city-mapping.json: clear underlying source rights, fully replace it, or exclude it from the public artifact.");
  }
  if ((await readFile(join(output, "ASSETS.md"), "utf8")).includes("**Reference review status: PENDING**")) {
    gates.push("P1 ASSETS.md: identify actual reference/download exceptions (or confirm none), then clear or exclude affected files.");
  }
  if (ready) assert.equal(gates.length, 0, `Publication review incomplete:\n${gates.join("\n")}`);
  return gates;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const index = args.indexOf("--dist");
  const output = resolve(index >= 0 ? args[index + 1] : join(root, "dist"));
  if (args.includes("--copy")) await copyReleaseLicenses(output);
  const gates = await checkReleaseLicenses(output, args.includes("--ready"));
  console.log("Release attachments, data/asset hashes and static-package scope verified.");
  if (gates.length) console.log(`Unresolved publication gates (local builds are allowed):\n${gates.join("\n")}`);
}
