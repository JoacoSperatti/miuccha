import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  FaInstagram,
  FaWhatsapp,
  FaShoppingBag,
  FaBars,
  FaTimes,
} from "react-icons/fa";

// Firebase
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
  increment,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase/config";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// --- COMPONENTES ---

const CartDrawer = ({ isOpen, onClose, cart, setCart }) => {
  const total = cart.reduce((acc, item) => acc + item.precio, 0);

  const finalizarCompra = async () => {
    if (cart.length === 0) return;
    try {
      // 1. Obtener/Incrementar el número de orden en la colección metadata/orders
      const metaRef = doc(db, "metadata", "orders");
      await updateDoc(metaRef, { count: increment(1) });

      // Recuperamos el documento actualizado para obtener el número de orden
      const metaSnap = await getDoc(metaRef);

      if (!metaSnap.exists()) {
        throw new Error("El documento de metadata no existe en Firestore");
      }

      const orderNumber = metaSnap.data().count;

      // 2. Descontar stock por talle para cada producto en el carrito
      for (const item of cart) {
        const productoRef = doc(db, "productos", item.id);
        await updateDoc(productoRef, {
          [`stock.${item.talle}`]: increment(-1),
        });
      }

      // 3. Armar el texto de los productos
      const productosTxt = cart
        .map((item) => `- ${item.nombre} (Talle: ${item.talle})`)
        .join("\n");

      // 4. Configurar datos de transferencia
      const datosPago =
        "ALIAS: pagos.miuccha\nCBU: 0000003100012345678901\nTitular: ELIAS";

      // 5. Crear el mensaje final
      const mensajeCuerpo = `Hola Miuccha! 👋 *ORDEN DE COMPRA #${orderNumber}*\n\nQuiero realizar el siguiente pedido:\n\n${productosTxt}\n\n*Total: $${total.toLocaleString()}*\n\n📌 *DATOS PARA TRANSFERENCIA:*\n${datosPago}\n\n(Envío el comprobante por acá ni bien realice el pago)`;

      // 6. Codificar para URL y definir destino
      const mensajeCodificado = encodeURIComponent(mensajeCuerpo);
      const whatsappUrl = `https://wa.me/5491131608396?text=${mensajeCodificado}`;

      // 7. Limpiar estado y redirigir (window.location es más compatible con móviles que window.open)
      setCart([]);
      onClose();
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      alert(
        "Hubo un problema al generar tu pedido. Por favor, intenta de nuevo o contactanos por Instagram.",
      );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[200] ${isOpen ? "visible" : "invisible"}`}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full bg-white w-full max-w-md shadow-2xl transition-transform duration-500 transform ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-serif text-2xl italic tracking-widest text-gray-900">
            Tu Carrito
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:rotate-90 transition-transform"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6 space-y-6 font-sans">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 mt-20 text-[10px] uppercase tracking-widest font-bold">
              Carrito vacío
            </p>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 border-b border-gray-50 pb-6"
              >
                <img
                  src={item.img}
                  className="w-20 h-28 object-cover bg-gray-100 shadow-sm"
                  alt={item.nombre}
                />
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-serif text-lg leading-tight text-gray-900">
                      {item.nombre}
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">
                      Talle: {item.talle}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="font-bold text-sm text-gray-800">
                      ${item.precio.toLocaleString()}
                    </p>
                    <button
                      onClick={() =>
                        setCart(cart.filter((_, i) => i !== index))
                      }
                      className="text-[9px] uppercase border-b border-black font-bold text-red-500 border-red-500"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-8 bg-gray-50 space-y-4 border-t-2 border-white">
            <div className="bg-amber-50 border border-amber-200 p-4">
              <p className="text-[9px] font-bold text-amber-800 uppercase tracking-widest mb-1 font-sans">
                📌 Pago por Transferencia: pagos.miuccha
              </p>
              <p className="text-[10px] text-amber-900 font-sans">
                A nombre de <b>ELIAS</b>. Envianos el comprobante por WhatsApp
                para despachar.
              </p>
            </div>
            <div className="flex justify-between items-center mb-4 font-sans">
              <span className="uppercase text-[10px] tracking-[0.3em] font-bold text-gray-500">
                Total
              </span>
              <span className="text-2xl font-serif text-gray-900">
                ${total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={finalizarCompra}
              className="w-full py-5 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gray-800 flex items-center justify-center gap-2 transition-all"
            >
              <FaWhatsapp size={16} /> Enviar pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAddToCart, onOpenSizeGuide }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const stockEntries = product.stock
    ? Object.entries(product.stock).sort()
    : [];

  return (
    <div className="group flex flex-col items-center text-center p-4">
      <div className="relative overflow-hidden w-full aspect-[3/4] mb-4 bg-gray-100 shadow-sm">
        <img
          src={product.img}
          alt={product.nombre}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
        />
      </div>
      <h4 className="text-[9px] text-gray-400 uppercase tracking-widest mb-1 font-sans font-bold">
        {product.categoria}
      </h4>
      <h3 className="font-serif text-lg mb-2 text-gray-900">
        {product.nombre}
      </h3>
      <p className="font-bold text-gray-800 mb-4 tracking-tighter font-sans">
        ${product.precio?.toLocaleString()}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-4 font-sans">
        {stockEntries.map(([talle, cant]) => (
          <button
            key={talle}
            disabled={cant <= 0}
            onClick={() => setSelectedSize(talle)}
            className={`w-8 h-8 text-[9px] border flex items-center justify-center transition-all 
              ${cant <= 0 ? "opacity-20 cursor-not-allowed bg-gray-50 line-through" : "hover:border-black font-bold"}
              ${selectedSize === talle ? "bg-black text-white border-black" : "bg-white text-black border-gray-200"}`}
          >
            {talle}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          onAddToCart({ ...product, talle: selectedSize });
          setSelectedSize(null);
        }}
        disabled={!selectedSize}
        className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold transition-all font-sans ${selectedSize ? "bg-black text-white hover:bg-gray-800 shadow-lg" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
      >
        {selectedSize ? "Agregar al carrito" : "Seleccionar talle"}
      </button>
    </div>
  );
};

const Header = ({ cartCount, onCartClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 w-full z-50">
      <div className="bg-black text-white text-[9px] text-center py-2 uppercase tracking-[0.2em] px-2 font-bold font-sans">
        Envío gratis | Solo transferencia y depósito | 100% Cuero
      </div>
      <nav
        className={`bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 flex justify-between items-center transition-all duration-500 ${isScrolled ? "py-2" : "py-6"}`}
      >
        <div className="w-1/3 flex items-center gap-6 font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
          <Link to="/" className="hover:text-black hidden md:block transition">
            Inicio
          </Link>
          <Link
            to="/catalogo"
            className="hover:text-black hidden md:block transition"
          >
            Catálogo
          </Link>

          {/* BOTÓN HAMBURGUESA REAL */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-black p-2"
          >
            <FaBars size={20} />
          </button>
        </div>

        <div className="w-1/3 text-center">
          <Link to="/">
            <h1
              className={`font-serif tracking-[0.2em] text-gray-900 italic transition-all duration-500 ${isScrolled ? "text-xl" : "text-3xl"}`}
            >
              MIUCCHA
            </h1>
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

      {/* PANEL DEL MENÚ MÓVIL */}
      <div
        className={`fixed inset-0 bg-white z-[100] transition-transform duration-500 flex flex-col p-10 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="self-end p-2 mb-10"
        >
          <FaTimes size={25} />
        </button>
        <div className="flex flex-col gap-8 text-center font-serif text-3xl italic">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            Inicio
          </Link>
          <Link to="/catalogo" onClick={() => setIsMenuOpen(false)}>
            Catálogo
          </Link>
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
        </div>
      </div>
    </div>
  );
};

const CategoryGrid = () => {
  const navigate = useNavigate();
  const categories = [
    {
      id: 1,
      name: "TEXANAS",
      img: "/texanas.jpg",
      link: "/catalogo?cat=TEXANAS",
    },
    {
      id: 2,
      name: "BOTAS",
      img: "/botas.jpg",
      link: "/catalogo?cat=BOTAS",
    },
    {
      id: 3,
      name: "BORCEGOS",
      img: "/borcegos.jpg",
      link: "/catalogo?cat=BORCEGOS",
    },
  ];
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 w-full shadow-2xl border-t-2 border-white">
      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => navigate(cat.link)}
          className="group relative flex items-center justify-between p-10 cursor-pointer border-2 border-white bg-[#F3ECE7] h-[250px] md:h-[300px] overflow-hidden transition-all"
        >
          <img
            src={cat.img}
            className="w-1/2 h-full object-contain transition-transform duration-500 group-hover:-translate-x-3 z-10"
            alt={cat.name}
          />
          <h3 className="font-serif text-4xl md:text-6xl text-[#D3A3B0] uppercase z-10 tracking-tighter italic">
            {cat.name}
          </h3>
        </div>
      ))}
      <div
        onClick={() => {
          navigate("/catalogo");
          window.scrollTo(0, 0);
        }}
        className="flex flex-col items-center justify-center p-10 bg-[#C37D8D] border-2 border-white h-[250px] md:h-[300px] text-center font-serif italic cursor-pointer hover:opacity-90 transition-opacity"
      >
        <h4 className="text-4xl md:text-6xl text-[#E3F285] uppercase tracking-tighter">
          MUCHO MÁS
        </h4>
      </div>
    </section>
  );
};

// Agregá Pagination y Navigation si no los tenías activos

const HomeHero = () => {
  const slides = [
    {
      id: 1,
      title: "COLECCIÓN 2026",
      img: "/banner1.jpg",
    },
    {
      id: 2,
      title: "100% CUERO",
      img: "/banner2.jpg",
    },
  ];

  return (
    <section className="relative w-full h-[75vh] md:h-[80vh] overflow-hidden z-0">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        navigation={true} // Flechas para desktop
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

// --- VIEWS ---

const Home = ({ onAddToCart, onOpenSizeGuide }) => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, "productos"),
          where("destacado", "==", true),
        );
        const snap = await getDocs(q);
        setFeatured(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="pt-24 md:pt-32">
      <HomeHero />
      <div className="relative z-[10] -mt-10 md:-mt-24">
        <CategoryGrid />
      </div>
      <section className="py-24 px-6 max-w-7xl mx-auto text-center font-sans">
        <h3 className="font-serif text-4xl mb-2 italic text-gray-900">
          Nuestros Destacados
        </h3>
        <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mb-16 font-bold">
          Favoritos de la temporada
        </p>
        {loading ? (
          <p className="font-serif italic text-gray-400">
            Cargando colección...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onOpenSizeGuide={onOpenSizeGuide}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const CatalogPage = ({ onAddToCart, onOpenSizeGuide }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("cat");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const ref = collection(db, "productos");
        const q = categoryFilter
          ? query(ref, where("categoria", "==", categoryFilter))
          : ref;
        const snap = await getDocs(q);
        setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilter]);

  const cats = ["TODO", "TEXANAS", "BOTAS", "BORCEGOS"];

  return (
    <div className="pt-40 min-h-screen max-w-7xl mx-auto px-6 font-sans">
      <h2 className="font-serif text-4xl text-center italic mb-12 uppercase tracking-widest">
        Catálogo
      </h2>
      <div className="flex flex-wrap justify-center gap-4 mb-20">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setSearchParams(c === "TODO" ? {} : { cat: c })}
            className={`px-8 py-2 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all ${(c === "TODO" && !categoryFilter) || categoryFilter === c ? "bg-black text-white shadow-lg" : "bg-white text-black border-gray-200 hover:border-black"}`}
          >
            {c}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-center italic font-serif text-gray-400">
          Actualizando productos...
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onOpenSizeGuide={onOpenSizeGuide}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE ADMIN PANEL ---

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProd, setNewProd] = useState({
    nombre: "",
    precio: "",
    categoria: "BOTAS",
    destacado: false,
    img: "",
    stock: { 35: 0, 36: 0, 37: 0, 38: 0, 39: 0, 40: 0 },
  });

  useEffect(() => {
    const pass = prompt("Acceso restringido Miuccha. Ingrese contraseña:");
    if (pass === "miuccha2026") {
      setAuthorized(true);
      fetchProducts();
    } else {
      alert("Contraseña incorrecta");
      window.location.href = "/";
    }
  }, []);

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "productos"));
    setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "productos"), {
        ...newProd,
        precio: parseInt(newProd.precio),
      });
      alert("¡Producto creado!");
      setNewProd({
        nombre: "",
        precio: "",
        categoria: "BOTAS",
        destacado: false,
        img: "",
        stock: { 35: 0, 36: 0, 37: 0, 38: 0, 39: 0, 40: 0 },
      });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const updateField = async (id, field, value) => {
    try {
      const val = field === "precio" ? parseInt(value) : value;
      await updateDoc(doc(db, "productos", id), { [field]: val });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const updateStock = async (id, talle, nuevoValor) => {
    try {
      await updateDoc(doc(db, "productos", id), {
        [`stock.${talle}`]: parseInt(nuevoValor),
      });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("¿Seguro querés borrar este producto?")) {
      await deleteDoc(doc(db, "productos", id));
      fetchProducts();
    }
  };

  if (!authorized || loading)
    return (
      <div className="pt-40 text-center font-serif italic text-gray-400">
        Verificando...
      </div>
    );

  return (
    <div className="pt-40 px-6 max-w-6xl mx-auto mb-20 font-sans">
      <h2 className="font-serif text-3xl mb-8 border-b pb-4 italic tracking-widest uppercase italic">
        Panel Miuccha
      </h2>

      <form
        onSubmit={handleCreate}
        className="bg-gray-50 p-8 rounded-lg mb-16 border grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <h3 className="col-span-full font-serif text-xl mb-2">Nuevo Modelo</h3>
        <input
          type="text"
          placeholder="Nombre"
          className="p-3 border text-sm"
          value={newProd.nombre}
          onChange={(e) => setNewProd({ ...newProd, nombre: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Precio"
          className="p-3 border text-sm"
          value={newProd.precio}
          onChange={(e) => setNewProd({ ...newProd, precio: e.target.value })}
          required
        />
        <select
          className="p-3 border text-sm"
          value={newProd.categoria}
          onChange={(e) =>
            setNewProd({ ...newProd, categoria: e.target.value })
          }
        >
          <option value="TEXANAS">TEXANAS</option>
          <option value="BOTAS">BOTAS</option>
          <option value="BORCEGOS">BORCEGOS</option>
        </select>
        <input
          type="text"
          placeholder="URL Imagen"
          className="p-3 border text-sm md:col-span-2"
          value={newProd.img}
          onChange={(e) => setNewProd({ ...newProd, img: e.target.value })}
          required
        />
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <input
            type="checkbox"
            checked={newProd.destacado}
            onChange={(e) =>
              setNewProd({ ...newProd, destacado: e.target.checked })
            }
          />{" "}
          Home
        </label>
        <div className="col-span-full grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
          {Object.keys(newProd.stock).map((talle) => (
            <div key={talle} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 text-center">
                T.{talle}
              </span>
              <input
                type="number"
                className="p-2 border text-center text-xs"
                value={newProd.stock[talle]}
                onChange={(e) =>
                  setNewProd({
                    ...newProd,
                    stock: { ...newProd.stock, [talle]: e.target.value },
                  })
                }
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="col-span-full bg-black text-white py-4 uppercase text-[10px] tracking-widest font-bold"
        >
          Guardar
        </button>
      </form>

      <div className="space-y-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-6 border bg-white shadow-sm flex flex-col md:flex-row gap-6 relative"
          >
            <button
              onClick={() => deleteProduct(p.id)}
              className="absolute top-4 right-4 text-red-500 font-bold p-2"
            >
              <FaTimes size={14} />
            </button>
            <img src={p.img} className="w-32 h-40 object-cover" alt="" />
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <input
                  type="text"
                  defaultValue={p.nombre}
                  onBlur={(e) => updateField(p.id, "nombre", e.target.value)}
                  className="w-full font-bold border-b outline-none"
                />
                <div className="flex gap-4">
                  <input
                    type="number"
                    defaultValue={p.precio}
                    onBlur={(e) => updateField(p.id, "precio", e.target.value)}
                    className="w-24 border-b outline-none text-sm font-bold"
                  />
                  <label className="text-[10px] flex items-center gap-1 font-bold uppercase">
                    <input
                      type="checkbox"
                      defaultChecked={p.destacado}
                      onChange={(e) =>
                        updateField(p.id, "destacado", e.target.checked)
                      }
                    />{" "}
                    Home
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 h-fit self-end">
                {Object.entries(p.stock || {}).map(([talle, cant]) => (
                  <div
                    key={talle}
                    className="flex flex-col items-center border p-2 bg-gray-50 rounded"
                  >
                    <span className="text-[9px] font-bold text-gray-400">
                      T.{talle}
                    </span>
                    <input
                      type="number"
                      defaultValue={cant}
                      onBlur={(e) => updateStock(p.id, talle, e.target.value)}
                      className="w-8 text-center text-xs font-bold bg-transparent outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SizeGuide = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-lg p-8 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="font-serif text-2xl italic mb-6 border-b pb-2">
          Guía de Talles
        </h2>
        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-6 font-sans">
          Medidas aproximadas de la plantilla interna
        </p>

        <table className="w-full text-left font-sans border-collapse">
          <thead>
            <tr className="border-b text-[10px] uppercase tracking-widest text-gray-400">
              <th className="py-3">Talle</th>
              <th className="py-3 text-right">Centímetros</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { t: "35", cm: "22.5" },
              { t: "36", cm: "23.2" },
              { t: "37", cm: "24.0" },
              { t: "38", cm: "24.6" },
              { t: "39", cm: "25.3" },
              { t: "40", cm: "26.0" },
              { t: "41", cm: "26.7" },
              { t: "42", cm: "27.3" },
              { t: "43", cm: "28.0" },
            ].map((row) => (
              <tr
                key={row.t}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 font-bold">Talle {row.t}</td>
                <td className="py-3 text-right font-mono">{row.cm} cm</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 bg-gray-50 p-4 text-[11px] leading-relaxed text-gray-600">
          <p className="font-bold mb-2 uppercase tracking-tighter text-black">
            ¿Cómo medir tu pie?
          </p>
          <p>
            Apoyá el pie sobre una hoja de papel, marcá el talón y el dedo más
            largo. Medí la distancia y sumale 0.5 cm para mayor comodidad.
          </p>
        </div>
      </div>
    </div>
  );
};

const PolicyPage = () => (
  <div className="pt-44 pb-24 px-6 max-w-3xl mx-auto font-sans leading-relaxed">
    <h2 className="font-serif text-4xl italic mb-10 text-center">
      Cambios y Devoluciones
    </h2>
    <div className="space-y-8 text-gray-700 text-sm">
      <section>
        <h3 className="font-bold uppercase tracking-widest text-black mb-2">
          Plazos
        </h3>
        <p>
          Los cambios se pueden realizar dentro de los 30 días corridos
          posteriores a la compra.
        </p>
      </section>
      <section>
        <h3 className="font-bold uppercase tracking-widest text-black mb-2">
          Condiciones
        </h3>
        <p>
          El producto debe estar sin uso, en su caja original y en las mismas
          condiciones en que fue recibido. No se aceptarán cambios de productos
          que presenten marcas de uso en la suela o cuero.
        </p>
      </section>
      <section>
        <h3 className="font-bold uppercase tracking-widest text-black mb-2">
          Logística
        </h3>
        <p>
          Los costos de envío por cambios corren por cuenta del cliente, a
          excepción de fallas de fabricación. En caso de falla, MIUCCHA se hace
          cargo del retiro y reenvío.
        </p>
      </section>
      <section>
        <h3 className="font-bold uppercase tracking-widest text-black mb-2">
          Procedimiento
        </h3>
        <p>
          Escribinos a nuestro WhatsApp indicando tu <b>Nro de Orden (#)</b> y
          el motivo del cambio. Te responderemos a la brevedad con los pasos a
          seguir.
        </p>
      </section>
    </div>
  </div>
);

// En el Routes de App.jsx:
// <Route path="/cambios" element={<PolicyPage />} />

// --- APP PRINCIPAL ---

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false); // Estado para el modal

  const addToCart = (p) => {
    setCart([...cart, p]);
    setIsCartOpen(true);
  };

  return (
    <Router>
      <div className="bg-white min-h-screen text-gray-900 flex flex-col selection:bg-black selection:text-white">
        <Header
          cartCount={cart.length}
          onCartClick={() => setIsCartOpen(true)}
        />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          setCart={setCart}
        />

        {/* AGREGAMOS EL MODAL AQUÍ */}
        <SizeGuide
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
        />

        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  onAddToCart={addToCart}
                  onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                />
              }
            />
            <Route
              path="/catalogo"
              element={
                <CatalogPage
                  onAddToCart={addToCart}
                  onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                />
              }
            />
            <Route path="/gestion-interna" element={<AdminPanel />} />
            {/* RUTA PARA CAMBIOS */}
            <Route path="/cambios" element={<PolicyPage />} />
          </Routes>
        </main>

        <footer className="bg-gray-50 py-20 px-6 border-t text-center space-y-8 font-sans">
          <h4 className="font-serif text-3xl italic tracking-widest italic">
            MIUCCHA
          </h4>

          {/* BOTONES DE POLÍTICAS Y TALLES */}
          <div className="flex flex-col gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
            <button
              onClick={() => setIsSizeGuideOpen(true)}
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
        </footer>

        <a
          href="https://wa.me/5491165283561"
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-[150] flex items-center justify-center"
        >
          <FaWhatsapp size={24} />
        </a>
      </div>
    </Router>
  );
}
