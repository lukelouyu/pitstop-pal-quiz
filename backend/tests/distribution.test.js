const {
  assignPal,
  resetStock,
  getStats
} = require("../services/distributionService");

describe("distributionService", () => {
  beforeEach(() => {
    resetStock({
      A: 2,
      B: 1,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
      G: 0
    });
  });

  test("returns preferred pal if stock exists", () => {
    const result = assignPal("A");
    expect(result).toBe("A");

    const stats = getStats();
    expect(stats.stock.A).toBe(1);
    expect(stats.distributed.A).toBe(1);
  });

  test("falls back to another available pal if preferred is out of stock", () => {
    const result = assignPal("C");
    expect(["A", "B"]).toContain(result);

    const stats = getStats();
    expect(stats.distributed[result]).toBe(1);
  });

  test("returns null if all stock is exhausted", () => {
    resetStock({
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
      G: 0
    });

    const result = assignPal("A");
    expect(result).toBeNull();
  });

  test("resetStock replaces stock and resets distributed count", () => {
    assignPal("A");
    resetStock({
      A: 5,
      B: 5,
      C: 5,
      D: 5,
      E: 5,
      F: 5,
      G: 5
    });

    const stats = getStats();
    expect(stats.stock.A).toBe(5);
    expect(stats.distributed.A).toBe(0);
    expect(stats.distributed.G).toBe(0);
  });
});