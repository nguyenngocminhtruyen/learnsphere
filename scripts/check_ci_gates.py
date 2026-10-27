"""Prove the same CI tools reject deliberate errors; remove fixtures even on failure."""
import os
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
cases = [
    ("apps/web/phase0_gate.ts", 'const value: string = 123; export { value };', ["pnpm", "typecheck"], "apps/web"),
    ("apps/api/src/test/java/com/edutech/BrokenGate.java", "package com.edutech; class BrokenGate { invalid syntax }", ["./gradlew", "--no-daemon", "compileTestJava"], "apps/api"),
    ("apps/ai-worker/phase0_gate.py", 'value: str = 123\n', ["mypy", "phase0_gate.py"], "apps/ai-worker"),
    ("apps/ai-worker/tests/test_phase0_gate.py", 'def test_deliberate_failure() -> None:\n    assert False\n', ["pytest", "tests/test_phase0_gate.py", "-q"], "apps/ai-worker"),
]
for filename, source, command, cwd in cases:
    fixture = root / filename
    assert not fixture.exists()
    try:
        fixture.write_text(source)
        result = subprocess.run(command, cwd=root / cwd, capture_output=True, text=True, env=os.environ)
        assert result.returncode != 0, f"Gate accepted deliberate failure: {command}"
        # Infrastructure/tool errors do not count as proof.
        output = result.stdout + result.stderr
        expected = {"pnpm": "TS2322", "./gradlew": "error:", "mypy": "[assignment]", "pytest": "1 failed"}[command[0]]
        assert expected in output, output
        print(f"PASS: {command} rejected deliberate error")
    finally:
        fixture.unlink(missing_ok=True)
