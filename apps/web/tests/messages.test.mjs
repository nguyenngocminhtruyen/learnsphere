import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
test("EN and VI UI messages have matching nonempty keys", () => {
  const read = (l) =>
    JSON.parse(
      readFileSync(new URL("../messages/" + l + ".json", import.meta.url)),
    );
  const en = read("en");
  const vi = read("vi");
  assert.deepEqual(Object.keys(en).sort(), Object.keys(vi).sort());
  assert.ok(
    [...Object.values(en), ...Object.values(vi)].every(
      (value) => typeof value === "string" && value.trim().length > 0,
    ),
  );
});
