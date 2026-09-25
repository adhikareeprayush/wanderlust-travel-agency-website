import logo1 from "../assets/brands/1.svg";
import logo3 from "../assets/brands/3.svg";

const Brands = () => {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-8 bg-[#F7F7F7] px-4 py-8 sm:justify-between sm:gap-6 sm:px-8 md:px-16 lg:px-24 xl:px-[140px]">
      <img
        src={logo1}
        className="h-8 max-w-[100px] object-contain sm:h-10 sm:max-w-[120px]"
        alt=""
      />
      <img
        src={logo1}
        className="h-8 max-w-[100px] object-contain sm:h-10 sm:max-w-[120px]"
        alt=""
      />
      <img
        src={logo3}
        className="h-8 max-w-[100px] object-contain sm:h-10 sm:max-w-[120px]"
        alt=""
      />
      <img
        src={logo3}
        className="h-8 max-w-[100px] object-contain sm:h-10 sm:max-w-[120px]"
        alt=""
      />
      <img
        src={logo1}
        className="h-8 max-w-[100px] object-contain sm:h-10 sm:max-w-[120px]"
        alt=""
      />
    </div>
  );
};

export default Brands;
