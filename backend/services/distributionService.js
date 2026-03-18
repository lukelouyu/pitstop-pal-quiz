// In-memory stock (later we upgrade to DB or JSON file)
let stock = {
  A: 70,
  B: 70,
  C: 70,
  D: 70,
  E: 70,
  F: 70,
  G: 70
};

// Count how many each type has been given
let distributed = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
  E: 0,
  F: 0,
  G: 0
};

// MAIN FUNCTION
function assignPal(resultType) {
  // If preferred type still has stock → give it
  if (stock[resultType] > 0) {
    stock[resultType]--;
    distributed[resultType]++;
    return resultType;
  }

  // Otherwise → find the least distributed available type
  let available = Object.keys(stock)
    .filter(type => stock[type] > 0)
    .sort((a, b) => distributed[a] - distributed[b]);

  if (available.length === 0) {
    return null; // no stock left
  }

  let chosen = available[0];
  stock[chosen]--;
  distributed[chosen]++;

  return chosen;
}

// Admin reset
function resetStock(newStock) {
  stock = { ...newStock };

  distributed = {};
  for (let key in newStock) {
    distributed[key] = 0;
  }
}

function getStats() {
  return { stock, distributed };
}

module.exports = {
  assignPal,
  resetStock,
  getStats
};