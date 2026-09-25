import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import Icon from "../components/Icon";
export default function Contact() {
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = e.currentTarget;
    try {
      await api("/enquiries", {
        method: "POST",
        auth: false,
        body: {
          ...Object.fromEntries(new FormData(form)),
          tourSlug: params.get("tour") || "",
        },
      });
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container contact-grid">
      <div className="contact-title">
        <p className="eyebrow">GOOD JOURNEYS START WITH A CONVERSATION</p>
        <h1>
          You bring the dream.
          <br />
          <em>We’ll bring the details.</em>
        </h1>
        <p>
          Somewhere you’ve always wanted to go? An occasion worth celebrating?
          Or simply a feeling that it’s time for something new? We’d love to
          hear about it.
        </p>
        <div className="contact-points">
          {[
            [
              "globe",
              "Local insight",
              "Thoughtful recommendations from people who know the places.",
            ],
            [
              "users",
              "A real conversation",
              "A travel expert to help shape a journey around you.",
            ],
            [
              "shield",
              "No pressure",
              "Ask a question or request a plan. There’s no commitment.",
            ],
          ].map(([icon, title, body]) => (
            <div key={title}>
              <Icon name={icon} />
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="contact-form">
        <h2>Tell us what you’re dreaming of.</h2>
        {sent ? (
          <div className="success-message" role="status">
            <Icon name="check" size={30} />
            <strong>We’ve received your message.</strong>
            <p>
              Our team will review your plans and get in touch using the contact
              details you provided.
            </p>
            <button
              className="inline-link"
              style={{ marginTop: 18 }}
              onClick={() => setSent(false)}
            >
              Send another message <Icon size={16} />
            </button>
          </div>
        ) : (
          <form className="form-stack" onSubmit={submit}>
            <label className="field">
              Your name
              <input
                name="name"
                autoComplete="name"
                minLength="2"
                maxLength="100"
                required
                placeholder="Full name"
              />
            </label>
            <div className="form-row">
              <label className="field">
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  maxLength="254"
                  required
                  placeholder="you@example.com"
                />
              </label>
              <label className="field">
                Phone (optional)
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  maxLength="30"
                  placeholder="+1 …"
                />
              </label>
            </div>
            <label className="field">
              Your travel plans
              <textarea
                name="message"
                required
                minLength="8"
                maxLength="5000"
                rows="6"
                defaultValue={
                  params.get("tour")
                    ? `I’d love to know more about ${params.get("tour").replaceAll("-", " ")}. `
                    : ""
                }
                placeholder="Where would you like to go? When? Who’s coming along? Tell us a little about your ideal trip."
              />
            </label>
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy ? "Sending…" : "Let’s start planning"}
              <Icon size={17} />
            </button>
          </form>
        )}
        <p>
          We use your details to respond to your enquiry. You won’t be added to
          a mailing list.
        </p>
      </div>
    </div>
  );
}
