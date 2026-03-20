let stock = {
  perry: 70,
  ping: 70,
  ola: 70,
  ty: 70,
  sky: 70,
  tobi: 70,
  iggy: 70
};

let distributed = {
  perry: 0,
  ping: 0,
  ola: 0,
  ty: 0,
  sky: 0,
  tobi: 0,
  iggy: 0
};

let recentHistory = [];
let cooldowns = {
  perry: 0,
  ping: 0,
  ola: 0,
  ty: 0,
  sky: 0,
  tobi: 0,
  iggy: 0
};

function countRecent(history, key, windowSize) {
  return history.slice(-windowSize).filter((x) => x === key).length;
}

function tickCooldowns() {
  for (const key of Object.keys(cooldowns)) {
    if (cooldowns[key] > 0) {
      cooldowns[key] -= 1;
    }
  }
}

function assignPal(resultType) {
  const available = Object.keys(stock).filter((key) => stock[key] > 0);

  if (available.length === 0) {
    return null;
  }

  let eligible = available.filter((key) => cooldowns[key] === 0);

  if (eligible.length === 0) {
    eligible = available;
  }

  eligible.sort((a, b) => {
    const byDistributed = distributed[a] - distributed[b];
    if (byDistributed !== 0) return byDistributed;

    const byRecent = countRecent(recentHistory, a, 6) - countRecent(recentHistory, b, 6);
    if (byRecent !== 0) return byRecent;

    return stock[b] - stock[a];
  });

  let candidates = eligible.slice(0, 3);

  const lastAssigned = recentHistory[recentHistory.length - 1];
  if (candidates.length > 1 && lastAssigned) {
    const filtered = candidates.filter((key) => key !== lastAssigned);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  let chosen;
  if (candidates.includes(resultType)) {
    chosen = resultType;
  } else {
    chosen = candidates[Math.floor(Math.random() * candidates.length)];
  }

  stock[chosen]--;
  distributed[chosen]++;
  recentHistory.push(chosen);

  if (recentHistory.length > 10) {
    recentHistory.shift();
  }

  tickCooldowns();

  const recent4 = countRecent(recentHistory, chosen, 4);
  const recent6 = countRecent(recentHistory, chosen, 6);

  if (recent4 >= 3) {
    cooldowns[chosen] = Math.max(cooldowns[chosen], 2);
  }

  if (recent6 >= 4) {
    cooldowns[chosen] = Math.max(cooldowns[chosen], 3);
  }

  return chosen;
}

function resetStock(newStock) {
  stock = { ...newStock };

  distributed = {};
  cooldowns = {};
  for (const key in newStock) {
    distributed[key] = 0;
    cooldowns[key] = 0;
  }

  recentHistory = [];
}

function getStats() {
  return { stock, distributed, recentHistory, cooldowns };
}

module.exports = {
  assignPal,
  resetStock,
  getStats
};