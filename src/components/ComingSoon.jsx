import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function ComingSoon() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center text-white overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105 animate-[subtle-zoom_20s_infinite_alternate]"
        style={{ 
          backgroundImage: "url('/banner1.jpg')",
        }}
      />
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-20 w-full py-8 px-6 flex justify-center items-center">
        <div className="bg-white/95 p-4 rounded shadow-2xl max-w-[200px] md:max-w-[240px] transition-transform hover:scale-105 duration-500">
          <img 
            src="/MIUCCHA.jpg" 
            alt="MIUCCHA" 
            className="w-full h-auto object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-grow flex flex-col justify-center items-center px-6 text-center max-w-2xl mx-auto space-y-8 my-auto">
        <div className="space-y-4">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-bold text-gray-300 block">
            Calzado de Autor 100% Cuero
          </span>
          <h1 className="font-serif text-5xl md:text-7xl italic font-normal tracking-wide text-white leading-tight">
            Próximamente
          </h1>
          <div className="w-24 h-[1px] bg-white/40 mx-auto my-6" />
          <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-lg font-light tracking-wide mx-auto">
            Estamos renovando nuestro catálogo y sitio web para traerte lo último en calzado artesanal. Muy pronto podrás ver y comprar toda nuestra nueva colección.
          </p>
        </div>

        {/* Call to Actions / Socials */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
          <a
            href="https://wa.me/5491165283561"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-none text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:bg-black hover:text-white hover:border-white border border-transparent shadow-lg hover:shadow-white/10"
          >
            <FaWhatsapp size={16} />
            Escribinos por WhatsApp
          </a>
          <a
            href="https://www.instagram.com/miucchazapatos/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 bg-transparent text-white border border-white/50 px-8 py-4 rounded-none text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:bg-white hover:text-black hover:border-transparent"
          >
            <FaInstagram size={16} />
            Seguinos en Instagram
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full py-8 px-6 text-center text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-gray-400 font-medium">
        <p>© 2026 MIUCCHA - Todos los derechos reservados</p>
      </footer>

      {/* Embedded subtle-zoom keyframes */}
      <style>{`
        @keyframes subtle-zoom {
          0% { transform: scale(1.02); }
          100% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}
