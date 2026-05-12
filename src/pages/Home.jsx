import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import HomeHero from "../components/HomeHero";
import CategoryGrid from "../components/CategoryGrid";
import ProductCard from "../components/ProductCard";

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
      <div className="relative z-[10]">
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

export default Home;
