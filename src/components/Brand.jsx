import { Link } from "react-router-dom";

// One continuous line that wanders into a looped "w". Keep in sync with
// public/favicon.svg, which uses the same path.
const BRAND_PATH =
  "M5.5 14c1.4 8.6 3.6 21 8.6 21 4.4 0 8-15 12.3-24.3C28.8 5.6 27 1.8 23 1.8s-5.8 3.8-3.4 8.9C23.9 20 27.5 35 31.9 35c5 0 7.2-12.4 8.6-21";

export function BrandMark({ size = 42 }) {
  return (
    <svg
      className="brand-mark"
      viewBox="3 -0.5 40 38"
      width={size}
      height={(size * 38) / 40}
      aria-hidden="true"
    >
      <path
        d={BRAND_PATH}
        pathLength="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Brand({ light = false }) {
  return (
    <Link
      to="/"
      className={`brand${light ? " brand-light" : ""}`}
      aria-label="Wanderlust home"
    >
      <BrandMark />
      <span className="brand-text">
        <span className="brand-name">wanderlust</span>
        <span className="brand-caption">Travel beyond the ordinary</span>
      </span>
    </Link>
  );
}
