import { useSearchParams } from "react-router-dom";
import TourCard from "../components/TourCard";
import Icon from "../components/Icon";
import { useTours } from "../lib/useTours";
export default function Packages() {
  const [params, setParams] = useSearchParams();
  const { tours, loading, error } = useTours(params.toString());
  function change(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }
  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">A WORLD WAITING TO BE DISCOVERED</p>
        <h1>
          Find your next <em>great story.</em>
        </h1>
        <p>
          Remarkable places. Thoughtfully planned journeys.
          <br />
          All that’s missing is you.
        </p>
      </section>
      <section className="container catalog-section">
        <form
          className="catalog-filters"
          key={params.toString()}
          onSubmit={(e) => {
            e.preventDefault();
            change("q", new FormData(e.currentTarget).get("q"));
          }}
        >
          <div className="catalog-search">
            <Icon name="search" />
            <input
              name="q"
              aria-label="Search destinations"
              defaultValue={params.get("q") || ""}
              placeholder="Search a destination or journey"
            />
            <button type="submit" className="text-button">
              Search
            </button>
          </div>
          <label>
            <span>Region</span>
            <select
              aria-label="Filter by region"
              value={params.get("region") || ""}
              onChange={(e) => change("region", e.target.value)}
            >
              <option value="">All destinations</option>
              {["Europe", "Asia", "Africa", "South America"].map((region) => (
                <option key={region}>{region}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Sort by</span>
            <select
              aria-label="Sort journeys"
              value={params.get("sort") || "date"}
              onChange={(e) => change("sort", e.target.value)}
            >
              <option value="date">Next departure</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </form>
        <div className="results-line">
          <p aria-live="polite">
            {loading
              ? "Finding your next adventure…"
              : `${tours.length} ${tours.length === 1 ? "journey" : "journeys"} to inspire you`}
            {params.get("month") ? ` · ${params.get("month")}` : ""}
            {params.get("guests")
              ? ` · ${params.get("guests")} travellers`
              : ""}
          </p>
          {params.size > 0 && (
            <button className="text-button" onClick={() => setParams({})}>
              Clear filters ×
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="tour-grid">
          {loading
            ? [0, 1, 2].map((i) => <div key={i} className="card-skeleton" />)
            : tours.map((tour) => <TourCard key={tour._id} tour={tour} />)}
        </div>
        {!loading && !error && !tours.length && (
          <div className="empty-state">
            <Icon name="globe" size={42} />
            <h2>A different adventure awaits.</h2>
            <p>
              We couldn’t find a journey for those filters. Try another
              destination or travel month.
            </p>
            <button className="button" onClick={() => setParams({})}>
              See all journeys
            </button>
          </div>
        )}
      </section>
    </>
  );
}
