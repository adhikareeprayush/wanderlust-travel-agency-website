const itineraryDays = [
  {
    day: "01",
    title: "Arrival & Welcome Walk",
    body: "Meet your tour host at the arrival hotel, settle in, and take a relaxed orientation walk through the old town before a welcome dinner.",
    highlights: [
      "Airport transfer assistance",
      "Boutique hotel check-in",
      "Local guide welcome briefing",
      "Group dinner reservation",
    ],
  },
  {
    day: "02",
    title: "Historic City Highlights",
    body: "Spend the day exploring signature landmarks, quiet lanes, and neighborhood cafes with a guide who adapts the pace to the group.",
    highlights: [
      "Skip-the-line landmark access",
      "Curated lunch stop",
      "Free evening recommendations",
      "Photo-friendly walking route",
    ],
  },
  {
    day: "03",
    title: "Scenic Rail & Village Stay",
    body: "Travel by panoramic rail into the countryside, then check into a family-run stay close to lakeside trails and mountain viewpoints.",
    highlights: [
      "Reserved rail seats",
      "Luggage transfer support",
      "Village tasting experience",
      "Sunset viewpoint walk",
    ],
  },
  {
    day: "04",
    title: "Nature Excursion",
    body: "Choose a gentle hike, cycling loop, or spa morning before regrouping for a lakeside cruise and seasonal dinner.",
    highlights: [
      "Flexible activity options",
      "Certified local guide",
      "Cruise ticket included",
      "Regional tasting menu",
    ],
  },
  {
    day: "05",
    title: "Departure Support",
    body: "Enjoy a slow breakfast, collect your travel notes, and depart with onward transfer guidance from the Wanderlust team.",
    highlights: [
      "Late checkout request support",
      "Private transfer options",
      "Digital itinerary archive",
      "Post-trip concierge follow-up",
    ],
  },
];

const TourPlan = ({ itinerary }) => {
  const days = itinerary?.length ? itinerary : itineraryDays;
  return (
    <>
      <h3 className="font-volkhov text-2xl font-bold text-[#181E4B] sm:text-[28px] md:text-[32px]">
        Tour Plan
      </h3>
      <div className="flex flex-col">
        {days.map((item, index) => (
          <div key={item.day} className="flex items-stretch">
            <div className="relative flex w-[46px] shrink-0 justify-center sm:w-[56px]">
              {index !== itineraryDays.length - 1 ? (
                <div className="absolute bottom-0 top-11 w-px border-l border-dashed border-primary/70" />
              ) : null}
              <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-poppins text-sm font-bold text-white shadow-lg shadow-primary/20 sm:h-12 sm:w-12">
                {item.day}
              </div>
            </div>
            <div className="min-w-0 flex-1 pb-8 pl-3 sm:pl-5">
              <div className="rounded-2xl border border-[#181E4B]/10 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-2">
                  <h5 className="font-poppins text-[18px] font-semibold text-[#181E4B] sm:text-[20px]">
                    Day {Number(item.day)}: {item.title}
                  </h5>
                  <p className="font-poppins text-[15px] leading-relaxed text-[#5E6282] sm:text-[16px]">
                    {item.body}
                  </p>
                </div>
                <ul className="mt-4 grid list-disc grid-cols-1 gap-x-6 gap-y-1 px-4 font-poppins text-[14px] text-[#181E4B] sm:grid-cols-2">
                  {item.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TourPlan;
