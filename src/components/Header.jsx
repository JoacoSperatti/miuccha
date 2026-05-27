import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaShoppingBag } from "react-icons/fa";

const Header = ({ cartCount, onCartClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-0 w-full z-50">
      <div className="bg-black text-white text-[9px] py-2 uppercase tracking-[0.2em] font-bold font-sans overflow-hidden">
        <div className="animate-marquee-css">
          Envío gratis    |    Sólo transferencia y depósito    |    100% Cuero
        </div>
      </div>
      <nav
        className={`bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 flex justify-between items-center transition-all duration-500 ${isScrolled ? "py-2" : "py-6"}`}
      >
        <div className="w-1/3 flex items-center gap-6 font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
          <Link
            to="/catalogo"
            className="hover:text-black hidden md:block transition"
          >
            Catálogo
          </Link>
          <a
            href="#informacion"
            className="hover:text-black hidden md:block transition"
          >
            Información
          </a>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-black p-2"
          >
            <FaBars size={20} />
          </button>
        </div>
        <div className="w-1/3 text-center">
          <Link to="/" onClick={handleLogoClick}>
            <img
              src="/MIUCCHA.jpg"
              alt="MIUCCHA"
              className={`mx-auto transition-all duration-500 ${isScrolled ? "h-16" : "h-32"}`}
            />
          </Link>
        </div>
        <div className="w-1/3 flex justify-end font-sans">
          <div
            onClick={onCartClick}
            className="relative cursor-pointer group p-2"
          >
            <FaShoppingBag
              size={isScrolled ? 18 : 22}
              className="transition-all group-hover:scale-110"
            />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </nav>
      <div
        className={`fixed inset-0 bg-white z-[100] transition-transform duration-500 flex flex-col p-10 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="self-end p-2 mb-10"
        >
          <FaTimes size={25} />
        </button>
        <div className="flex flex-col gap-8 text-center font-sans text-2xl uppercase tracking-[0.2em] font-bold text-gray-900">
          <Link to="/catalogo" onClick={() => setIsMenuOpen(false)}>
            Catálogo
          </Link>
          <a href="#informacion" onClick={() => setIsMenuOpen(false)}>
            Información
          </a>
          <Link to="/catalogo?cat=TEXANAS" onClick={() => setIsMenuOpen(false)}>
            Texanas
          </Link>
          <Link to="/catalogo?cat=BOTAS" onClick={() => setIsMenuOpen(false)}>
            Botas
          </Link>
          <Link
            to="/catalogo?cat=BORCEGOS"
            onClick={() => setIsMenuOpen(false)}
          >
            Borcegos
          </Link>
          <Link to="/cambios" onClick={() => setIsMenuOpen(false)}>
            Devoluciones
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
