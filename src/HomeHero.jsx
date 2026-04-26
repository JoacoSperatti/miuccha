import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

// Importar estilos de Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HomeHero = () => {
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      title: "COLECCIÓN BOTAS",
      subtitle: "100% Cuero Argentino",
      img: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      link: "/catalogo?cat=BOTAS"
    },
    {
      id: 2,
      title: "TEXANAS STYLE",
      subtitle: "Diseño Artesanal",
      img: "https://images.pexels.com/photos/1103928/pexels-photo-1103928.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      link: "/catalogo?cat=TEXANAS"
    },
    {
      id: 3,
      title: "BORCEGOS",
      subtitle: "Confort y Durabilidad",
      img: "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      link: "/catalogo?cat=BORCEGOS"
    }
  ];

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <img 
                src={slide.img} 
                alt={slide.title} 
                className="w-full h-full object-cover"
              />
              {/* Overlay oscuro para que el texto resalte */}
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center p-4">
                <h2 className="font-serif text-4xl md:text-7xl mb-4 tracking-widest">{slide.title}</h2>
                <p className="font-sans text-sm md:text-lg uppercase tracking-[0.3em] mb-8">{slide.subtitle}</p>
                <button 
                  onClick={() => navigate(slide.link)}
                  className="px-10 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-leather hover:text-white transition-all duration-300 shadow-xl"
                >
                  Ver Selección
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HomeHero;