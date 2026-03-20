import { ACTUAL_STOCK, PAL_KEYS, TEST_STOCK } from "./constants.js";

const clone = (obj) => JSON.parse(JSON.stringify(obj));

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

// EDIT: keep original stock so we can compare current stock against 30%
function getOriginalStockMap(state) {
  return normalizeMap(state.originalStock || ACTUAL_STOCK);
}

// EDIT: pal is considered "healthy" only if remaining stock is above 30% of original
function isAboveThreshold(state, palKey) {
  const originalStock = getOriginalStockMap(state);
  const original = Number(originalStock[palKey] || 0);
  const current = Number(state.stock?.[palKey] || 0);

  if (original <= 0 || current <= 0) {
    return false;
  }

  return current > original * 0.3;
}

// EDIT: least-distributed fallback among available pals
function chooseLeastDistributedAvailable(state, candidates) {
  const available = candidates.filter((key) => Number(state.stock?.[key] || 0) > 0);

  if (available.length === 0) {
    return null;
  }

  return [...available].sort((a, b) => {
    const byDistributed = Number(state.distributed?.[a] || 0) - Number(state.distributed?.[b] || 0);
    if (byDistributed !== 0) return byDistributed;

    const byStock = Number(state.stock?.[b] || 0) - Number(state.stock?.[a] || 0);
    if (byStock !== 0) return byStock;

    return a.localeCompare(b);
  })[0];
}

// EDIT:
// 1. Use ranked winning pals from frontend
// 2. Prefer the highest-ranked pal still above 30% stock
// 3. If none are above threshold, use least-distributed available fallback
function chooseAssignedPal(state, preferredPal, rankedPals) {
  const available = PAL_KEYS.filter((key) => Number(state.stock?.[key] || 0) > 0);

  if (available.length === 0) {
    return null;
  }

  const ranked = Array.isArray(rankedPals) && rankedPals.length > 0
    ? rankedPals.filter((key) => PAL_KEYS.includes(key))
    : [preferredPal, ...PAL_KEYS.filter((key) => key !== preferredPal)];

  // first pass: take highest-ranked pal still above 30% of original stock
  for (const palKey of ranked) {
    if (!available.includes(palKey)) continue;
    if (isAboveThreshold(state, palKey)) {
      return palKey;
    }
  }

  // second pass: fallback to least-distributed available
  return chooseLeastDistributedAvailable(state, available);
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

    if (!state) {
      state = {
        mode: "actual",
        randomK: Number(this.env.RANDOM_K || 3),
        stock: clone(ACTUAL_STOCK),
        originalStock: clone(ACTUAL_STOCK), // EDIT: preserve original stock for threshold comparison
        distributed: zeroMap(),
        totalAssigned: 0,
        requestCount: 0
      };

      await this.ctx.storage.put("state", state);
    }

    state.stock = normalizeMap(state.stock);
    state.originalStock = normalizeMap(state.originalStock || ACTUAL_STOCK);
    state.distributed = normalizeMap(state.distributed);

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

    if (request.method === "POST" && url.pathname === "/api/admin/random-k") {
      return this.handleRandomK(request);
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
    const rankedPals = Array.isArray(body?.rankedPals) ? body.rankedPals : [];

    const preferredPal = body?.preferredPal || getPreferredPal(scores, answerHistory);
    const state = await this.loadState();

    state.requestCount = Number(state.requestCount || 0) + 1;

    const assignedPal = chooseAssignedPal(state, preferredPal, rankedPals);

    if (!assignedPal) {
      return json({ error: "All pals are out of stock." }, 409);
    }

    state.stock[assignedPal] -= 1;
    state.distributed[assignedPal] += 1;
    state.totalAssigned += 1;

    await this.saveState(state);

    return json({
      assignedPal,
      preferredPal,
      requestCount: state.requestCount,
      remainingTotal: totalRemaining(state.stock),
      stock: state.stock
    });
  }

  async handleGetState() {
    const state = await this.loadState();

    return json({
      mode: state.mode,
      randomK: state.randomK,
      stock: state.stock,
      originalStock: state.originalStock,
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

    const presetStock = clone(mode === "test" ? TEST_STOCK : ACTUAL_STOCK);

    const state = {
      mode,
      randomK: Number(this.env.RANDOM_K || 3),
      stock: presetStock,
      originalStock: clone(presetStock), // EDIT: original stock resets together with preset
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
    state.stock = nextStock;
    state.originalStock = clone(nextStock); // EDIT: custom stock becomes the new original reference
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

  async handleRandomK(request) {
    let body;

    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const randomK = Number(body?.randomK);
    const state = await this.loadState();

    if (!Number.isInteger(randomK) || randomK < 1 || randomK > PAL_KEYS.length) {
      return badRequest(`randomK must be an integer from 1 to ${PAL_KEYS.length}.`);
    }

    state.randomK = randomK;
    await this.saveState(state);

    return json({
      ok: true,
      message: "randomK updated.",
      state: {
        ...state,
        remainingTotal: totalRemaining(state.stock)
      }
    });
  }
}