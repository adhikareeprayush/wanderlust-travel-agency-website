import { Link } from "react-router-dom";
import Button from "./Button";
import img1 from "../assets/views/1.jpg";
import innerImage from "../assets/packages/inner.jpg";
import Section from "./Section";

const Views = () => {
  return (
    <Section classname="relative flex w-full flex-col gap-12 overflow-x-clip lg:flex-row lg:items-start lg:justify-between lg:gap-10 xl:gap-12">
      <div className="flex w-full min-w-0 flex-1 flex-col gap-8">
        <div className="flex flex-col gap-5">
          <span className="font-semibold font-poppins text-[18px] text-primary uppercase">
            Promotion
          </span>
          <h2 className="font-volkhov text-3xl font-bold capitalize leading-tight text-[#181E4B] sm:text-4xl md:text-5xl md:leading-tight lg:text-[50px] lg:leading-[50px]">
            We Provide You Best <br className="hidden sm:block" /> Europe
            Sightseeing Tours
          </h2>
          <p className="max-w-full font-poppins text-[16px] leading-relaxed text-[#5E6282] lg:max-w-xl">
            Our Europe specialists pair the landmarks you came for with the
            slower moments that make a trip feel personal: neighborhood hotels,
            scenic rail days, market tastings, and guides who know when to step
            back so you can simply enjoy the view.
          </p>
          <Link to="/packages">
            <Button name={"View Packages"} classname="w-fit" />
          </Link>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative col-span-1 aspect-[4/3] overflow-hidden rounded-[10px]"
            >
              <img
                src={img1}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="button-gradient absolute right-2 top-4 flex items-center justify-center rounded-full px-2 py-1 font-poppins text-sm font-light text-white sm:text-[16px]">
                <p>$700</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mx-auto hidden w-full max-w-[380px] shrink-0 lg:block lg:max-w-none lg:w-[min(42%,440px)]">
        <div className="relative mx-auto w-full max-w-[350px]">
          <div className="absolute bottom-0 left-[10px] -z-10 h-[520px] w-full max-w-[350px] rounded-t-full border-2 border-[#a7327a] sm:h-[580px] md:h-[620px]" />
          <img
            src={innerImage}
            alt=""
            className="h-[520px] w-full max-w-[350px] rounded-t-full object-cover sm:h-[580px] md:h-[620px]"
          />
          <h3 className="pointer-events-none absolute bottom-16 right-3 max-h-[55%] origin-bottom-right font-poppins text-2xl font-bold leading-tight tracking-wide text-black/20 [text-orientation:mixed] [writing-mode:vertical-rl] sm:bottom-20 sm:right-4 sm:text-3xl md:bottom-24 md:text-[34px] xl:text-[40px]">
            Honeymoon Packages
          </h3>
        </div>
      </div>
    </Section>
  );
};

export default Views;
