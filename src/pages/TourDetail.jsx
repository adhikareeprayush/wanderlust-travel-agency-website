import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { resolveTourImage } from "../lib/tourImages";
import BookingPanel from "../components/BookingPanel";
import Icon from "../components/Icon";
export default function TourDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    api(`/tours/${slug}`, { auth: false, signal: controller.signal })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, [slug]);
  if (error)
    return (
      <div className="container section">
        <p role="alert" className="error-message">
          {error}
        </p>
        <Link className="button" to="/packages">
          Back to journeys
        </Link>
      </div>
    );
  if (!data)
    return (
      <div className="container section" role="status">
        Finding your journey…
      </div>
    );
  const { tour, departures } = data;
  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/packages">Journeys</Link>
        <span>/</span>
        <span>{tour.title}</span>
      </nav>
      <section className="detail-cover">
        <img
          src={resolveTourImage(tour.imageKey, tour.slug, 2000)}
          alt={tour.title}
          fetchPriority="high"
        />
        <div>
          <p className="eyebrow">{tour.region} · A WANDERLUST JOURNEY</p>
          <h1>{tour.title}</h1>
          <p>
            <Icon name="clock" size={16} />
            {tour.durationDays} days <span>·</span>
            <Icon name="users" size={16} />
            Small-group exploration
          </p>
        </div>
      </section>
      <div className="detail-layout">
        <div className="detail-content">
          <h2>A little closer to extraordinary.</h2>
          <p>{tour.description || tour.excerpt}</p>
          <div className="highlights">
            {tour.highlights?.map((item) => (
              <span key={item}>
                <Icon name="check" size={13} />
                {item}
              </span>
            ))}
          </div>
          <dl className="tour-facts">
            {tour.facts?.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <section>
            <p className="eyebrow">THE DAYS THAT BECOME MEMORIES</p>
            <h2 style={{ marginTop: 12 }}>Your journey, day by day.</h2>
            {tour.itinerary?.length ? (
              tour.itinerary.map((item, i) => (
                <details
                  className="itinerary-item"
                  key={item.day}
                  open={i === 0}
                >
                  <summary>
                    <span>DAY {item.day}</span>
                    {item.title}
                    <Icon name="chevron" size={17} />
                  </summary>
                  <p>{item.body}</p>
                  {item.highlights?.length > 0 && (
                    <p>{item.highlights.join(" · ")}</p>
                  )}
                </details>
              ))
            ) : (
              <p>
                Our travel team will share a detailed itinerary when reviewing
                your request.
              </p>
            )}
          </section>
          <section>
            <h2>Before you go</h2>
            <p>
              International flights and travel insurance are not included unless
              specified above. Your travel expert will confirm the final
              itinerary, availability, and price before you make a commitment.
            </p>
            <Link
              className="inline-link"
              style={{ marginTop: 20 }}
              to={`/contact?tour=${tour.slug}`}
            >
              Ask us about this journey <Icon size={17} />
            </Link>
          </section>
        </div>
        <BookingPanel key={slug} tour={tour} departures={departures} />
      </div>
    </div>
  );
}
