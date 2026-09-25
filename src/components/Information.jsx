import star from "../assets/trendy/star_fill.svg";
import { formatMoney, resolveTourImage } from "../lib/tourImages";

const Information = ({ tour }) => {
  if (!tour) return null;
  const gallery = (tour.galleryKeys || []).slice(0, 6).map(resolveTourImage);
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 flex flex-col gap-1">
          <h3 className="font-volkhov text-2xl font-bold text-[#181E4B] sm:text-[28px] md:text-[32px]">
            {tour.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <img
                  key={i}
                  src={star}
                  alt=""
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              ))}
            </div>
            <span className="font-poppins text-sm font-medium text-[#5E6282] sm:text-[16px]">
              ({tour.reviewCount || `${tour.rating} stars`})
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-baseline gap-1">
          <span className="font-poppins text-2xl font-medium text-primary sm:text-[29px]">
            {formatMoney(tour.basePrice)}
          </span>
          <span className="font-poppins text-sm font-normal text-[#7D7D7D] sm:text-[16px]">
            / Per person
          </span>
        </div>
      </div>
      <p className="font-poppins text-[15px] leading-relaxed sm:text-[16px]">
        {tour.description || tour.excerpt}
      </p>
      <div className="-mx-1 overflow-x-auto sm:mx-0">
        <table className="min-w-[520px] border-separate border-spacing-4 sm:min-w-0 sm:border-spacing-6">
          <tbody>
            {(tour.facts || []).map((row) => (
              <tr key={row.label}>
                <td className="whitespace-nowrap font-poppins text-base font-bold text-primary sm:text-[18px]">
                  {row.label}
                </td>
                <td className="font-poppins text-sm text-black sm:text-[16px]">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {gallery.length ? (
        <div className="flex flex-col gap-3">
          <h4 className="font-volkhov text-3xl font-bold text-[#181E4B]">
            From our gallery
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="h-40 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Information;
