import React, { useState } from 'react';

const ProductCard = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState(null);

  return (
    <div className="group flex flex-col items-center text-center p-4 transition-all">
      {/* Imagen con Badge de "Destacado" o "Nuevo" */}
      <div className="relative overflow-hidden w-full aspect-[3/4] mb-4 bg-gray-100 shadow-sm">
        <img 
          src={product.img} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-black text-white text-[9px] px-2 py-1 uppercase tracking-widest">
            Nuevo
          </span>
        )}
      </div>

      {/* Info del Producto */}
      <h4 className="font-sans text-xs uppercase tracking-widest text-gray-500 mb-1">{product.category}</h4>
      <h3 className="font-serif text-lg mb-2">{product.name}</h3>
      <p className="font-bold text-leather mb-4">${product.price.toLocaleString()}</p>

      {/* Selección de Talles (Estilo Micadel) */}
      <div className="flex gap-2 mb-4">
        {product.sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`w-8 h-8 text-[10px] border flex items-center justify-center transition-all ${
              selectedSize === size 
                ? "bg-black text-white border-black" 
                : "bg-white text-black border-gray-200 hover:border-black"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Botón Añadir */}
      <button 
        disabled={!selectedSize}
        className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${
          selectedSize 
            ? "bg-black text-white hover:bg-leather" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {selectedSize ? "Agregar al carrito" : "Seleccionar talle"}
      </button>
    </div>
  );
};

export default ProductCard;