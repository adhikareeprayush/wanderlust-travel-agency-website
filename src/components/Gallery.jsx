import { galleryMosaic } from "../data/siteContent";

const Gallery = ({ images }) => {
  const mosaic = images?.length ? images : galleryMosaic;
  const [a, b, c, d, e, f, g] = mosaic;
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 md:hidden">
        {mosaic.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="h-52 w-full rounded-lg object-cover"
          />
        ))}
      </div>
      <div className="hidden grid-cols-3 gap-3 md:grid">
        <div className="col-span-1">
          <img src={a} alt="" className="h-[244px] w-full object-cover" />
        </div>
        <div className="col-span-2 row-span-3">
          <img
            src={b}
            alt=""
            className="h-full min-h-[244px] w-full object-cover"
          />
        </div>
        <div className="col-span-1 h-[244px]">
          <img src={c} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="col-span-1 h-[244px]">
          <img src={d} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="col-span-2 h-[244px]">
          <img src={e} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="col-span-1 h-[244px]">
          <img src={f || a} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="col-span-3 h-[244px]">
          <img src={g || b} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Gallery;
