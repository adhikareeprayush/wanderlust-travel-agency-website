import { Link } from "react-router-dom";
export default function Brand({ light = false }) {
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Wanderlust home"
    >
      <svg
        viewBox="0 0 40 40"
        width="38"
        height="38"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="18.5" stroke="currentColor" />
        <path
          d="m8 26 9-15 7 12 4-7 6 10H8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="m14 16 3 4 3-4" stroke="currentColor" />
      </svg>
      <span>
        wanderlust
        <span className="brand-caption">TRAVEL BEYOND THE ORDINARY</span>
      </span>
    </Link>
  );
}
