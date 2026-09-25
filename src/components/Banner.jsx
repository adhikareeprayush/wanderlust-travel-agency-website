import { Link } from "react-router-dom";
import col1Image from "../assets/banners/1.jpg";
import col2Image from "../assets/banners/2.jpg";
import line1 from "../assets/banners/line1.svg";
import Button from "./Button";
const Banner = () => {
  return (
    <div className="grid min-h-[320px] w-full grid-cols-1 md:grid-cols-2 md:min-h-[400px]">
      <div className="relative flex min-h-[280px] items-center justify-center md:min-h-0">
        <img
          src={col1Image}
          alt=""
          className="absolute -z-10 h-full w-full object-cover brightness-50"
        />
        <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
          <span className="font-poppins text-sm font-bold uppercase tracking-wider text-[#FFEFEC] sm:text-[18px]">
            Promotion
          </span>
          <div className="relative">
            <h3 className="font-volkhov text-3xl font-bold leading-tight text-white sm:text-[40px] sm:leading-[56px] md:text-[50px] md:leading-[72px]">
              Explore Nature
            </h3>
            <img
              src={line1}
              alt=""
              className="absolute -bottom-2 -right-4 w-24 sm:-bottom-[10px] sm:-right-[30px] sm:w-auto"
            />
          </div>
          <Link to="/packages">
            <Button
              name={"View Packages"}
              variant="outline"
              classname="w-[150px]"
            />
          </Link>
        </div>
      </div>

      <div className="relative flex min-h-[280px] items-center justify-center md:min-h-0">
        <img
          src={col2Image}
          alt=""
          className="absolute -z-10 h-full w-full object-cover brightness-50"
        />
        <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
          <span className="font-poppins text-sm font-bold uppercase tracking-wider text-[#FFEFEC] sm:text-[18px]">
            Promotion
          </span>
          <div className="relative">
            <h3 className="font-volkhov text-3xl font-bold leading-tight text-white sm:text-[40px] sm:leading-[56px] md:text-[50px] md:leading-[72px]">
              Explore Cities
            </h3>
            <img
              src={line1}
              alt=""
              className="absolute -bottom-2 -right-4 w-24 sm:-bottom-[10px] sm:-right-[30px] sm:w-auto"
            />
          </div>
          <Link to="/packages">
            <Button
              name={"View Packages"}
              variant="outline"
              classname="w-[150px]"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner;
