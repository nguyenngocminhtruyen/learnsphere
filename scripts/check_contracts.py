"""Validate health contracts and reject removal/narrowing against a git baseline."""
import json
import subprocess
import sys
from pathlib import Path

import yaml


def compatible(old: object, new: object, path: str = "") -> None:
    if isinstance(old, dict) and isinstance(new, dict):
        for key, value in old.items():
            if key in {"description", "summary", "version", "title"}:
                continue
            assert key in new, f"Removed contract field: {path}/{key}"
            compatible(value, new[key], f"{path}/{key}")
    elif old != new:
        raise AssertionError(f"Contract changed at {path}; review/version explicitly")


for contract in Path("contracts/openapi").glob("*.yaml"):
    spec = yaml.safe_load(contract.read_text())
    assert spec["openapi"] == "3.0.3"
    assert spec["components"]["schemas"]["Health"]["required"] == ["status"]
    for route in spec["paths"].values():
        assert "200" in route["get"]["responses"]
    if len(sys.argv) > 1:
        baseline = subprocess.run(["git", "show", f"{sys.argv[1]}:{contract}"], capture_output=True, text=True)
        if baseline.returncode == 0:
            compatible(yaml.safe_load(baseline.stdout), spec)
        elif "does not exist" not in baseline.stderr and "exists on disk" not in baseline.stderr:
            raise RuntimeError(baseline.stderr)
# Self-test: a deliberate breaking change must fail.
try:
    compatible({"paths": {"/health/live": {}}}, {"paths": {}})
except AssertionError:
    pass
else:
    raise AssertionError("Breaking-change detector failed")
print(json.dumps({"contracts": "valid", "breaking_change_self_test": "passed"}))
