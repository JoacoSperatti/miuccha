import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import SizeGuide from "./components/SizeGuide";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import Home from "./pages/Home";
import CatalogPage from "./pages/Catalog";
import AdminPanel from "./pages/Admin";
import PolicyPage from "./pages/Policies";
import ProductPage from "./pages/ProductPage";

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const addToCart = (p) => {
    setCart([...cart, p]);
    setIsCartOpen(true);
  };

  return (
    <Router>
      <ScrollToTop />
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
            <Route
              path="/producto/:id"
              element={
                <ProductPage
                  onAddToCart={addToCart}
                  onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                />
              }
            />
            <Route path="/gestion-interna" element={<AdminPanel />} />
            <Route path="/cambios" element={<PolicyPage />} />
          </Routes>
        </main>

        <Footer onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />

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
