import ServicesCard from "./ServicesCard";
import image1 from "../assets/services/1.svg";
import image2 from "../assets/services/2.svg";
import image3 from "../assets/services/3.svg";
import image4 from "../assets/services/4.svg";
import Section from "./Section";

const services = [
  {
    img: image1,
    title: "Guided Tours",
    desc: "Licensed local hosts, balanced daily pacing, and flexible routes for curious travelers.",
  },
  {
    img: image2,
    title: "Best Flights Options",
    desc: "Smart routing advice, fare-window guidance, and transfer timing checked against every itinerary.",
  },
  {
    img: image3,
    title: "Cultural Journeys",
    desc: "Temple visits, market walks, family kitchens, and heritage sites handled with respectful context.",
  },
  {
    img: image4,
    title: "Travel Insurance",
    desc: "Clear coverage recommendations for delays, medical needs, luggage, and adventure activities.",
  },
];

const Services = () => {
  return (
    <Section classname="flex w-full flex-col items-center gap-[20px] overflow-hidden">
      <span className="font-semibold font-poppins text-[18px] text-primary uppercase">
        Category
      </span>
      <h2 className="text-center font-volkhov text-3xl font-bold capitalize leading-tight text-[#181E4B] sm:text-4xl md:text-5xl lg:text-left lg:text-[50px] lg:leading-[50px]">
        We Offer Best Services
      </h2>
      <div className="mt-5 grid w-full grid-cols-1 place-items-center gap-6 sm:grid-cols-2 lg:flex lg:flex-row lg:items-start lg:justify-between lg:gap-5">
        {services.map((service) => (
          <ServicesCard key={service.title} {...service} />
        ))}
      </div>
    </Section>
  );
};

export default Services;
