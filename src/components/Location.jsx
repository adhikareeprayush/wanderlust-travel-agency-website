import Iframe from "react-iframe";
import { mapEmbed } from "../data/siteContent";

const Location = ({ title, src, blurb }) => {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-volkhov text-2xl font-bold text-[#181E4B] sm:text-[28px] md:text-[32px]">
        Location
      </h3>
      <p className="font-poppins text-[15px] leading-relaxed text-[#5E6282] sm:text-[16px]">
        {blurb ||
          "Meet your Wanderlust host near the main rendezvous area. Detailed notes are emailed seven days before departure."}
      </p>
      <div className="overflow-hidden rounded-[18px] shadow-[0_20px_60px_rgba(24,30,75,0.12)]">
        <Iframe
          src={src || mapEmbed.src}
          title={title || mapEmbed.title}
          className="h-[320px] w-full sm:h-[420px] lg:h-[520px]"
        />
      </div>
    </div>
  );
};

export default Location;
