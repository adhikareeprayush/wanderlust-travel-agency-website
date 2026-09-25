import { Link } from "react-router-dom";
import { useState } from "react";
import { api } from "../api/client";
import Brand from "./Brand";
import Icon from "./Icon";
export default function Footer() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function subscribe(event) {
    event.preventDefault();
    setBusy(true);
    setNote("");
    try {
      await api("/newsletter", {
        method: "POST",
        auth: false,
        body: { email },
      });
      setNote("You’re on the list. Here’s to your next adventure.");
      setEmail("");
    } catch (error) {
      setNote(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <span className="eyebrow">A LITTLE INSPIRATION, NOW AND THEN</span>
            <h2>Your next chapter starts here.</h2>
          </div>
          <form onSubmit={subscribe} className="newsletter-form">
            <label htmlFor="newsletter" className="sr-only">
              Email for travel inspiration
            </label>
            <div>
              <input
                id="newsletter"
                type="email"
                required
                value={email}
                placeholder="Your email address"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                aria-label="Subscribe to travel inspiration"
                disabled={busy}
              >
                <Icon name="arrow" />
              </button>
            </div>
            <p aria-live="polite">
              {note || "Thoughtful travel ideas. No endless emails."}
            </p>
          </form>
        </div>
        <div className="footer-main">
          <div className="footer-brand">
            <Brand light />
            <p>
              Extraordinary places. Meaningful connections.
              <br />
              Journeys that stay with you.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link to="/packages">All journeys</Link>
            <Link to="/packages?region=Europe">Europe</Link>
            <Link to="/packages?region=Asia">Asia</Link>
            <Link to="/packages?region=Africa">Africa</Link>
          </div>
          <div>
            <h3>Wanderlust</h3>
            <Link to="/about">Our story</Link>
            <Link to="/contact">Talk to a travel expert</Link>
            <Link to="/account/bookings">My bookings</Link>
            <Link to="/login">Team sign in</Link>
          </div>
          <div className="footer-note">
            <Icon name="globe" size={32} />
            <p>
              The world is full of wonderful.
              <br />
              Let’s go find yours.
            </p>
            <Link to="/contact" className="inline-link">
              Start a conversation <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Wanderlust Travel. All rights reserved.
          </span>
          <span>Made for the curious. Designed for the journey.</span>
        </div>
      </div>
    </footer>
  );
}
