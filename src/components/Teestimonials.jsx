import bg from "../assets/testimonials/testimonials.svg";
import doublequote from "../assets/testimonials/doubleq.svg";
import left from "../assets/testimonials/left.svg";
import right from "../assets/testimonials/right.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { testimonialSlides } from "../data/siteContent";

const Teestimonials = () => {
  return (
    <div className="relative flex min-h-[560px] w-full max-w-[100vw] flex-col items-center justify-center overflow-hidden py-10 sm:min-h-[600px] md:min-h-[620px] md:py-0">
      <img
        src={bg}
        alt=""
        className="absolute -z-10 h-full w-full object-cover"
      />
      <div className="mt-8 flex flex-col items-center gap-2 px-4 sm:mt-[60px]">
        <span className="text-center font-semibold font-poppins text-[18px] text-primary uppercase">
          Testimonials
        </span>
        <h2 className="text-center font-volkhov text-3xl font-bold capitalize leading-tight text-[#181E4B] sm:text-4xl md:text-5xl md:leading-tight lg:text-[50px] lg:leading-[50px]">
          See What Our Clients Say <br /> About Us
        </h2>
      </div>
      <div className="relative w-full max-w-[min(100%,640px)] px-4">
        <Swiper
          modules={[Navigation]}
          slidesPerView={1}
          centeredSlides
          slidesPerGroup={1}
          navigation={{
            prevEl: ".prev-testimonial",
            nextEl: ".next-testimonial",
          }}
        >
          {testimonialSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative mx-auto mt-16 flex w-full max-w-[min(100%,600px)] flex-col items-center gap-2 rounded-[17px] bg-white px-4 pb-8 pt-12 sm:mt-[100px] sm:px-10 sm:pt-14">
                <img
                  src={slide.photo}
                  className="absolute -top-12 left-1/2 h-24 w-24 -translate-x-1/2 transform rounded-full border-4 border-white object-cover shadow-md sm:-top-[60px] sm:h-[120px] sm:w-[120px]"
                  alt=""
                />
                <div className="relative mt-5 flex flex-col items-center gap-3">
                  <p className="max-w-full px-1 text-center font-poppins text-[13px] tracking-wider text-black sm:max-w-[400px]">
                    {slide.quote}
                  </p>
                  <h6 className="text-center font-poppins text-[13px] font-bold tracking-wider text-black">
                    {slide.name} — {slide.role}
                  </h6>
                  <img
                    src={doublequote}
                    alt=""
                    className="absolute -top-[30px] left-0 w-[60px]"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <img
          src={left}
          alt="Previous testimonial"
          className="prev-testimonial absolute left-1 top-1/2 z-50 h-12 w-12 -translate-y-1/2 cursor-pointer object-contain sm:left-2 sm:h-[72px] sm:w-[72px] md:-left-2 lg:-left-10"
        />
        <img
          src={right}
          alt="Next testimonial"
          className="next-testimonial absolute right-1 top-1/2 z-50 h-12 w-12 -translate-y-1/2 cursor-pointer object-contain sm:right-2 sm:h-[72px] sm:w-[72px] md:-right-2 lg:-right-10"
        />
      </div>
      <div className="mt-[30px] flex items-center gap-4">
        <div className="h-1 w-8 rounded-full bg-white"></div>
        <div className="h-1 w-8 rounded-full bg-primary"></div>
        <div className="h-1 w-8 rounded-full bg-white"></div>
      </div>
    </div>
  );
};

export default Teestimonials;
