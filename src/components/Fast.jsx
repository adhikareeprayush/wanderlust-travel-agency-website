import img1 from "../assets/fast/1.svg";
import img2 from "../assets/fast/2.svg";
import img3 from "../assets/fast/3.svg";
import heart from "../assets/fast/heart.svg";
import building from "../assets/fast/building.svg";
import leaf from "../assets/fast/leaf.svg";
import map from "../assets/fast/map.svg";
import send from "../assets/fast/send.svg";
import plane from "../assets/fast/plane.svg";
import img4 from "../assets/fast/img4.png";
import img5 from "../assets/fast/img5.jpg";
import bg from "../assets/packages/bg.svg";
import Section from "./Section";

const planningSteps = [
  {
    icon: img1,
    title: "Choose Destination",
    body: "Browse curated departures by pace, season, and travel style, then shortlist the route that fits your group.",
    color: "bg-primary",
    iconClass: "h-6 w-8 sm:h-[28px] sm:w-[36px]",
  },
  {
    icon: img2,
    title: "Check Availability",
    body: "Confirm live room blocks, rail seats, and optional private transfers before you commit to the date.",
    color: "bg-[#F0BB1F]",
    iconClass: "h-6 w-6 sm:h-[28px] sm:w-[28px]",
  },
  {
    icon: img3,
    title: "Let's Go",
    body: "Receive your digital itinerary, host contacts, and departure notes with every detail already handled.",
    color: "bg-[#006380]",
    iconClass: "h-6 w-6 sm:h-[28px] sm:w-[28px]",
  },
];

const Fast = () => {
  return (
    <Section classname="grid w-full max-w-[100vw] grid-cols-1 gap-12 overflow-x-clip 2xl:grid-cols-2 2xl:gap-0">
      <div className="col-span-1 flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-3">
          <span className="font-semibold font-poppins text-[18px] text-primary uppercase">
            Category
          </span>
          <h2 className="font-volkhov text-3xl font-bold capitalize leading-tight text-[#181E4B] sm:text-4xl md:text-5xl md:leading-tight lg:text-[50px] lg:leading-[50px]">
            We Offer Best Services
          </h2>
        </div>
        <div className="flex flex-col gap-5">
          {planningSteps.map((step) => (
            <div key={step.title} className="flex items-start gap-3">
              <div
                className={`flex h-12 min-w-[48px] shrink-0 items-center justify-center rounded-xl ${step.color} sm:min-w-[54px]`}
              >
                <img
                  src={step.icon}
                  alt=""
                  className={`${step.iconClass} object-contain`}
                />
              </div>
              <div className="min-w-0 flex flex-col">
                <h6 className="font-poppins text-[16px] font-bold text-[#5E6282]">
                  {step.title}
                </h6>
                <p className="font-poppins text-[15px] leading-relaxed text-[#5E6282] sm:text-[16px]">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative col-span-1 flex min-h-[640px] w-full min-w-0 items-center justify-center overflow-x-clip overflow-y-visible py-8 sm:min-h-[680px] sm:py-10 md:min-h-[720px] lg:min-h-[740px] 2xl:min-h-[720px] 2xl:py-12">
        <div className="relative z-10 mx-auto w-full max-w-[400px] px-3 sm:max-w-[420px] sm:px-4">
          <div className="relative z-10 mx-auto flex h-[380px] w-full max-w-[320px] flex-col justify-between gap-3 rounded-[26px] bg-white px-4 py-4 shadow-2xl sm:h-[400px] sm:px-5 sm:py-4">
            <img
              src={img5}
              alt=""
              className="h-36 w-full rounded-[20px] object-cover sm:h-[160px] sm:rounded-[26px]"
            />
            <h4 className="font-poppins text-[17px] font-medium text-[#080809] sm:text-[18px]">
              Trip to Hawaii
            </h4>
            <p className="font-poppins text-sm text-[#84829A] sm:text-[16px]">
              14-29 June | by JR Martinax
            </p>
            <div className="flex gap-3">
              {[leaf, map, send].map((ic, i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5]"
                >
                  <img src={ic} alt="" className="h-3.5 w-3.5 object-contain" />
                </div>
              ))}
            </div>
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <img
                  src={building}
                  alt=""
                  className="h-4 w-4 shrink-0 object-contain"
                />
                <span className="truncate font-poppins text-sm text-[#84829A] sm:text-[16px]">
                  60 people are interested
                </span>
              </div>
              <img
                src={heart}
                alt=""
                className="h-[18px] w-[18px] shrink-0 object-contain"
              />
            </div>
          </div>
          <div className="pointer-events-none absolute -top-6 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-[#59B1E6] opacity-80 blur-[60px] sm:h-[367px] sm:w-[354px] sm:blur-[75px]" />
          <img
            src={bg}
            alt=""
            className="pointer-events-none absolute -bottom-6 -left-4 -z-10 max-w-[120%] sm:-bottom-10 sm:-left-10"
          />
          <img
            src={plane}
            alt=""
            className="pointer-events-none absolute -right-[10%] -top-6 z-0 w-[min(420px,95vw)] max-w-none opacity-95 sm:-right-[14%] sm:-top-10 sm:w-[min(540px,90vw)] md:-right-[20%] md:-top-14 md:w-[min(660px,85vw)] lg:-right-[24%] lg:w-[min(760px,80vw)] xl:-right-[30%] xl:-top-20 xl:w-[min(860px,75vw)]"
          />
          <div className="relative z-10 mx-auto mt-6 w-full max-w-[300px] rounded-[18px] bg-white px-4 py-4 shadow-xl sm:absolute sm:bottom-6 sm:right-0 sm:mt-0 md:-right-8 lg:-right-12 xl:-right-24 2xl:-right-36">
            <div className="flex w-full items-center justify-start gap-3">
              <img
                src={img4}
                alt=""
                className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-[70px] sm:w-[70px]"
              />
              <div className="min-w-0 flex flex-col gap-1">
                <p className="font-poppins text-[13px] text-[#84829A] sm:text-[14px]">
                  Ongoing
                </p>
                <h4 className="truncate font-poppins text-[16px] font-medium text-[#080809] sm:text-[18px]">
                  Trip to Rome
                </h4>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <p className="font-poppins text-[13px] font-medium text-[#080809] sm:text-[14px]">
                <span className="text-primary">40%</span> completed
              </p>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#F5F5F5]">
                <div className="h-full w-[40%] bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Fast;
