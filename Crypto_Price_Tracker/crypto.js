const coinContainer = document.getElementById("cryptoPrice");
const searchInput = document.getElementById("searchInput");
const searchIcon = document.getElementById("searchIcon");
const defaultCoins = ["bitcoin", "ethereum", "solana", "ripple"];
const suggestionsDiv = document.getElementById("suggestions");

// 🔹 Render one card
function renderCard(Coin) {
  const card = document.createElement("div");
  card.classList.add("coin-card");

  card.innerHTML = `
    <div class="coin-header">
      <img src="${Coin.image}" alt="${Coin.name}" />
      <div class="coin-info">
        <h2>${Coin.name}</h2>
        <h4>${Coin.symbol.toUpperCase()}</h4>
      </div>
    </div>
    <p class="coin-price">$${Coin.current_price <= 1 ? Coin.current_price : Coin.current_price.toLocaleString()}</p>
    <p class="coin-change" style="color:${Coin.price_change_percentage_24h > 0 ? 'green' : 'red'};">
      ${Coin.price_change_percentage_24h.toFixed(2)}%
    </p>
    <div class="coin-stats">
      <p><span>MC:</span> ${formatNumber(Coin.market_cap)}</p>
      <p><span>H24:</span> ${formatNumber(Coin.high_24h)}</p>
      <p><span>L24:</span> ${formatNumber(Coin.low_24h)}</p>
      <p><span>Vol:</span> ${formatNumber(Coin.total_volume)}</p>
    </div>
  `;

  coinContainer.appendChild(card);
}

// 🔹 Format numbers (MC, Vol, etc.)
function formatNumber(num) {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num}`;
}

// 🔹 Suggestions
async function getCoinSuggestions() {
  const query = searchInput.value.toLowerCase().trim();

  if (query.length < 2) {
    suggestionsDiv.innerHTML = "";
    return;
  }

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1");
    const coins = await res.json();

    const matches = coins.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.symbol.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length === 0) {
      suggestionsDiv.innerHTML = "<p>No matches</p>";
      return;
    }

    suggestionsDiv.innerHTML = matches
      .map(
        (c) => `
          <div class="suggestion" onclick="selectCoin('${c.id}')">
            <img src="${c.image}" alt="${c.name}" class="image" /> ${c.name} (${c.symbol.toUpperCase()})
          </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error fetching coin suggestions:", err);
  }
}

// 🔹 When suggestion is clicked
function selectCoin(coinId) {
  searchInput.value = coinId;
  suggestionsDiv.innerHTML = "";
  getCoins();
}

// 🔹 Show default coins
async function DefaultCoins() {
  const req = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1"
  );
  const res = await req.json();

  coinContainer.innerHTML = "";

  defaultCoins.forEach(coinId => {
    const Coin = res.find(c => c.id === coinId);
    if (Coin) renderCard(Coin);
  });
}

// 🔹 Search one coin
async function getCoins() {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) {
    DefaultCoins();
    return;
  }

  const req = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1"
  );
  const res = await req.json();

  coinContainer.innerHTML = "";

  const Coin = res.find(c => c.id === query || c.symbol === query);
  if (Coin) {
    renderCard(Coin);
  } else {
    coinContainer.innerHTML = "<p>Not found!</p>";
  }
}

// 🔹 Events
searchIcon.addEventListener("click", getCoins);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getCoins();
});
searchInput.addEventListener("input", getCoinSuggestions);

// Load defaults at start
DefaultCoins();
