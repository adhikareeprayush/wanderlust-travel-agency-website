import curve from "../assets/curve.svg";
import Button from "./Button";
import Circle from "./Circle";
import BottomCircle from "./BottomCircle";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { heroAvatars, heroSlides } from "../data/siteContent";

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  return (
    <div className="relative h-[100svh] min-h-[520px] w-full overflow-hidden">
      <Swiper
        className="absolute inset-0 h-full w-full"
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000 }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        modules={[Autoplay]}
      >
        {heroSlides.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={img}
              alt=""
              className="h-full w-full object-cover brightness-50"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center gap-2 sm:bottom-10 sm:gap-4">
        {heroSlides.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full sm:h-[5px] ${
              activeIndex == index
                ? "w-10 bg-primary sm:w-[100px]"
                : "w-8 bg-white/70 sm:w-16"
            }`}
          />
        ))}
      </div>
      <div className="absolute left-0 top-1/2 z-10 flex w-fit max-w-[min(100%,calc(100vw-1.5rem))] -translate-y-1/2 transform flex-col items-start gap-4 px-4 sm:px-8 lg:pl-12 xl:pl-24 2xl:pl-[200px]">
        <img src={curve} alt="" className="w-14 sm:w-[80px]" />
        <h1 className="max-w-[22rem] font-poppins text-3xl font-bold leading-tight text-white sm:max-w-xl sm:text-4xl sm:leading-tight md:max-w-2xl md:text-5xl lg:max-w-[40rem] lg:text-[52px] lg:leading-[1.15] xl:max-w-[631px] xl:text-[58px] xl:leading-[70px]">
          No matter where you’re going to, we’ll take you there
        </h1>
        <form
          className="flex w-full max-w-full flex-col gap-2 rounded-md bg-[#F3f3f3]/60 px-3 py-3 backdrop-blur-[18px] sm:w-fit sm:flex-row sm:items-center sm:gap-3 sm:rounded-[6px] sm:px-3 sm:py-2"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const q = [
              data.get("place"),
              data.get("travelType"),
              data.get("duration"),
            ]
              .filter(Boolean)
              .join(" ")
              .trim();
            navigate(q ? `/packages?q=${encodeURIComponent(q)}` : "/packages");
          }}
        >
          <input
            type="text"
            name="place"
            id="place"
            placeholder="Where to?"
            className="min-h-[44px] w-full border-b border-white/25 bg-transparent px-2 font-poppins text-base text-white outline-0 placeholder:text-white/90 sm:w-[130px] sm:flex-none sm:border-b-0 sm:border-r-2 sm:border-white/30 sm:px-2 sm:text-[18px]"
          />
          <input
            type="text"
            name="travelType"
            id="travelType"
            placeholder="Travel Type"
            className="min-h-[44px] w-full border-b border-white/25 bg-transparent px-2 font-poppins text-base text-white outline-0 placeholder:text-white/90 sm:w-[130px] sm:flex-none sm:border-b-0 sm:border-r-2 sm:border-white/30 sm:px-2 sm:text-[18px]"
          />
          <input
            type="text"
            name="duration"
            id="duration"
            placeholder="Duration"
            className="min-h-[44px] w-full border-b border-white/25 bg-transparent px-2 font-poppins text-base text-white outline-0 placeholder:text-white/90 sm:w-[130px] sm:flex-none sm:border-b-0 sm:border-white/30 sm:px-2 sm:text-[18px]"
          />
          <Button
            name={"Submit"}
            type="submit"
            classname="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center px-6 sm:w-auto"
          />
        </form>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex h-10 w-[200px] shrink-0 items-center">
            <Circle src={heroAvatars[0]} />
            <Circle src={heroAvatars[1]} classname={"left-[20px] z-10"} />
            <Circle src={heroAvatars[2]} classname={"left-[40px] z-10"} />
            <Circle src={heroAvatars[3]} classname={"left-[60px] z-10"} />
            <Circle src={heroAvatars[4]} classname={"left-[80px] z-10"} />
            <Circle src={heroAvatars[5]} classname={"left-[100px] z-10"} />
            <Circle variant={"none"} classname={"left-[120px] z-10"} />
          </div>
          <p className="flex h-full items-center font-poppins text-xs font-medium text-white sm:text-[13px]">
            2,500 people booked Tomorrowland Event in last 24 hours
          </p>
        </div>
      </div>
      <BottomCircle />
    </div>
  );
};
export default Hero;
