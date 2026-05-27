import { useState } from "react";
import { TALLES, Toast } from "../constants/constants";
import { FiShare2 } from "react-icons/fi";

const ProductDetailView = ({ product, onAddToCart, onOpenSizeGuide }) => {
  const coloresArray = Array.isArray(product.colores) ? product.colores : [];
  const hasColors = coloresArray.length > 0;
  
  const [selectedColor, setSelectedColor] = useState(hasColors ? coloresArray[0] : "Único");
  const [selectedSize, setSelectedSize] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);

  const renderDescription = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-black">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const colorImages = product.fotosPorColor?.[selectedColor] || [];
  const allPhotos = Object.values(product.fotosPorColor || {}).flat().filter(img => img);
  const images = colorImages.length > 0 
    ? colorImages 
    : (allPhotos.length > 0 ? [allPhotos[0]] : []);

  const isFlatStock = product.stock && typeof product.stock[TALLES[0]] === 'number';
  const currentStock = isFlatStock ? (product.stock || {}) : (product.stock?.[selectedColor] || {});
  const currentDescription = product.descripcionesPorColor?.[selectedColor] || product.descripcion;
  const canAdd = selectedSize && images.length > 0;

  const nextImg = (e) => {
    e?.stopPropagation();
    if (images.length === 0) return;
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImg = (e) => {
    e?.stopPropagation();
    if (images.length === 0) return;
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      talle: selectedSize,
      color: selectedColor,
      img: images[0],
    });
    setSelectedSize(null);
    Toast.fire({ icon: "success", title: "Agregado al carrito" });
  };

  const handleColorChange = (c) => {
    setSelectedColor(c);
    setSelectedSize(null);
    setImgIndex(0);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.nombre,
      text: `Mira esto en Miuccha: ${product.nombre}`,
      url: `${window.location.origin}/producto/${product.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        Toast.fire({ icon: "success", title: "Enlace copiado al portapapeles" });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="bg-white w-full max-h-full md:max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative flex flex-col md:flex-row">
      {/* Modal Image Section */}
      <div className="w-full md:w-3/5 bg-gray-50 relative aspect-[3/4] md:aspect-auto">
        {images.length > 0 ? (
          <img
            src={images[imgIndex]}
            alt={product.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 p-20">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sin imágenes</span>
          </div>
        )}
        
        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 flex items-center justify-center rounded-full shadow hover:bg-white text-black font-bold transition-all"
            >
              ❮
            </button>
            <button
              onClick={nextImg}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 flex items-center justify-center rounded-full shadow hover:bg-white text-black font-bold transition-all"
            >
              ❯
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full ${idx === imgIndex ? 'bg-black' : 'bg-black/20'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Info Section */}
      <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col text-left relative">
        <button 
          onClick={handleShare}
          className="absolute top-8 right-8 text-black hover:scale-110 transition-transform p-2 bg-gray-100 rounded-full"
          title="Compartir"
        >
          <FiShare2 size={18} />
        </button>

        <h4 className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-2 font-sans font-bold">
          {product.categoria}
        </h4>
        <h3 className="font-sans text-xl md:text-2xl mb-4 text-gray-900 uppercase tracking-[0.1em] font-bold pr-10">
          {product.nombre}
        </h3>
        <div className="bg-black text-white text-[9px] py-2 px-4 inline-block mb-4 font-bold tracking-widest uppercase self-start">
          SOLO TRANSFERENCIA/DEPOSITO
        </div>
        <p className="font-bold text-2xl text-gray-800 mb-6 tracking-tighter font-sans">
          ${product.precio?.toLocaleString()}
        </p>

        {currentDescription && (
          <div className="mb-8 border-t pt-6">
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Descripción</h5>
            <p className="text-xs leading-relaxed text-gray-600 font-sans whitespace-pre-wrap">
              {renderDescription(currentDescription)}
            </p>
          </div>
        )}

        {hasColors && (
          <div className="mb-8">
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Color Seleccionado: {selectedColor}</h5>
            <div className="flex flex-wrap gap-2">
              {coloresArray.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all font-bold ${selectedColor === c ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-black"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Seleccionar Talle</h5>
            <button
              onClick={onOpenSizeGuide}
              className="text-[9px] uppercase tracking-widest text-black border-b border-black font-bold"
            >
              Guía de Talles
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TALLES.map((talle) => {
              const cant = currentStock[talle] || 0;
              return (
                <button
                  key={talle}
                  disabled={cant <= 0}
                  onClick={() => setSelectedSize(talle)}
                  className={`w-10 h-10 text-[11px] border flex items-center justify-center transition-all ${cant <= 0 ? "opacity-20 cursor-not-allowed bg-gray-50 line-through" : "hover:border-black font-bold"} ${selectedSize === talle ? "bg-black text-white border-black" : "bg-white text-black border-gray-200"}`}
                >
                  {talle}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t">
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={`w-full py-4 text-[11px] uppercase tracking-[0.2em] font-bold transition-all font-sans ${canAdd ? "bg-black text-white hover:bg-gray-800 shadow-xl" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {canAdd
              ? "Agregar al carrito"
              : "Seleccionar talle"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
