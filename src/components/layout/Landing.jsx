import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import Nav from "../Nav";
export default function Landing() {
  return (
    <div className="travel-site">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Nav />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
