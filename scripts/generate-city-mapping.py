"""Regenerate the city lookup from retained, licensed source records (no network).

Run with --check to verify, or --write to regenerate data and row evidence.
Requires Python 3.9+ only for this data-maintenance command, not for the app.
"""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNAPSHOT = ROOT / "docs/data/city-source-snapshot.json"
TARGET = ROOT / "public/data/travel-city-mapping.json"
EVIDENCE = ROOT / "docs/CITY_COORDINATE_SOURCES.csv"
DESCRIPTION = (
    "WGS84 city suggestions: 95 Natural Earth points (Public Domain) and 4 "
    "GeoNames features (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). "
    "Source records extracted and regrouped; see THIRD_PARTY_NOTICES.md and "
    "docs/CITY_COORDINATE_SOURCES.csv."
)


def generate():
    snapshot = json.loads(SNAPSHOT.read_text())
    countries = {}
    evidence = []
    seen = set()
    for record in snapshot["records"]:
        key = (record["country"], record["city"])
        assert key not in seen, "Duplicate city option"
        seen.add(key)
        source = snapshot["sources"][record["source_key"]]
        if record["source_key"] == "natural-earth":
            feature = record["feature"]
            canonical = json.dumps(feature, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
            assert hashlib.sha256(canonical).hexdigest() == record["record_sha256"]
            props = feature["properties"]
            assert str(props["NE_ID"]) == str(record["source_id"])
            latitude, longitude = props["LATITUDE"], props["LONGITUDE"]
            source_name = props["NAME"]
            source_country = props["ADM0NAME"]
            feature_code = props["FEATURECLA"]
        else:
            fields = record["tsv_line"].split("\t")
            assert hashlib.sha256(record["tsv_line"].encode()).hexdigest() == record["record_sha256"]
            assert len(fields) == 19
            assert fields[0] == str(record["source_id"])
            assert fields[8] == source["country_code"]
            latitude, longitude = float(fields[4]), float(fields[5])
            source_name, source_country = fields[1], fields[8]
            feature_code = fields[6] + "/" + fields[7]
        assert isinstance(latitude, (int, float)) and -90 <= latitude <= 90
        assert isinstance(longitude, (int, float)) and -180 <= longitude <= 180
        countries.setdefault(record["country"], []).append({
            "name": record["city"], "latitude": latitude, "longitude": longitude,
        })
        evidence.append({
            "country": record["country"], "city": record["city"],
            "latitude": latitude, "longitude": longitude,
            "source": source["name"], "source_id": record["source_id"],
            "source_name": source_name, "source_country": source_country,
            "feature_code": feature_code, "license": source["license"],
            "source_url": source["url"],
            "source_archive_sha256": source["sha256"],
            "record_evidence": "docs/data/city-source-snapshot.json",
            "selection_note": record["selection_note"],
        })
    assert len(countries) == 28 and len(evidence) == 99
    assert sum(r["source_key"] == "natural-earth" for r in snapshot["records"]) == 95
    data = {"schema_version": 1, "description": DESCRIPTION, "countries": [
        {"name": name, "cities": cities} for name, cities in countries.items()
    ]}
    output = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=evidence[0].keys(), lineterminator="\n")
    writer.writeheader()
    writer.writerows(evidence)
    return output, stream.getvalue()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data, evidence = generate()
    if args.write:
        TARGET.write_text(data)
        EVIDENCE.write_text(evidence)
        print("Generated 99 source-backed coordinates; update source hashes/manifests after any source change.")
    else:
        assert TARGET.read_text() == data, "City mapping differs from source-backed generation"
        assert EVIDENCE.read_text() == evidence, "Row evidence differs from source-backed generation"
        metadata = json.loads((ROOT / "docs/DATA_SOURCES.json").read_text())["city_mapping"]
        assert hashlib.sha256(SNAPSHOT.read_bytes()).hexdigest() == metadata["source_snapshot_sha256"]
        print("Verified 99/99 coordinates and row evidence against retained licensed source records.")
