import { ACTUAL_STOCK, PAL_KEYS, TEST_STOCK } from "./constants.js";

const clone = (obj) => JSON.parse(JSON.stringify(obj));

function normalizeMap(map) {
    return Object.fromEntries(
        PAL_KEYS.map((key) => [key, Math.max(0, Math.floor(Number(map?.[key] || 0)))])
    );
}

function countRecent(history, key, windowSize) {
    return history.slice(-windowSize).filter((x) => x === key).length;
}

function tickCooldowns(cooldowns) {
    const next = normalizeMap(cooldowns);

    for (const key of PAL_KEYS) {
        if (next[key] > 0) {
            next[key] -= 1;
        }
    }

    return next;
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

function chooseAssignedPal(state, preferredPal) {
    const available = PAL_KEYS.filter((key) => state.stock[key] > 0);

    if (available.length === 0) {
        console.log("[ALLOCATOR] no stock available");
        return null;
    }

    const recentHistory = Array.isArray(state.recentHistory) ? state.recentHistory : [];
    const cooldowns = normalizeMap(state.cooldowns);

    let eligible = available.filter((key) => cooldowns[key] === 0);

    if (eligible.length === 0) {
        eligible = available;
    }

    const sorted = [...eligible].sort((a, b) => {
        const byDistributed = state.distributed[a] - state.distributed[b];
        if (byDistributed !== 0) return byDistributed;

        const byRecent = countRecent(recentHistory, a, 6) - countRecent(recentHistory, b, 6);
        if (byRecent !== 0) return byRecent;

        const byStock = state.stock[b] - state.stock[a];
        if (byStock !== 0) return byStock;

        return Math.random() - 0.5;
    });

    const k = Math.max(1, Math.min(Number(state.randomK || 1), sorted.length));
    let pool = sorted.slice(0, k);

    const lastAssigned = recentHistory[recentHistory.length - 1];
    if (pool.length > 1 && lastAssigned) {
        const withoutImmediateRepeat = pool.filter((key) => key !== lastAssigned);
        if (withoutImmediateRepeat.length > 0) {
            pool = withoutImmediateRepeat;
        }
    }

    console.log("[ALLOCATOR] preferredPal =", preferredPal);
    console.log("[ALLOCATOR] available =", JSON.stringify(available));
    console.log("[ALLOCATOR] eligible =", JSON.stringify(eligible));
    console.log("[ALLOCATOR] sorted =", JSON.stringify(sorted));
    console.log("[ALLOCATOR] pool =", JSON.stringify(pool));
    console.log("[ALLOCATOR] distributed =", JSON.stringify(state.distributed));
    console.log("[ALLOCATOR] cooldowns =", JSON.stringify(cooldowns));
    console.log("[ALLOCATOR] recentHistory =", JSON.stringify(recentHistory));
    console.log("[ALLOCATOR] randomK =", state.randomK);

    if (preferredPal && pool.includes(preferredPal)) {
        console.log("[ALLOCATOR] returning preferredPal =", preferredPal);
        return preferredPal;
    }

    const picked = pool[Math.floor(Math.random() * pool.length)];
    console.log("[ALLOCATOR] returning random pick =", picked);
    return picked;
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
                distributed: zeroMap(),
                totalAssigned: 0,
                recentHistory: [],
                cooldowns: zeroMap(),
                requestCount: 0
            };

            await this.ctx.storage.put("state", state);
        }

        state.recentHistory = Array.isArray(state.recentHistory) ? state.recentHistory : [];
        state.cooldowns = normalizeMap(state.cooldowns);

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

        const preferredPal = getPreferredPal(scores, answerHistory);
        const state = await this.loadState();
        state.requestCount = Number(state.requestCount || 0) + 1;
        console.log("[BACKEND] requestCount =", state.requestCount);

        const assignedPal = chooseAssignedPal(state, preferredPal);

        console.log("[BACKEND] preferredPal =", preferredPal);
        console.log("[BACKEND] assignedPal =", assignedPal);
        console.log("[BACKEND] recentHistory(before) =", JSON.stringify(state.recentHistory));
        console.log("[BACKEND] cooldowns(before) =", JSON.stringify(state.cooldowns));
        console.log("[BACKEND] distributed(before) =", JSON.stringify(state.distributed));
        console.log("[BACKEND] stock(before) =", JSON.stringify(state.stock));

        if (!assignedPal) {
            return json({ error: "All pals are out of stock." }, 409);
        }

        state.stock[assignedPal] -= 1;
        state.distributed[assignedPal] += 1;
        state.totalAssigned += 1;

        state.recentHistory = Array.isArray(state.recentHistory) ? state.recentHistory : [];
        state.recentHistory.push(assignedPal);

        if (state.recentHistory.length > 10) {
            state.recentHistory.shift();
        }

        // one assignment has passed -> tick down existing cooldowns
        state.cooldowns = tickCooldowns(state.cooldowns);

        // if this pal appears too much recently, ban it for the next few assignments
        const recent4 = countRecent(state.recentHistory, assignedPal, 4);
        const recent6 = countRecent(state.recentHistory, assignedPal, 6);

        let cooldownToApply = 0;

        if (recent4 >= 3) {
            cooldownToApply = 2;
        }

        if (recent6 >= 4) {
            cooldownToApply = 3;
        }

        if (cooldownToApply > 0) {
            state.cooldowns[assignedPal] = Math.max(
                Number(state.cooldowns[assignedPal] || 0),
                cooldownToApply
            );
        }

        await this.saveState(state);

        console.log("[BACKEND] recentHistory(after) =", JSON.stringify(state.recentHistory));
        console.log("[BACKEND] cooldowns(after) =", JSON.stringify(state.cooldowns));
        console.log("[BACKEND] distributed(after) =", JSON.stringify(state.distributed));
        console.log("[BACKEND] stock(after) =", JSON.stringify(state.stock));

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
            distributed: state.distributed,
            totalAssigned: state.totalAssigned,
            remainingTotal: totalRemaining(state.stock),
            cooldowns: state.cooldowns
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

        const state = {
            mode,
            randomK: Number(this.env.RANDOM_K || 3),
            stock: clone(mode === "test" ? TEST_STOCK : ACTUAL_STOCK),
            distributed: zeroMap(),
            totalAssigned: 0,
            recentHistory: [],
            cooldowns: zeroMap()
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
        state.distributed = zeroMap();
        state.totalAssigned = 0;
        state.recentHistory = [];
        state.cooldowns = zeroMap();

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