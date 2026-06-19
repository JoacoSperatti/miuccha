/* global __COMING_SOON__ */
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "./firebase/config";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import SizeGuide from "./components/SizeGuide";
import ScrollToTop from "./components/ScrollToTop";
import ComingSoon from "./components/ComingSoon";

// Pages
import Home from "./pages/Home";
import CatalogPage from "./pages/Catalog";
import AdminPanel from "./pages/Admin";
import PolicyPage from "./pages/Policies";
import ProductPage from "./pages/ProductPage";

export default function App() {
  const isComingSoon = typeof __COMING_SOON__ !== "undefined" && __COMING_SOON__;

  if (isComingSoon) {
    return <ComingSoon />;
  }

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);


  useEffect(() => {
    const trackVisit = async () => {
      try {
        const hasVisited = sessionStorage.getItem("miuccha_visited");
        if (!hasVisited) {
          sessionStorage.setItem("miuccha_visited", "true");
          await setDoc(
            doc(db, "analytics", "general"),
            { visitCount: increment(1) },
            { merge: true }
          );
        }
      } catch (error) {
        console.error("Error tracking visit:", error);
      }
    };
    trackVisit();
  }, []);

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
