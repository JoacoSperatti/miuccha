import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import ProductCard from "../components/ProductCard";

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

  const cats = ["TODO", "TEXANAS", "BOTAS", "BORCEGOS", "DISCONTINUOS"];

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

export default CatalogPage;
