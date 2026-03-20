import { ACTUAL_STOCK, PAL_KEYS, TEST_STOCK } from "./constants.js";

const clone = (obj) => JSON.parse(JSON.stringify(obj));
const STOCK_THRESHOLD = 0.30;

function normalizeMap(map) {
  return Object.fromEntries(
    PAL_KEYS.map((key) => [key, Math.max(0, Math.floor(Number(map?.[key] || 0)))])
  );
}

function zeroMap() {
  return Object.fromEntries(PAL_KEYS.map((key) => [key, 0]));
}

function totalRemaining(stock) {
  return Object.values(stock).reduce((sum, value) => sum + value, 0);
}

function remainingRatio(state, palKey) {
  const initial = Number(state.initialStock?.[palKey] || 0);
  if (initial <= 0) return 0;
  return Number(state.stock?.[palKey] || 0) / initial;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function badRequest(message) {
  return json({ error: message }, 400);
}

function unauthorized() {
  return json({ error: "Unauthorized" }, 401);
}

function getPreferredPal(scores, answerHistory) {
  const safeScores = Object.fromEntries(
    PAL_KEYS.map((key) => [key, Number(scores?.[key] || 0)])
  );

  const maxScore = Math.max(...Object.values(safeScores));
  const tied = PAL_KEYS.filter((key) => safeScores[key] === maxScore);

  if (tied.length === 1) {
    return tied[0];
  }

  for (let i = answerHistory.length - 1; i >= 0; i -= 1) {
    if (tied.includes(answerHistory[i])) {
      return answerHistory[i];
    }
  }

  return tied[0] || PAL_KEYS[0];
}

function chooseAssignedPal(state, preferredPal, rankedPals = []) {
  const orderedPrefs = [
    preferredPal,
    ...rankedPals.filter((key) => key !== preferredPal)
  ].filter((key) => PAL_KEYS.includes(key));

  console.log("[ALLOCATOR] preferredPal =", preferredPal);
  console.log("[ALLOCATOR] rankedPals =", JSON.stringify(rankedPals));
  console.log("[ALLOCATOR] stock =", JSON.stringify(state.stock));
  console.log("[ALLOCATOR] initialStock =", JSON.stringify(state.initialStock));
  console.log("[ALLOCATOR] distributed =", JSON.stringify(state.distributed));

  const healthyPreferred = orderedPrefs.find((key) => {
    return state.stock[key] > 0 && remainingRatio(state, key) >= STOCK_THRESHOLD;
  });

  if (healthyPreferred) {
    console.log("[ALLOCATOR] assign preferred/next healthy =", healthyPreferred);
    return {
      assignedPal: healthyPreferred,
      reason: "preferred_within_threshold"
    };
  }

  const available = PAL_KEYS.filter((key) => state.stock[key] > 0);

  if (available.length === 0) {
    console.log("[ALLOCATOR] no stock available");
    return null;
  }

  const fallback = [...available].sort((a, b) => {
    const byDistributed = state.distributed[a] - state.distributed[b];
    if (byDistributed !== 0) return byDistributed;

    const byRatio = remainingRatio(state, b) - remainingRatio(state, a);
    if (byRatio !== 0) return byRatio;

    return state.stock[b] - state.stock[a];
  })[0];

  console.log("[ALLOCATOR] fallback least distributed =", fallback);

  return {
    assignedPal: fallback,
    reason: "least_distributed_fallback"
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const id = env.INVENTORY.idFromName("global-stock");
      const stub = env.INVENTORY.get(id);
      return stub.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  }
};

export class InventoryDO {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async loadState() {
    let state = await this.ctx.storage.get("state");
    let changed = false;

    if (!state) {
      state = {
        mode: "actual",
        initialStock: clone(ACTUAL_STOCK),
        stock: clone(ACTUAL_STOCK),
        distributed: zeroMap(),
        totalAssigned: 0,
        requestCount: 0
      };
      changed = true;
    }

    state.mode = state.mode || "actual";

    const defaultBase =
      state.mode === "test"
        ? TEST_STOCK
        : state.mode === "actual"
          ? ACTUAL_STOCK
          : (state.stock || ACTUAL_STOCK);

    if (!state.initialStock) {
      state.initialStock = clone(defaultBase);
      changed = true;
    }

    state.initialStock = normalizeMap(state.initialStock);
    state.stock = normalizeMap(state.stock || defaultBase);
    state.distributed = normalizeMap(state.distributed || zeroMap());
    state.totalAssigned = Math.max(0, Math.floor(Number(state.totalAssigned || 0)));
    state.requestCount = Math.max(0, Math.floor(Number(state.requestCount || 0)));

    if (changed) {
      await this.ctx.storage.put("state", state);
    }

    return state;
  }

  async saveState(state) {
    await this.ctx.storage.put("state", state);
  }

  isAdmin(request) {
    const provided = request.headers.get("x-admin-key");
    return Boolean(this.env.ADMIN_KEY) && provided === this.env.ADMIN_KEY;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/quiz/assign") {
      return this.handleAssign(request);
    }

    if (!this.isAdmin(request)) {
      return unauthorized();
    }

    if (request.method === "GET" && url.pathname === "/api/admin/state") {
      return this.handleGetState();
    }

    if (request.method === "POST" && url.pathname === "/api/admin/preset") {
      return this.handlePreset(request);
    }

    if (request.method === "POST" && url.pathname === "/api/admin/stocks") {
      return this.handleStocks(request);
    }

    return json({ error: "Not found" }, 404);
  }

  async handleAssign(request) {
    let body;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const scores = body?.scores || {};
    const answerHistory = Array.isArray(body?.answerHistory) ? body.answerHistory : [];

    const preferredPal = PAL_KEYS.includes(body?.preferredPal)
      ? body.preferredPal
      : getPreferredPal(scores, answerHistory);

    const rankedPals = Array.isArray(body?.rankedPals)
      ? [...new Set(body.rankedPals.filter((key) => PAL_KEYS.includes(key)))]
      : [preferredPal];

    const state = await this.loadState();
    state.requestCount = Number(state.requestCount || 0) + 1;

    console.log("[BACKEND] requestCount =", state.requestCount);

    const allocation = chooseAssignedPal(state, preferredPal, rankedPals);

    if (!allocation) {
      return json({ error: "All pals are out of stock." }, 409);
    }

    const assignedPal = allocation.assignedPal;

    console.log("[BACKEND] preferredPal =", preferredPal);
    console.log("[BACKEND] assignedPal =", assignedPal);
    console.log("[BACKEND] stock(before) =", JSON.stringify(state.stock));
    console.log("[BACKEND] distributed(before) =", JSON.stringify(state.distributed));

    state.stock[assignedPal] -= 1;
    state.distributed[assignedPal] += 1;
    state.totalAssigned += 1;

    await this.saveState(state);

    console.log("[BACKEND] stock(after) =", JSON.stringify(state.stock));
    console.log("[BACKEND] distributed(after) =", JSON.stringify(state.distributed));

    return json({
      assignedPal,
      preferredPal,
      rankedPals,
      allocationReason: allocation.reason,
      requestCount: state.requestCount,
      remainingTotal: totalRemaining(state.stock),
      stock: state.stock
    });
  }

  async handleGetState() {
    const state = await this.loadState();

    return json({
      mode: state.mode,
      initialStock: state.initialStock,
      stock: state.stock,
      distributed: state.distributed,
      totalAssigned: state.totalAssigned,
      remainingTotal: totalRemaining(state.stock)
    });
  }

  async handlePreset(request) {
    let body;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const mode = body?.mode;

    if (mode !== "test" && mode !== "actual") {
      return badRequest("mode must be 'test' or 'actual'.");
    }

    const baseStock = clone(mode === "test" ? TEST_STOCK : ACTUAL_STOCK);

    const state = {
      mode,
      initialStock: clone(baseStock),
      stock: clone(baseStock),
      distributed: zeroMap(),
      totalAssigned: 0,
      requestCount: 0
    };

    await this.saveState(state);

    return json({
      ok: true,
      message: `${mode} preset applied.`,
      state: {
        ...state,
        remainingTotal: totalRemaining(state.stock)
      }
    });
  }

  async handleStocks(request) {
    let body;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const incoming = body?.stock || {};
    const state = await this.loadState();
    const nextStock = {};

    for (const key of PAL_KEYS) {
      const value = Number(incoming[key]);

      if (!Number.isFinite(value) || value < 0) {
        return badRequest(`Invalid stock value for ${key}.`);
      }

      nextStock[key] = Math.floor(value);
    }

    state.mode = "custom";
    state.initialStock = clone(nextStock);
    state.stock = clone(nextStock);
    state.distributed = zeroMap();
    state.totalAssigned = 0;
    state.requestCount = 0;

    await this.saveState(state);

    return json({
      ok: true,
      message: "Stock updated.",
      state: {
        ...state,
        remainingTotal: totalRemaining(state.stock)
      }
    });
  }
}