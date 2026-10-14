import { useEffect, useState } from "react";
import "./App.css";

const currencies = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "PKR", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
];

function App() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("PKR");
  const [rates, setRates] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState("");

  async function fetchRates(base = from) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://open.er-api.com/v6/latest/${base}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch exchange rates.");
      }

      const data = await response.json();

      if (data.result !== "success" || !data.rates) {
        throw new Error("Exchange rate data is unavailable.");
      }

      setRates(data.rates);
      setUpdated(data.time_last_update_utc || "Recently");
      setResult(null);
    } catch {
      setError(
        "Live rates load nahi ho sakin. Internet check karke dobara try karein."
      );
      setRates({});
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRates(from);
  }, [from]);

  function convertCurrency() {
    const value = Number(amount);
    const rate = rates[to];

    if (amount.trim() === "" || !Number.isFinite(value) || value < 0) {
      setError("Please valid amount enter karein.");
      setResult(null);
      return;
    }

    if (!rate) {
      setError("Exchange rate available nahi hai. Dobara try karein.");
      setResult(null);
      return;
    }

    setError("");
    setResult(value * rate);
  }

  function swapCurrencies() {
    setFrom(to);
    setTo(from);
    setResult(null);
  }

  function selectPopularCurrency(code) {
    setTo(code);
    setResult(null);
  }

  const currentRate = rates[to];

  function formatMoney(value) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  }

  return (
    <div className="app">
      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">💱</span>
          <span>
            Currency <strong>Converter</strong>
          </span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#converter">Converter</a>
          <a href="#popular">Currencies</a>
        </nav>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-badge">🌍 Smart Currency Conversion</div>

          <h1>
            React <span>Dynamic</span>
            <br />
            Currency Converter
          </h1>

          <p>
            Convert currencies with updated exchange rates.
            <br />
            Fast, simple and easy to use.
          </p>

          <div className="live-badge">
            <span className="live-dot"></span>
            Live Exchange Rates
          </div>
        </section>

        <section className="converter-card" id="converter">
          <div className="card-heading">
            <div>
              <span className="small-label">YOUR MONEY, ANY CURRENCY</span>
              <h2>Currency Converter</h2>
              <p>Choose currencies and enter your amount.</p>
            </div>

            <div className="card-icon">💸</div>
          </div>

          <div className="converter-grid">
            <div className="currency-column">
              <label htmlFor="from">From</label>

              <div className="select-wrap">
                <span className="flag">
                  {currencies.find((c) => c.code === from)?.flag}
                </span>

                <select
                  id="from"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} — {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="amount-label" htmlFor="amount">
                Amount
              </label>

              <input
                id="amount"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setResult(null);
                }}
                placeholder="Enter amount"
              />
            </div>

            <div className="swap-area">
              <button
                type="button"
                className="swap-button"
                onClick={swapCurrencies}
                aria-label="Swap currencies"
                title="Swap currencies"
              >
                ⇄
              </button>
            </div>

            <div className="currency-column">
              <label htmlFor="to">To</label>

              <div className="select-wrap">
                <span className="flag">
                  {currencies.find((c) => c.code === to)?.flag}
                </span>

                <select
                  id="to"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setResult(null);
                  }}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} — {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="amount-label" htmlFor="result">
                Converted Amount
              </label>

              <div className="result-box" id="result" aria-live="polite">
                {result !== null
                  ? `${formatMoney(result)} ${to}`
                  : currentRate && amount !== ""
                    ? `${formatMoney(Number(amount) * currentRate)} ${to}`
                    : "Enter an amount"}
              </div>
            </div>
          </div>

          <button
            className="convert-button"
            onClick={convertCurrency}
            disabled={loading}
          >
            {loading ? "Loading Rates..." : "⇄  Convert Currency"}
          </button>

          {error && <div className="error-message">{error}</div>}

          <div className="rate-panel">
            <div>
              <span className="rate-label">Exchange Rate</span>

              <h3>
                {currentRate
                  ? `1 ${from} = ${formatMoney(currentRate)} ${to}`
                  : "Fetching latest rate..."}
              </h3>

              <p>Rates are provided by an external exchange-rate API.</p>
            </div>

            <div className="update-info">
              <span>◷ Rate Information</span>
              <p>{loading ? "Updating..." : updated || "Not available"}</p>

              <button
                className="refresh-button"
                onClick={() => fetchRates(from)}
                disabled={loading}
              >
                ↻ Refresh Rates
              </button>
            </div>
          </div>

          <p className="disclaimer">
            Exchange rates fluctuate. Check the rate before making a transaction.
          </p>
        </section>

        <section className="popular-section" id="popular">
          <div className="section-heading">
            <span>EXPLORE THE WORLD</span>
            <h2>Popular Currencies</h2>
            <p>Select a currency to use it as your destination.</p>
          </div>

          <div className="popular-grid">
            {currencies
              .filter((currency) => currency.code !== from)
              .slice(0, 8)
              .map((currency) => (
                <button
                  className={`popular-card ${
                    to === currency.code ? "selected" : ""
                  }`}
                  key={currency.code}
                  onClick={() => selectPopularCurrency(currency.code)}
                >
                  <span className="popular-flag">{currency.flag}</span>
                  <strong>{currency.code}</strong>
                  <span>{currency.name}</span>
                </button>
              ))}
          </div>
        </section>

        <section className="features">
          <article>
            <span>⚡</span>
            <h3>Quick Conversion</h3>
            <p>Convert amounts easily with a simple interface.</p>
          </article>

          <article>
            <span>🌐</span>
            <h3>Multiple Currencies</h3>
            <p>Choose from a range of international currencies.</p>
          </article>

          <article>
            <span>🔄</span>
            <h3>Easy to Use</h3>
            <p>Swap currencies and refresh exchange rates.</p>
          </article>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="footer-brand">
          💱 Currency Converter
        </a>
      </footer>
    </div>
  );
}

export default App;