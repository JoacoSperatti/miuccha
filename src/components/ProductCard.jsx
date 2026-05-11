import { useState } from "react";
import { Toast, TALLES } from "../constants/constants";

const ProductCard = ({ product, onAddToCart, onOpenSizeGuide }) => {
  const coloresArray = Array.isArray(product.colores) ? product.colores : [];
  const hasColors = coloresArray.length > 0;
  
  const [selectedColor, setSelectedColor] = useState(hasColors ? coloresArray[0] : "Único");
  const [selectedSize, setSelectedSize] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);

  const images =
    product.galeria && product.galeria.length > 0
      ? [product.img, ...product.galeria]
      : [product.img];

  const isFlatStock = product.stock && typeof product.stock[TALLES[0]] === 'number';
  const currentStock = isFlatStock ? (product.stock || {}) : (product.stock?.[selectedColor] || {});

  const canAdd = selectedSize;

  const nextImg = (e) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      talle: selectedSize,
      color: selectedColor,
    });
    setSelectedSize(null);
    Toast.fire({ icon: "success", title: "Agregado al carrito" });
  };

  const handleColorChange = (c) => {
    setSelectedColor(c);
    setSelectedSize(null);
  };

  return (
    <div className="group flex flex-col items-center text-center p-4">
      <div className="relative overflow-hidden w-full aspect-[3/4] mb-4 bg-gray-100 shadow-sm group">
        <img
          src={images[imgIndex]}
          alt={product.nombre}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
        />
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              onClick={prevImg}
              className="bg-white/80 w-8 h-8 flex items-center justify-center rounded-full shadow hover:bg-white text-black font-bold"
            >
              ❮
            </button>
            <button
              onClick={nextImg}
              className="bg-white/80 w-8 h-8 flex items-center justify-center rounded-full shadow hover:bg-white text-black font-bold"
            >
              ❯
            </button>
          </div>
        )}
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

      {hasColors && (
        <div className="flex flex-wrap justify-center gap-1 mb-3 font-sans">
          {coloresArray.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`px-3 py-1 text-[9px] uppercase tracking-widest border transition-all ${selectedColor === c ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-black"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onOpenSizeGuide}
        className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 border-b border-transparent hover:border-gray-400 transition-all font-sans font-bold"
      >
        Ver Guía de Talles
      </button>

      <div className="flex flex-wrap justify-center gap-2 mb-4 font-sans">
        {TALLES.map((talle) => {
          const cant = currentStock[talle] || 0;
          return (
            <button
              key={talle}
              disabled={cant <= 0}
              onClick={() => setSelectedSize(talle)}
              className={`w-8 h-8 text-[9px] border flex items-center justify-center transition-all ${cant <= 0 ? "opacity-20 cursor-not-allowed bg-gray-50 line-through" : "hover:border-black font-bold"} ${selectedSize === talle ? "bg-black text-white border-black" : "bg-white text-black border-gray-200"}`}
            >
              {talle}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!canAdd}
        className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold transition-all font-sans ${canAdd ? "bg-black text-white hover:bg-gray-800 shadow-lg" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
      >
        {canAdd
          ? "Agregar al carrito"
          : "Seleccionar talle"}
      </button>
    </div>
  );
};

export default ProductCard;
