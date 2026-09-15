import assert from "node:assert/strict";
import { test } from "node:test";
import { deferFilterListHydration } from "../src/main/filter-list-hydration.ts";

test("Windows filter-list interruption is deferred and non-fatal", async () => {
  let started = false;
  let failed = false;
  const hydration = deferFilterListHydration(async () => {
    started = true;
    const error = new Error("The filter-list request was interrupted.");
    error.name = "AbortError";
    throw error;
  }, () => { failed = true; });

  assert.equal(started, false, "first-page setup must not start the filter download");
  await assert.doesNotReject(hydration);
  assert.equal(started, true);
  assert.equal(failed, true);
});
