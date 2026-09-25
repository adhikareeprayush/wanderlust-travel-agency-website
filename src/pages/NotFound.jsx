import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center font-poppins">
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
      404
    </p>
    <h1 className="font-volkhov text-4xl">Page not found</h1>
    <Link to="/" className="rounded-xl bg-primary px-5 py-2.5 text-white">
      Back home
    </Link>
  </div>
);

export default NotFound;
