import innerImage from "../assets/packages/inner.jpg";
import bg from "../assets/packages/bg.svg";
import image0 from "../assets/packages/0.jpg";
import image1 from "../assets/packages/1.jpg";
import image2 from "../assets/packages/2.jpg";
import { Link } from "react-router-dom";
import Button from "./Button";
import Section from "./Section";

const ViewPackages = () => {
  return (
    <Section classname="flex w-full flex-col items-center gap-12 overflow-x-hidden lg:flex-row lg:items-center lg:justify-start lg:gap-20">
      <div className="relative mx-auto w-full max-w-[min(100%,380px)] shrink-0 px-2 sm:max-w-[400px]">
        <div className="absolute bottom-0 left-[8px] -z-10 h-[520px] w-[min(88%,350px)] rounded-t-full border-2 border-[#a7327a] sm:left-[15px] sm:h-[580px] md:h-[620px]" />
        <img
          src={innerImage}
          alt=""
          className="mx-auto h-[520px] w-full max-w-[350px] rounded-t-full object-cover sm:h-[580px] md:h-[620px]"
        />
        <h3 className="pointer-events-none absolute bottom-16 left-3 hidden max-h-[55%] origin-bottom-left font-poppins text-2xl font-bold leading-tight tracking-wide text-black/20 [text-orientation:mixed] [writing-mode:vertical-lr] sm:bottom-20 sm:left-4 sm:text-3xl md:bottom-24 md:text-[34px] lg:block xl:text-[40px]">
          Honeymoon Packages
        </h3>
        <img
          src={bg}
          alt=""
          className="absolute -bottom-8 -right-4 -z-10 h-28 w-24 object-contain sm:-bottom-[50px] sm:-right-[50px] sm:h-[160px] sm:w-[120px]"
        />
        <img
          src={image1}
          alt=""
          className="absolute left-0 top-[38%] h-16 w-16 rounded-full object-cover sm:-left-[60px] sm:top-[200px] sm:h-[90px] sm:w-[90px] lg:-left-[100px]"
        />
        <img
          src={image0}
          alt=""
          className="absolute -left-2 top-4 h-24 w-24 rounded-full object-cover sm:-left-6 sm:top-0 sm:h-[140px] sm:w-[140px] md:-left-[30px]"
        />
        <img
          src={image2}
          alt=""
          className="absolute -top-2 right-8 h-10 w-10 rounded-full object-cover sm:left-[120px] sm:right-auto sm:h-[50px] sm:w-[50px]"
        />
      </div>
      <div className="flex w-full min-w-0 max-w-xl flex-col gap-5 text-center lg:text-left">
        <span className="font-semibold font-poppins text-[18px] text-primary uppercase">
          Honeymoon Specials
        </span>
        <h2 className="font-volkhov text-3xl font-bold capitalize leading-tight text-[#181E4B] sm:text-4xl md:text-5xl md:leading-tight lg:text-[50px] lg:leading-[50px]">
          Our Romantic Tropical Destinations
        </h2>
        <p className="font-poppins text-[16px] leading-relaxed text-[#5E6282]">
          Celebrate slower days with private-island picnics, spa-forward resort
          stays, and sunset transfers timed around your arrival. Every romantic
          itinerary includes flexible downtime, thoughtful upgrades, and local
          hosts who keep the experience effortless.
        </p>
        <div className="flex justify-center lg:justify-start">
          <Link to="/packages">
            <Button name={"View Packages"} classname="w-fit" />
          </Link>
        </div>
      </div>
    </Section>
  );
};

export default ViewPackages;
