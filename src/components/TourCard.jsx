import { Link } from "react-router-dom";
import Icon from "./Icon";
import { formatMoney, resolveTourImage } from "../lib/tourImages";
export default function TourCard({ tour }) {
  return (
    <article className="tour-card">
      <Link
        to={`/packages/${tour.slug}`}
        className="tour-image-link"
        aria-label={`Explore ${tour.title}`}
      >
        <img
          src={resolveTourImage(tour.imageKey, tour.slug, 800)}
          alt={tour.title}
          loading="lazy"
        />
        <span className="tour-tag">{tour.highlights?.[0] || tour.region}</span>
        <span className="tour-image-arrow">
          <Icon name="northeast" />
        </span>
      </Link>
      <div className="tour-card-content">
        <div className="tour-meta">
          <span>
            <Icon name="pin" size={13} />
            {tour.region}
          </span>
          <span>
            <Icon name="clock" size={13} />
            {tour.durationDays} days
          </span>
        </div>
        <Link to={`/packages/${tour.slug}`}>
          <h3>{tour.title}</h3>
        </Link>
        <p>{tour.excerpt}</p>
        <div className="tour-card-bottom">
          <span>
            From <strong>{formatMoney(tour.basePrice)}</strong>
            <small> / person</small>
          </span>
          <Link to={`/packages/${tour.slug}`} aria-label={`View ${tour.title}`}>
            <Icon name="arrow" size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}
