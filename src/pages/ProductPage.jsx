import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import ProductDetailView from "../components/ProductDetailView";
import { FiArrowLeft } from "react-icons/fi";

const ProductPage = ({ onAddToCart, onOpenSizeGuide }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "productos", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError(true);
        }
      } catch (e) {
        console.error("Error fetching product:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-gray-400 italic font-serif">Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest">Producto no encontrado</h2>
        <p className="text-gray-500 mb-8">Lo sentimos, el producto que buscas no existe o ha sido eliminado.</p>
        <Link 
          to="/catalogo" 
          className="bg-black text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
        >
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <Link 
        to="/catalogo" 
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black mb-8 transition-colors group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Volver al Catálogo
      </Link>
      
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ProductDetailView 
          product={product} 
          onAddToCart={onAddToCart} 
          onOpenSizeGuide={onOpenSizeGuide} 
        />
      </div>

      {/* Related Section (Optional/Future) */}
      <section className="mt-20 pt-20 border-t">
        <h3 className="font-serif text-3xl mb-12 italic text-center text-gray-900">También te puede interesar</h3>
        {/* We could add a few related products here if we want */}
        <div className="text-center">
          <Link 
            to="/catalogo" 
            className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1"
          >
            Ver toda la colección
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
