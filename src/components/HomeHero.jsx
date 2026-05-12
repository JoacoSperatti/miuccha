import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const HomeHero = () => {
  const slides = [
    { id: 1, title: "COLECCIÓN 2026", img: "/banner1.jpg" },
    { id: 2, title: "100% CUERO", img: "/banner2.jpg" },
    { id: 3, title: "DIRECTO DE FABRICA", img: "/banner3.jpg" },
    { id: 4, title: "ENVÍOS A TODO EL PAÍS", img: "/banner4.jpg" },
    { id: 5, title: "NUEVA TEMPORADA", img: "/banner5.jpg" },
    { id: 6, title: "HECHO A MANO", img: "/banner6.jpg" },
    { id: 7, title: "CALIDAD PREMIUM", img: "/banner7.jpg" },
    { id: 8, title: "MIUCCHA STYLE", img: "/banner8.jpg" },
    { id: 9, title: "CONOCÉ MÁS", img: "/banner9.jpg" },
  ];

  return (
    <section className="relative w-full py-12 md:py-20 bg-stone-50 overflow-hidden z-0">
      <div className="px-4 md:px-12">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={true}
          loop={true}
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{
            640: {
              slidesPerView: 2.2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3.5,
              spaceBetween: 30,
            },
            1280: {
              slidesPerView: 4.2,
              spaceBetween: 30,
            },
          }}
          className="w-full pb-14"
        >
          {slides.map((s) => (
            <SwiperSlide key={s.id}>
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-xl group cursor-pointer transition-all duration-500 hover:shadow-2xl">
                <img
                  src={s.img}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  alt={s.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-2 italic uppercase tracking-wider leading-tight text-yellow-100">
                    {s.title}
                  </h2>
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-medium font-sans text-yellow-100/80">
                    Miuccha • {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* Custom Styles for Swiper Navigation */}
      <style dangerouslySetInnerHTML={{ __html: `
        .swiper-button-next, .swiper-button-prev {
          color: #000;
          background: rgba(255, 255, 255, 0.8);
          width: 45px;
          height: 45px;
          border-radius: 50%;
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: #fff;
          transform: scale(1.1);
        }
        .swiper-pagination-bullet-active {
          background: #000 !important;
        }
      `}} />
    </section>
  );
};

export default HomeHero;
