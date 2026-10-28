#!/usr/bin/env node
// Expression validator: copy parity across source and the Codex distribution, plus
// regression checks for list-valued variables and reference-backed primitive params.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const digest = file => createHash("sha256").update(readFileSync(resolve(root, file))).digest("hex");

// Every copy that resolves its references beside itself must be byte-identical.
// Claude/Cursor distributions rewrite only the reference paths and are covered by
// their own parity checks (claude-shared-resources.json rewrites).
const copies = [
  "yeeflow-expression-utils.js",
  "skills/installed/yeeflow-expression-generator/references/yeeflow-expression-utils.js",
  "skills/installed/yeeflow-application-generator/scripts/yeeflow-expression-utils.js",
  "skills/installed/yeeflow-approval-form-generator/scripts/yeeflow-expression-utils.js",
  "dist/yeeflow-app-builder-plugin/yeeflow-expression-utils.js",
  "dist/yeeflow-app-builder-plugin/scripts/yeeflow-expression-utils.js",
  "dist/yeeflow-app-builder-plugin/skills/yeeflow-expression-generator/references/yeeflow-expression-utils.js",
  "dist/yeeflow-app-builder-plugin/skills/yeeflow-application-generator/scripts/yeeflow-expression-utils.js",
  "dist/yeeflow-app-builder-plugin/skills/yeeflow-approval-form-generator/scripts/yeeflow-expression-utils.js",
];
const expected = digest(copies[0]);
for (const file of copies) assert.equal(digest(file), expected, "EXPRESSION_UTILS_COPY_DRIFT: " + file);

const variable = (id, valueType) => ({ type: "expr", exprType: "variable", id, valueType, name: "Workflow Variables:" + id });
const now = { type: "func", func: "now", params: [] };
const codes = result => result.issues.map(issue => issue.code);

// Behaviour checks run on copies that have their normalized references beside them
// (the default load path). dist/.../scripts/ ships without them; parity above covers it.
const behaviourCopies = copies.filter(file => existsSync(resolve(root, dirname(file), "yeeflow-expression-functions.normalized.json")));
assert.ok(behaviourCopies.length >= 5, "expected loadable validator copies");
for (const file of behaviourCopies) {
  const { validateExpressionTokens } = require(resolve(root, file));

  // List-valued variables are accepted (regression for copies that missed e118092).
  const list = validateExpressionTokens([{ type: "func", func: "arrayCount", params: [[variable("Lines", "list")], [], [], []] }]);
  assert.ok(!codes(list).includes("EXPRESSION_VARIABLE_BAD_VALUETYPE"), file + ": list variable rejected");

  // Correct four-parameter dateDiff with a raw unit: no primitive-param warning.
  const dateDiff = validateExpressionTokens([{ type: "func", func: "dateDiff", params: [[variable("DueDate", "date")], [now], "day", []] }]);
  assert.equal(dateDiff.valid, true, file);
  assert.ok(!codes(dateDiff).includes("EXPRESSION_FUNCTION_PRIMITIVE_PARAM"), file + ": dateDiff raw unit still warns");
  assert.ok(!codes(dateDiff).includes("EXPRESSION_DATEDIFF_UNIT_WRAPPED"), file);

  // Wrapped unit and unknown unit still warn; three params still warn on count.
  const wrapped = validateExpressionTokens([{ type: "func", func: "dateDiff", params: [[variable("DueDate", "date")], [now], [{ type: "str", value: "day" }], []] }]);
  assert.ok(codes(wrapped).includes("EXPRESSION_DATEDIFF_UNIT_WRAPPED"), file);
  const badUnit = validateExpressionTokens([{ type: "func", func: "dateDiff", params: [[variable("DueDate", "date")], [now], "week", []] }]);
  assert.ok(codes(badUnit).includes("EXPRESSION_FUNCTION_PRIMITIVE_PARAM"), file + ": unknown unit must still warn");
  const threeParams = validateExpressionTokens([{ type: "func", func: "dateDiff", params: [[variable("DueDate", "date")], [now], "day"] }]);
  assert.ok(codes(threeParams).includes("EXPRESSION_FUNCTION_PARAM_COUNT"), file);

  // Primitives outside the reference-backed positions still warn.
  const other = validateExpressionTokens([{ type: "func", func: "dateAdd", params: [[variable("DueDate", "date")], "day", 3] }]);
  assert.ok(codes(other).includes("EXPRESSION_FUNCTION_PRIMITIVE_PARAM"), file + ": non-reference primitive must still warn");
}

console.log("EXPRESSION_VALIDATOR_PARITY_PASS: " + copies.length + " copies identical; behaviour checked on " + behaviourCopies.length + "; list variables accepted; dateDiff raw unit accepted; wrapped/unknown units, 3-param calls and other primitives still warn");
