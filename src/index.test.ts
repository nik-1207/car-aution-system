import { sum } from "./utils";
import { describe, expect, test } from "@jest/globals";

describe("app module", () => {
  // Dummy test. TODO: remove this while writing real tests
  test("expects sum to a + b", () => {
    const output = sum(4, 2);
    expect(output).toBe(6);
  });
});
