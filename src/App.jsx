import React from "react";
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaEnvelope, 
  FaTruck, 
  FaShoppingBag, 
  FaBars 
} from 'react-icons/fa';

const Navbar = () => (
  <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
    {/* Izquierda: Marca */}
    <h1 className="font-serif text-2xl tracking-widest text-leather-dark italic">
      MIUCCHA
    </h1>

    {/* Centro: Links (Ocultos en móvil) */}
    <div className="hidden md:flex gap-8 font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
      <a href="#home" className="hover:text-leather transition">Inicio</a>
      <a href="#catalogo" className="hover:text-leather transition">Catálogo</a>
      <a href="#contacto" className="hover:text-leather transition">Contacto</a>
    </div>

    {/* Derecha: Iconos de acción */}
    <div className="flex gap-5 items-center">
      <div className="relative cursor-pointer group">
        <FaShoppingBag size={18} className="group-hover:text-leather transition" />
        <span className="absolute -top-2 -right-2 bg-leather text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
          0
        </span>
      </div>
      <div className="md:hidden cursor-pointer">
        <FaBars size={18} />
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <header id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
    <img
      src="https://images.pexels.com/photos/1103928/pexels-photo-1103928.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      className="absolute w-full h-full object-cover brightness-75"
      alt="Fondo Miuccha"
    />
    <div className="relative text-center text-white space-y-6 px-4">
      <h2 className="font-serif text-5xl md:text-7xl">Handmade Shoes</h2>
      <p className="font-sans text-lg tracking-[0.2em] uppercase">
        Calzado artesanal con alma
      </p>
      <a
        href="#catalogo"
        className="inline-block bg-white text-black px-8 py-3 uppercase text-xs tracking-widest hover:bg-leather hover:text-white transition-all font-bold"
      >
        Explorar Colección
      </a>
    </div>
  </header>
);

const Catalog = () => {
  const products = [
    {
      id: 1,
      name: "Bota Denver Brown",
      price: 85000,
      img: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      name: "Oxford Classic Black",
      price: 72000,
      img: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 3,
      name: "Mocasín Sienna",
      price: 68000,
      img: "https://images.ib2c.com.ar/repository/347/productsList/5241123.jpg?width=1500&height=1500&rmode=pad&rcolor=white&format=webp",
    },
    {
      id: 4,
      name: "Botín Urban Grey",
      price: 89000,
      img: "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  return (
    <section id="catalogo" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h3 className="font-serif text-4xl mb-2 text-leather-dark">Catálogo</h3>
          <p className="text-gray-500 font-sans italic">Selección temporada Otoño - Invierno</p>
        </div>
        <div className="flex gap-4 text-xs uppercase tracking-tighter font-bold">
          <button className="border-b-2 border-leather pb-1">Todos</button>
          <button className="text-gray-400 pb-1 hover:text-leather transition">Botas</button>
          <button className="text-gray-400 pb-1 hover:text-leather transition">Zapatos</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <div key={p.id} className="group cursor-pointer">
            <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-gray-100 shadow-sm">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-white text-black px-4 py-2 text-xs uppercase tracking-widest font-bold">
                  Ver detalles
                </button>
              </div>
            </div>
            <h4 className="font-sans text-sm uppercase tracking-wide font-bold">{p.name}</h4>
            <p className="text-leather font-bold mt-1">${p.price.toLocaleString()}</p>
            <p className="text-[10px] text-green-600 font-bold uppercase mt-1">
              Precio Mayorista Disponible
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer id="contacto" className="bg-gray-50 py-16 px-6 border-t border-gray-200">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
      {/* Marca */}
      <div className="space-y-4">
        <h4 className="font-serif text-2xl tracking-widest text-leather-dark italic">MIUCCHA</h4>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
          Calzado artesanal diseñado y producido en Argentina. Calidad premium en cada costura.
        </p>
      </div>

      {/* Info de contacto */}
      <div className="space-y-4">
        <h5 className="font-bold uppercase text-[10px] tracking-[0.2em] text-gray-400 font-sans">
          Contacto y Envíos
        </h5>
        <ul className="text-sm text-gray-600 space-y-3 font-sans">
          <li className="flex items-center gap-3">
            <FaWhatsapp size={16} className="text-leather" /> +54 9 11 XXXX-XXXX
          </li>
          <li className="flex items-center gap-3">
            <FaEnvelope size={16} className="text-leather" /> ventas@miuccha.com
          </li>
          <li className="flex items-center gap-3">
            <FaTruck size={16} className="text-leather" /> Envíos vía Correo Argentino
          </li>
        </ul>
      </div>

      {/* Redes Sociales */}
      <div className="space-y-4">
        <h5 className="font-bold uppercase text-[10px] tracking-[0.2em] text-gray-400 font-sans">
          Seguinos
        </h5>
        <div className="flex gap-4">
          <a href="#" className="p-3 bg-white border border-gray-200 rounded-full hover:text-leather hover:border-leather transition-all shadow-sm">
            <FaInstagram size={18} />
          </a>
          <a href="#" className="p-3 bg-white border border-gray-200 rounded-full hover:text-leather hover:border-leather transition-all shadow-sm">
            <FaWhatsapp size={18} />
          </a>
        </div>
      </div>
    </div>

    <div className="mt-16 pt-8 border-t border-gray-200 text-center">
      <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-sans">
        © 2026 Miuccha - Made with Passion 
      </p>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="bg-white min-h-screen text-gray-900">
      <Navbar />
      <Hero />
      <Catalog />
      <Footer />
    </div>
  );
}