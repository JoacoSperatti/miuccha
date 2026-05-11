import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const HomeHero = () => {
  const slides = [
    { id: 1, title: "COLECCIÓN 2026", img: "/banner1.jpg" },
    { id: 2, title: "100% CUERO", img: "/banner2.jpg" },
  ];
  return (
    <section className="relative w-full h-[75vh] md:h-[80vh] overflow-hidden z-0">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        navigation={true}
        loop={true}
        className="h-full w-full"
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            <div className="relative w-full h-full">
              <img
                src={s.img}
                className="w-full h-full object-cover"
                alt={s.title}
              />
              <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center text-white text-center p-4">
                <h2 className="font-serif text-5xl md:text-8xl mb-4 italic uppercase tracking-widest">
                  {s.title}
                </h2>
                <p className="text-[10px] uppercase tracking-[0.5em] font-bold font-sans">
                  Diseño Independiente
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HomeHero;
