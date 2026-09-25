import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { imageUrl } from "../lib/imagekit";
const image = imageUrl("/images/story.webp", { width: 1600 });
export default function About() {
  return (
    <div className="container editorial">
      <header>
        <p className="eyebrow">THE WANDERLUST WAY</p>
        <h1>
          We’re here for the places.
          <br />
          <em>And everything in between.</em>
        </h1>
        <p>
          Travel is more than getting away. It’s a chance to see differently,
          connect more deeply, and come home with a little more of the world in
          you.
        </p>
      </header>
      <img
        className="about-cover"
        src={image}
        alt="A traveller taking the slow route through green rice fields"
      />
      <div className="values-grid">
        {[
          [
            "globe",
            "Go a little deeper.",
            "We build journeys around local knowledge: the quiet walking route, the family-run stay, and the stories you won’t find on a postcard.",
          ],
          [
            "leaf",
            "Leave room for discovery.",
            "A good itinerary gives you a sense of direction and space to be curious. We balance shared experiences with time to explore at your own pace.",
          ],
          [
            "users",
            "Travel feels personal.",
            "From your first question to your final day, you’ll have a team to help with the details. Tell us what matters to you, and we’ll start there.",
          ],
        ].map(([icon, title, body]) => (
          <article key={title}>
            <Icon name={icon} size={30} />
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <div className="planning-band" style={{ marginBottom: 0 }}>
        <div>
          <p className="eyebrow">LET’S MAKE A MEMORY</p>
          <h2>
            Your next chapter
            <br />
            <em>is out there.</em>
          </h2>
        </div>
        <Link to="/packages" className="button">
          Find your journey <Icon size={17} />
        </Link>
      </div>
    </div>
  );
}
