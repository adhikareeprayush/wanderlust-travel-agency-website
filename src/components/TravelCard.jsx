import star from "../assets/trendy/star_fill.svg";

const TravelCard = ({ tour, featured }) => {
  if (!tour) return null;
  const { image, title, excerpt, dateLabel, peopleLabel, price, stars } = tour;
  return (
    <div
      className={`${
        featured
          ? "bg-white shadow-[0_22px_60px_rgba(24,30,75,0.08)]"
          : "bg-white/70"
      } mx-auto flex h-full w-full max-w-[min(100%,370px)] flex-col gap-4 rounded-[21px] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(24,30,75,0.12)] sm:p-[21px] lg:mx-0`}
    >
      <div className="flex flex-col">
        <img
          src={image}
          alt=""
          className={`h-[200px] w-full object-cover sm:h-[220px] md:h-[250px] ${
            featured ? "rounded-t-[21px]" : ""
          }`}
        />
        <div className="flex flex-wrap items-center justify-center gap-2 bg-primary px-3 py-2 font-poppins text-xs font-medium text-white sm:gap-4 sm:px-5 sm:text-[14px]">
          <p>{dateLabel}</p>
          <p>{peopleLabel}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-volkhov text-2xl font-bold text-[#181E4B] sm:text-[28px] md:text-[34px]">
          {title}
        </h3>
        <p className="font-poppins text-[15px] leading-relaxed text-[#5E6282] sm:text-[16px]">
          {excerpt}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-poppins text-[16px] font-medium text-[#262626] sm:text-[17px]">
            {price}
          </p>
          <div className="flex items-center gap-1">
            <img src={star} alt="" className="size-6 sm:size-7" />
            <p className="text-sm sm:text-base">{stars} stars</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelCard;
