import { Link } from "react-router-dom";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = ({ onOpenSizeGuide }) => {
  return (
    <footer
      id="informacion"
      className="bg-gray-50 py-20 px-6 border-t text-center space-y-8 font-sans"
    >
      <h4 className="font-serif text-3xl italic tracking-widest">
        MIUCCHA
      </h4>

      <div className="flex flex-col gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
        <button
          onClick={onOpenSizeGuide}
          className="hover:text-black transition-colors"
        >
          Guía de Talles
        </button>
        <Link to="/cambios" className="hover:text-black transition-colors">
          Cambios y Devoluciones
        </Link>
      </div>

      <div className="flex justify-center gap-8 text-gray-400">
        <a
          href="https://www.instagram.com/miucchazapatos/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-black transition-colors duration-300"
        >
          <FaInstagram size={24} />
        </a>

        <a
          href="https://wa.me/5491165283561"
          target="_blank"
          rel="noreferrer"
          className="hover:text-black transition-colors duration-300"
        >
          <FaWhatsapp size={24} />
        </a>
      </div>
      <p className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-bold font-sans">
        © 2026 MIUCCHA - Calzado de Autor
      </p>
      <p className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-bold font-sans mt-2">
        Desarrollado por{" "}
        <a
          href="https://portafolio-joaquinsperatti.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-black transition-colors duration-300 underline"
        >
          Joaquín Speratti
        </a>
      </p>
    </footer>
  );
};

export default Footer;
