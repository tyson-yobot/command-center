"""YoBot® Airtable Schema Tester – FINAL PRODUCTION VERSION
No optional parameters. Uses constants from schema_exporter.
CLI flags:
  --csv   : saves CSV snapshot to provided path
  --push  : pushes snapshot to Airtable
  --serve : runs HTTP endpoint at /schema (GET)
"""
import os, sys, argparse
from dotenv import load_dotenv
from flask import Flask, jsonify

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.utils.airtable.schema_exporter import (
    export_schema,
    snapshot_to_csv,
    push_snapshot_to_airtable,
)

load_dotenv()

app = Flask(__name__)

@app.get("/schema")
def http_schema():
    data = export_schema()
    return jsonify(data), 200

def cli_print_schema() -> None:
    schema = export_schema()
    for tbl in schema["tables"]:
        print(f"\n📄 {tbl['name']}")
        for fld in tbl["fields"]:
            print(f"  • {fld['name']} ({fld['type']})")

if __name__ == "__main__":
    p = argparse.ArgumentParser(description="YoBot® Schema CLI (production, no params)")
    p.add_argument("--csv", type=str, help="Path to save CSV snapshot")
    p.add_argument("--push", action="store_true", help="Push snapshot to Airtable log table")
    p.add_argument("--serve", action="store_true", help="Run HTTP server on :5000")
    args = p.parse_args()

    if args.serve:
        print("🚀 Serving /schema on http://localhost:5000 …")
        app.run(port=5000, debug=False)
    elif args.csv:
        snapshot_to_csv(args.csv)
    elif args.push:
        push_snapshot_to_airtable()
    else:
        cli_print_schema()
