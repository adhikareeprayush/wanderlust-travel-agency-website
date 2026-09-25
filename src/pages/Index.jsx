import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import TourCard from "../components/TourCard";
import { useTours } from "../lib/useTours";
const baliImage = "/images/story.webp";
const regions = ["All journeys", "Europe", "Asia", "Africa", "South America"];
export default function Index() {
  const navigate = useNavigate();
  const [region, setRegion] = useState("All journeys");
  const { tours, loading, error } = useTours(
    region === "All journeys"
      ? "featured=true"
      : `region=${encodeURIComponent(region)}`,
  );
  function search(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of form) if (value) params.set(key, value);
    navigate(`/packages?${params}`);
  }
  return (
    <>
      <section className="home-hero">
        <img
          className="hero-background"
          src="/images/hero-mountains.jpg"
          alt="A wooden boat on a still lake surrounded by alpine peaks"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="container hero-content">
          <p className="eyebrow">
            <span className="small-line" /> LESS ORDINARY. MORE YOU.
          </p>
          <h1>
            Some places change
            <br />
            your <em>perspective.</em>
          </h1>
          <p className="hero-description">
            Go beyond the guidebook. Discover thoughtfully crafted
            <br className="desktop-only" /> journeys, remarkable places, and a
            world of possibility.
          </p>
          <Link to="/packages" className="button button-cream">
            Find your next adventure <Icon name="arrow" size={18} />
          </Link>
          <div className="hero-bottom">
            <span>
              <Icon name="pin" size={16} /> A little closer to extraordinary.
            </span>
            <span className="hero-scroll">
              SCROLL TO EXPLORE <span>↓</span>
            </span>
          </div>
        </div>
        <div className="hero-coordinate">
          TAKE THE SCENIC ROUTE
          <br />A DIFFERENT PERSPECTIVE
        </div>
      </section>
      <div className="container search-container">
        <form className="trip-search" onSubmit={search}>
          <label>
            <Icon name="pin" />
            <span>
              <strong>Where to?</strong>
              <input
                name="q"
                placeholder="A place you’ve dreamed of"
                aria-label="Destination"
              />
            </span>
          </label>
          <label>
            <Icon name="calendar" />
            <span>
              <strong>When?</strong>
              <input
                type="month"
                name="month"
                aria-label="Travel month"
                min={new Date().toISOString().slice(0, 7)}
              />
            </span>
          </label>
          <label>
            <Icon name="users" />
            <span>
              <strong>Your company</strong>
              <select name="guests" aria-label="Number of travellers">
                <option value="">Any group size</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "traveller" : "travellers"}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <button className="button" type="submit">
            <Icon name="search" size={18} /> Explore journeys
          </button>
        </form>
      </div>
      <div className="container promise-strip">
        <span>
          <Icon name="globe" />
          Local knowledge, a world of difference
        </span>
        <span>
          <Icon name="users" />
          Small groups. Real connections.
        </span>
        <span>
          <Icon name="shield" />
          Every detail, thoughtfully handled
        </span>
      </div>
      <section className="section container" id="journeys">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WHERE WILL CURIOSITY TAKE YOU?</p>
            <h2>
              Find your kind of <em>somewhere.</em>
            </h2>
          </div>
          <Link to="/packages" className="inline-link">
            Explore all journeys <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="filter-pills" aria-label="Filter journeys by region">
          {regions.map((item) => (
            <button
              key={item}
              aria-pressed={region === item}
              className={item === region ? "active" : ""}
              onClick={() => setRegion(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="tour-grid">
          {loading
            ? Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="card-skeleton"
                  aria-label="Loading journey"
                />
              ))
            : tours
                .slice(0, 3)
                .map((tour) => <TourCard key={tour._id} tour={tour} />)}
        </div>
        {error && (
          <p role="alert" className="error-message">
            {error} <Link to="/packages">Try browsing all journeys.</Link>
          </p>
        )}
        {!loading && !error && !tours.length && (
          <p className="empty-state">
            New journeys are on their way.{" "}
            <Link to="/contact">Let us plan one just for you.</Link>
          </p>
        )}
      </section>
      <section className="story-section">
        <div className="container story-grid">
          <div className="story-photos">
            <img
              src={baliImage}
              alt="A peaceful walk through lush rice fields beneath mountain peaks"
              loading="lazy"
            />
            <div className="story-stamp">
              <Icon name="globe" size={26} />
              <span>
                GO FURTHER.
                <br />
                FEEL CLOSER.
              </span>
            </div>
            <span className="image-caption">
              A slower pace. A deeper connection.
            </span>
          </div>
          <div className="story-copy">
            <p className="eyebrow">TRAVEL, WITH A LITTLE MORE SOUL</p>
            <h2>
              Collect moments.
              <br />
              <em>Not just miles.</em>
            </h2>
            <p>
              That tiny café your guide grew up in. A mountain trail with no one
              else in sight. The conversation that becomes a friendship.
            </p>
            <p>
              We believe the best journeys leave room for these moments. So we
              bring together local knowledge, thoughtful planning, and people
              who love to explore — just like you.
            </p>
            <div className="story-points">
              <span>
                <Icon name="check" size={17} /> Thoughtfully chosen stays
              </span>
              <span>
                <Icon name="check" size={17} /> Guides who call it home
              </span>
              <span>
                <Icon name="check" size={17} /> Space to make it your own
              </span>
              <span>
                <Icon name="check" size={17} /> Support along the way
              </span>
            </div>
            <Link to="/about" className="inline-link">
              The Wanderlust way <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FOLLOW YOUR FEELING</p>
            <h2>
              One world. <em>So many ways to go.</em>
            </h2>
          </div>
        </div>
        <div className="destination-grid">
          {[
            {
              name: "The art of slowing down",
              place: "Bali, Indonesia",
              image: "bali",
              q: "Bali",
            },
            {
              name: "A different point of view",
              place: "The Swiss Alps",
              image: "switzerland",
              q: "Swiss",
            },
            {
              name: "Stories around every corner",
              place: "Kyoto, Japan",
              image: "japan",
              q: "Kyoto",
            },
          ].map((item) => (
            <Link
              key={item.q}
              to={`/packages?q=${item.q}`}
              className="destination-card"
            >
              <img
                src={`/images/${item.image}.jpg`}
                alt={item.place}
                loading="lazy"
              />
              <div>
                <span>{item.place}</span>
                <h3>{item.name}</h3>
              </div>
              <span className="destination-arrow">
                <Icon name="northeast" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="planning-band container">
        <div className="planning-icon">
          <Icon name="globe" size={45} />
        </div>
        <div>
          <p className="eyebrow">YOUR JOURNEY, YOUR WAY</p>
          <h2>
            Have a place in mind?
            <br />
            <em>Let’s bring it to life.</em>
          </h2>
          <p>
            A celebration, a long-awaited escape, or a little “just because”.
            <br />
            Tell us what you’re dreaming of. We’ll take it from there.
          </p>
        </div>
        <Link to="/contact" className="button">
          Let’s plan something special <Icon name="arrow" size={18} />
        </Link>
      </section>
    </>
  );
}
