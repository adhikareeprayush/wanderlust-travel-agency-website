/** Marketing copy + image refs (bundled assets only — no hotlinked stock URLs). */
import heroMain from "../assets/hero2.jpg";
import heroAlt from "../assets/about/hero.jpg";
import pkgInner from "../assets/packages/inner.jpg";
import pkg0 from "../assets/packages/0.jpg";
import pkg1 from "../assets/packages/1.jpg";
import pkg2 from "../assets/packages/2.jpg";
import view1 from "../assets/views/1.jpg";
import banner1 from "../assets/banners/1.jpg";
import banner2 from "../assets/banners/2.jpg";
import holiday from "../assets/holiday.jpg";
import sec3 from "../assets/about/sec3.jpg";
import testimonialsPhoto from "../assets/testimonials/photo.jpg";
import hatPhoto from "../assets/testimonials/hat.png";
import fastImg4 from "../assets/fast/img4.png";
import card1Image from "../assets/trendy/card1.png";
import card1Flag from "../assets/trendy/card1Flag.png";

export const heroSlides = [heroMain, heroAlt, pkgInner];

/** Small round avatars in the hero “social proof” row */
export const heroAvatars = [
  testimonialsPhoto,
  pkg0,
  pkg1,
  pkg2,
  view1,
  holiday,
];

export const tourPackages = [
  {
    id: "p1",
    featured: true,
    image: pkg0,
    title: "Swiss Alps & Lakes",
    excerpt:
      "Zermatt viewpoints, Lucerne old town, and scenic rail between glacier peaks and turquoise lakes.",
    dateLabel: "14 May 2026",
    peopleLabel: "18 guests",
    price: "From $1,280",
    stars: "4.9",
  },
  {
    id: "p2",
    featured: false,
    image: pkg1,
    title: "Amalfi Coast Sunsets",
    excerpt:
      "Positano cliff walks, Capri by hydrofoil, and family-run trattorias along the Sorrentine peninsula.",
    dateLabel: "3 Jun 2026",
    peopleLabel: "12 guests",
    price: "From $1,890",
    stars: "4.8",
  },
  {
    id: "p3",
    featured: false,
    image: pkg2,
    title: "Scottish Highlands",
    excerpt:
      "Loch cruises, whisky tastings, and castle stays from Inverness to the Isle of Skye.",
    dateLabel: "22 Jul 2026",
    peopleLabel: "14 guests",
    price: "From $1,450",
    stars: "4.7",
  },
  {
    id: "p4",
    featured: false,
    image: view1,
    title: "Lisbon & Porto",
    excerpt:
      "Tile workshops, Douro valley terraces, and Atlantic sunsets from miradouros above the city.",
    dateLabel: "9 Sep 2026",
    peopleLabel: "20 guests",
    price: "From $1,120",
    stars: "4.8",
  },
  {
    id: "p5",
    featured: false,
    image: banner1,
    title: "Patagonia Trek",
    excerpt:
      "Torres del Paine W-trek with eco-lodges, glacier viewpoints, and expert mountain guides.",
    dateLabel: "4 Nov 2026",
    peopleLabel: "10 guests",
    price: "From $2,990",
    stars: "5.0",
  },
  {
    id: "p6",
    featured: false,
    image: holiday,
    title: "Bali Slow Travel",
    excerpt:
      "Rice terraces, artisan villages, and boutique stays away from the busiest beach strips.",
    dateLabel: "18 Jan 2027",
    peopleLabel: "16 guests",
    price: "From $1,650",
    stars: "4.9",
  },
  {
    id: "p7",
    featured: false,
    image: sec3,
    title: "Moroccan Medina",
    excerpt:
      "Fes tanneries, Atlas kasbahs, and a night under desert stars before returning to Marrakech.",
    dateLabel: "7 Mar 2027",
    peopleLabel: "15 guests",
    price: "From $1,340",
    stars: "4.6",
  },
];

export const trendingTours = [
  {
    id: "tr1",
    image: card1Image,
    flag: card1Flag,
    title: "Switzerland Express",
    duration: "8 days",
    group: "22 travelers booked",
    region: "Europe",
    priceNow: "$1,280",
    priceWas: "$1,540",
    blurb:
      "Alpine rail passes, fondue tastings in Gruyères, and a full day on Lake Geneva by private boat.",
  },
  {
    id: "tr2",
    image: pkg1,
    flag: null,
    title: "Kyoto Heritage",
    duration: "10 days",
    group: "16 travelers booked",
    region: "Asia",
    priceNow: "$2,450",
    priceWas: "$2,899",
    blurb:
      "Tea houses, bamboo groves, and evening strolls through Gion with a licensed cultural guide.",
  },
  {
    id: "tr3",
    image: banner2,
    flag: null,
    title: "Patagonia Peaks",
    duration: "12 days",
    group: "12 travelers booked",
    region: "South America",
    priceNow: "$3,200",
    priceWas: "$3,650",
    blurb:
      "Glacier trekking, puma tracking with naturalists, and cozy refugios between long daylight hikes.",
  },
];

export const galleryMosaic = [
  pkg0,
  pkgInner,
  pkg1,
  pkg2,
  view1,
  fastImg4,
  holiday,
];

export const tourInformation = {
  title: "Swiss Alps & Lakes",
  reviewCount: "2.4k reviews",
  priceMain: "1,280 $",
  priceUnit: "Per person (twin share)",
  body: "Meet your guide in Zürich, then wind through alpine valleys by panoramic train. You will stay in timber chalets, hike gentle ridgelines suited to mixed fitness, and enjoy one free afternoon for spa time or optional paragliding. Evening meals highlight raclette, roesti, and local wines from Valais producers we partner with year round.",
  facts: [
    {
      label: "Destination",
      value: "Zürich → Interlaken → Zermatt, Switzerland",
    },
    { label: "Departure", value: "Zürich HB main concourse, 09:00" },
    { label: "Return", value: "Zürich Airport (ZRH), flexible day 8" },
    { label: "Difficulty", value: "Moderate (3–6 mi walks daily)" },
    {
      label: "Included",
      value: "Rail pass, breakfasts, 4 dinners, guided hikes",
    },
    { label: "Not included", value: "International flights, travel insurance" },
  ],
  galleryTitle: "From our gallery",
  galleryIntro:
    "A few snapshots from recent departures: lakeside promenades, sunrise over the Matterhorn, and cable-car viewpoints above Lauterbrunnen.",
  galleryImages: [pkg0, pkg1, view1, sec3, holiday, banner1],
};

export const testimonialSlides = [
  {
    id: "ts1",
    photo: testimonialsPhoto,
    quote:
      "Wanderlust handled every transfer and hotel switch flawlessly. Our guide in Switzerland knew the quiet trails away from the crowds—we would book again without hesitation.",
    name: "Maya Lindstrom",
    role: "Product lead, Stockholm",
  },
  {
    id: "ts2",
    photo: hatPhoto,
    quote:
      "Clear pricing, responsive staff on WhatsApp, and thoughtful pacing for our parents in their sixties. The Amalfi itinerary felt curated, not copy-pasted from a brochure.",
    name: "Jonah Adeyemi",
    role: "Architect, Toronto",
  },
  {
    id: "ts3",
    photo: testimonialsPhoto,
    quote:
      "We tacked on two extra nights in Kyoto and the team reissued rail seats the same afternoon. That level of service is rare for a boutique operator.",
    name: "Renée Park",
    role: "Photographer, Austin",
  },
];

export const aboutDestinationGrid = [
  { city: "Lucerne", price: "$920", image: pkg0 },
  { city: "Reykjavík", price: "$1,240", image: banner1 },
  { city: "Porto", price: "$780", image: pkg1 },
  { city: "Queenstown", price: "$1,680", image: view1 },
  { city: "Kyoto", price: "$1,990", image: pkg2 },
  { city: "Marrakech", price: "$860", image: sec3 },
  { city: "Banff", price: "$1,120", image: banner2 },
  { city: "Santorini", price: "$1,450", image: holiday },
  { city: "Zermatt", price: "$1,620", image: pkgInner },
  { city: "Bergen", price: "$1,380", image: banner1 },
  { city: "Dubrovnik", price: "$1,050", image: fastImg4 },
  { city: "Hanoi", price: "$890", image: pkg0 },
];

export const mapEmbed = {
  title: "Zürich, Switzerland",
  src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d86463.5426728083!2d8.4376024!3d47.3774339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47900b9749bea219%3A0xe66e8df1e71fdc03!2sZurich!5e0!3m2!1sen!2sch!4v1700000000000!5m2!1sen!2sch",
};
