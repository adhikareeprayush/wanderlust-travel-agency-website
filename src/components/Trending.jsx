import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import calendar from "../assets/trendy/calendar.svg";
import location from "../assets/trendy/location.svg";
import user from "../assets/trendy/user.svg";
import star from "../assets/trendy/star_fill.svg";
import Button from "./Button";
import Section from "./Section";
import { api } from "../api/client";
import { formatMoney, resolveTourImage } from "../lib/tourImages";

const TrendingCard = ({ tour, reverse }) => {
  const rowClass = reverse
    ? "flex-col sm:flex-row-reverse lg:flex-col"
    : "flex-col sm:flex-row lg:flex-col";
  return (
    <div
      className={`col-span-1 flex ${rowClass} justify-between gap-4 rounded-[18px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(24,30,75,0.10)] sm:gap-4 lg:flex-col lg:p-3`}
    >
      <div className="image-container relative w-full rounded-[10px] sm:w-[42%] lg:w-full">
        <img
          src={resolveTourImage(tour.imageKey)}
          alt=""
          className="h-56 w-full rounded-[10px] object-cover sm:h-64 md:h-72 lg:h-[300px]"
        />
        {tour.flagKey ? (
          <img
            src={resolveTourImage(tour.flagKey)}
            alt=""
            className="absolute bottom-0 left-[40px] h-[78px] w-[78px] rounded-full border-4 border-white object-cover shadow-md lg:-bottom-[39px]"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 max-w-[400px] flex-1 flex-col gap-3 sm:max-w-none">
        <div className="mt-4 flex flex-wrap gap-3 sm:mt-[30px] sm:items-center">
          <div className="flex items-center gap-2">
            <img src={calendar} alt="" className="size-5" />
            <span className="font-poppins text-[17px] capitalize text-[#7D7D7D]">
              {tour.durationDays} days
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img src={user} alt="" className="size-5" />
            <span className="font-poppins text-[17px] capitalize text-[#7D7D7D]">
              {tour.groupLabel || "Small group"}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <h3 className="font-poppins text-2xl font-bold text-[#2F2F2F] sm:text-[29px]">
            {tour.title}
          </h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <img key={i} src={star} alt="" className="size-5" />
            ))}
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <img src={location} alt="" className="size-5" />
            <span className="font-poppins text-[17px] capitalize text-[#7D7D7D]">
              {tour.region}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <h5 className="font-poppins text-[29px] font-medium text-primary">
            {formatMoney(tour.basePrice)}
          </h5>
          {tour.compareAtPrice ? (
            <h5 className="font-poppins text-[22px] font-medium text-[#7D7D7D] line-through">
              {formatMoney(tour.compareAtPrice)}
            </h5>
          ) : null}
        </div>
        <p className="font-poppins text-[12px] text-black">{tour.excerpt}</p>
        <Link to={`/packages/${tour.slug}`}>
          <Button name={"Explore Now"} classname="w-fit" />
        </Link>
      </div>
    </div>
  );
};

const Trending = () => {
  const [tours, setTours] = useState([]);
  useEffect(() => {
    api("/tours?featured=true", { auth: false })
      .then((d) => setTours(d.tours.slice(0, 3)))
      .catch(() => setTours([]));
  }, []);

  return (
    <Section classname="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-2">
        <span className="text-center font-semibold font-poppins text-[18px] text-primary uppercase">
          Trendy
        </span>
        <h2 className="text-center font-volkhov text-3xl font-bold capitalize leading-tight text-[#181E4B] sm:text-4xl md:text-5xl md:leading-tight lg:text-[50px] lg:leading-[50px]">
          Our Trending Tour <br /> Packages
        </h2>
      </div>
      <div className="grid w-full grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-3 lg:gap-[50px]">
        {tours.map((tour, i) => (
          <TrendingCard key={tour._id} tour={tour} reverse={i === 1} />
        ))}
      </div>
    </Section>
  );
};

export default Trending;
