import { useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { FaTrash, FaArrowUp, FaArrowDown, FaStar, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import { Toast, TALLES } from "../constants/constants";
import ImageCropper from "../components/ImageCropper";
import ProductCard from "../components/ProductCard";

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("TODAS");
  const [authorized, setAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [showPreview, setShowPreview] = useState(null);
  
  // Cropping state
  const [cropQueue, setCropQueue] = useState([]);
  const [currentCropColor, setCurrentCropColor] = useState(null);
  const [isEditingCrop, setIsEditingCrop] = useState(false);

  const [newProd, setNewProd] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    categoria: "BOTAS",
    destacado: false,
    colores: "",
    stock: {},
    fotosPorColor: {},
    descripcionesPorColor: {},
  });

  const fetchProducts = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "productos"));
    setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleUpdate = async (id) => {
    try {
      setUploading(true);
      const coloresArray = Array.isArray(editingData.colores)
        ? editingData.colores
        : editingData.colores
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c !== "");

      await updateDoc(doc(db, "productos", id), {
        ...editingData,
        colores: coloresArray,
        precio: parseInt(editingData.precio),
        fotosPorColor: editingData.fotosPorColor || {},
        descripcionesPorColor: editingData.descripcionesPorColor || {},
      });

      setEditingId(null);
      setEditingData(null);
      fetchProducts();
      Toast.fire({ icon: "success", title: "Producto actualizado" });
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el producto" });
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (p) => {
    setEditingId(p.id);
    setEditingData({
      ...p,
      colores: (p.colores || []).join(", "),
      fotosPorColor: p.fotosPorColor || {},
      descripcionesPorColor: p.descripcionesPorColor || {},
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === import.meta.env.VITE_ADMIN_PASSWORD) {
      setAuthorized(true);
      fetchProducts();
      Toast.fire({ icon: "success", title: "Acceso concedido" });
    } else {
      Swal.fire({
        icon: "error",
        title: "Acceso Denegado",
        text: "Contraseña incorrecta",
        confirmButtonColor: "#000",
      });
      setPasswordInput("");
    }
  };

  const handleColorFiles = async (e, color, isEditing) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const fileReaders = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });

    const base64Files = await Promise.all(fileReaders);
    setCropQueue(base64Files);
    setCurrentCropColor(color);
    setIsEditingCrop(isEditing);
    e.target.value = "";
  };

  const onCropComplete = (croppedImage) => {
    if (isEditingCrop) {
      const updatedFotos = { ...(editingData.fotosPorColor || {}) };
      updatedFotos[currentCropColor] = [...(updatedFotos[currentCropColor] || []), croppedImage];
      setEditingData({ ...editingData, fotosPorColor: updatedFotos });
    } else {
      const updatedFotos = { ...(newProd.fotosPorColor || {}) };
      updatedFotos[currentCropColor] = [...(updatedFotos[currentCropColor] || []), croppedImage];
      setNewProd({ ...newProd, fotosPorColor: updatedFotos });
    }

    const nextQueue = cropQueue.slice(1);
    setCropQueue(nextQueue);
    if (nextQueue.length === 0) {
      setCurrentCropColor(null);
      Toast.fire({ icon: "success", title: "Fotos procesadas con éxito" });
    }
  };

  const onCropCancel = () => {
    setCropQueue([]);
    setCurrentCropColor(null);
  };

  const handleDeleteColorImage = (color, index, isEditing) => {
    if (isEditing) {
      const updatedFotos = { ...(editingData.fotosPorColor || {}) };
      updatedFotos[color] = updatedFotos[color].filter((_, i) => i !== index);
      setEditingData({ ...editingData, fotosPorColor: updatedFotos });
    } else {
      const updatedFotos = { ...(newProd.fotosPorColor || {}) };
      updatedFotos[color] = updatedFotos[color].filter((_, i) => i !== index);
      setNewProd({ ...newProd, fotosPorColor: updatedFotos });
    }
    Toast.fire({ icon: "info", title: "Imagen removida" });
  };

  const moveImage = (color, index, direction, isEditing) => {
    const data = isEditing ? editingData : newProd;
    const setter = isEditing ? setEditingData : setNewProd;
    
    const photos = [...(data.fotosPorColor[color] || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < photos.length) {
      const temp = photos[index];
      photos[index] = photos[newIndex];
      photos[newIndex] = temp;
      
      const updatedFotos = { ...data.fotosPorColor, [color]: photos };
      setter({ ...data, fotosPorColor: updatedFotos });
    }
  };

  const setAsMainImage = (color, index, isEditing) => {
    const data = isEditing ? editingData : newProd;
    const setter = isEditing ? setEditingData : setNewProd;
    
    const photos = [...(data.fotosPorColor[color] || [])];
    const mainPhoto = photos.splice(index, 1)[0];
    photos.unshift(mainPhoto);
    
    const updatedFotos = { ...data.fotosPorColor, [color]: photos };
    setter({ ...data, fotosPorColor: updatedFotos });
    Toast.fire({ icon: "success", title: "Imagen establecida como principal" });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    const colorsWithPhotos = Object.values(newProd.fotosPorColor || {}).some(arr => arr && arr.length > 0);
    if (!colorsWithPhotos) {
      Swal.fire({
        icon: "warning",
        title: "Faltan imágenes",
        text: "Por favor cargá al menos una foto en alguno de los colores.",
        confirmButtonColor: "#000",
      });
      return;
    }

    try {
      const coloresArray = newProd.colores
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c !== "");
      const coloresKeys = coloresArray.length > 0 ? coloresArray : ["Único"];

      const finalStock = {};
      coloresKeys.forEach((color) => {
        finalStock[color] = {};
        TALLES.forEach((t) => {
          finalStock[color][t] = parseInt(newProd.stock[color]?.[t]) || 0;
        });
      });

      await addDoc(collection(db, "productos"), {
        ...newProd,
        colores: coloresArray,
        stock: finalStock,
        precio: parseInt(newProd.precio),
        descripcionesPorColor: newProd.descripcionesPorColor || {},
      });
      Swal.fire({
        icon: "success",
        title: "¡Excelente!",
        text: "El producto fue creado con éxito.",
        confirmButtonColor: "#000",
      });
      setNewProd({
        nombre: "",
        precio: "",
        descripcion: "",
        categoria: "BOTAS",
        destacado: false,
        colores: "",
        stock: {},
        fotosPorColor: {},
        descripcionesPorColor: {},
      });
      fetchProducts();
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al crear el producto.",
      });
    }
  };

  const deleteProduct = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se borrará este modelo permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, "productos", id));
      fetchProducts();
      Swal.fire({
        title: "¡Borrado!",
        text: "El producto ha sido eliminado.",
        icon: "success",
        confirmButtonColor: "#000",
      });
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 font-sans">
        <div className="bg-white p-10 rounded-xl shadow-2xl max-w-md w-full space-y-8 text-center border-t-4 border-black">
          <div>
            <h2 className="font-serif text-4xl italic tracking-widest text-gray-900 mb-2">
              MIUCCHA
            </h2>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">
              Acceso Restringido
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Ingresá la clave de acceso"
              className="w-full p-4 border bg-gray-50 text-center tracking-widest focus:outline-none focus:border-black transition-colors"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-4 uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-gray-800 transition-colors"
            >
              Ingresar al Panel
            </button>
          </form>
          <Link
            to="/"
            className="block text-[10px] text-gray-400 hover:text-black uppercase tracking-widest mt-6"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="pt-40 text-center font-serif italic text-gray-400">
        Cargando catálogo...
      </div>
    );

  const coloresArrayKeys = newProd.colores
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c !== "");
  const coloresFormRender =
    coloresArrayKeys.length > 0 ? coloresArrayKeys : ["Único"];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "TODAS" || p.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-40 px-6 max-w-6xl mx-auto mb-20 font-sans">
      {/* Image Cropper Modal */}
      {cropQueue.length > 0 && (
        <ImageCropper 
          image={cropQueue[0]} 
          onCropComplete={onCropComplete} 
          onCancel={onCropCancel} 
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowPreview(null)}>
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-sm relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 z-[160] text-black text-xl" onClick={() => setShowPreview(null)}>✕</button>
            <div className="p-4">
              <h3 className="text-center font-serif italic mb-6 text-gray-400">Vista Previa de Producto</h3>
              <ProductCard 
                product={showPreview} 
                onAddToCart={() => {}} 
                onOpenSizeGuide={() => {}} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-8 gap-4">
        <h2 className="font-serif text-3xl italic tracking-widest uppercase">
          Panel de Control
        </h2>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="p-2 border text-xs focus:outline-none focus:border-black flex-grow md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border text-xs focus:outline-none focus:border-black"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="TODAS">TODAS LAS CATEGORÍAS</option>
            <option value="TEXANAS">TEXANAS</option>
            <option value="BOTAS">BOTAS</option>
            <option value="BORCEGOS">BORCEGOS</option>
            <option value="DISCONTINUOS">DISCONTINUOS</option>
          </select>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
            En Línea
          </span>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white p-8 rounded-xl shadow-lg mb-16 border grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <h3 className="col-span-full font-serif text-2xl mb-2">
          Cargar Nuevo Modelo
        </h3>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
            Nombre
          </label>
          <input
            type="text"
            className="p-3 border text-sm focus:outline-none focus:border-black"
            value={newProd.nombre}
            onChange={(e) => setNewProd({ ...newProd, nombre: e.target.value })}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
            Precio
          </label>
          <input
            type="number"
            className="p-3 border text-sm focus:outline-none focus:border-black"
            value={newProd.precio}
            onChange={(e) => setNewProd({ ...newProd, precio: e.target.value })}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
            Categoría
          </label>
          <select
            className="p-3 border text-sm focus:outline-none focus:border-black"
            value={newProd.categoria}
            onChange={(e) =>
              setNewProd({ ...newProd, categoria: e.target.value })
            }
          >
            <option value="TEXANAS">TEXANAS</option>
            <option value="BOTAS">BOTAS</option>
            <option value="BORCEGOS">BORCEGOS</option>
            <option value="DISCONTINUOS">DISCONTINUOS</option>
          </select>
        </div>

        <div className="col-span-full flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
            Descripción
          </label>
          <textarea
            className="p-3 border text-sm focus:outline-none focus:border-black min-h-[100px]"
            value={newProd.descripcion}
            onChange={(e) => setNewProd({ ...newProd, descripcion: e.target.value })}
            placeholder="Escribí una descripción detallada del producto..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
            Colores Disponibles (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: Negro, Suela, Blanco"
            className="p-3 border text-sm focus:outline-none focus:border-black"
            value={newProd.colores}
            onChange={(e) =>
              setNewProd({ ...newProd, colores: e.target.value })
            }
          />
        </div>

        <div className="col-span-full flex flex-col gap-4 mt-4">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest border-b pb-2">
            Stock y Fotos por Color
          </span>
          {coloresFormRender.map((color) => (
            <div key={color} className="bg-gray-50 p-4 border rounded space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase">
                  Color: {color}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id={`new-color-img-${color}`}
                    className="hidden"
                    onChange={(e) => handleColorFiles(e, color, false)}
                  />
                  <label
                    htmlFor={`new-color-img-${color}`}
                    className="text-[8px] bg-black text-white px-3 py-1 rounded cursor-pointer uppercase font-bold hover:bg-gray-800"
                  >
                    + Agregar y Recortar Fotos
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400">
                  Descripción específica para este color
                </label>
                <textarea
                  className="p-2 border text-xs focus:outline-none focus:border-black min-h-[60px] bg-white"
                  value={newProd.descripcionesPorColor?.[color] || ""}
                  onChange={(e) =>
                    setNewProd({
                      ...newProd,
                      descripcionesPorColor: {
                        ...newProd.descripcionesPorColor,
                        [color]: e.target.value,
                      },
                    })
                  }
                  placeholder="Si se deja vacío, se usará la descripción general..."
                />
              </div>

              {/* Previsualización fotos color */}
              {newProd.fotosPorColor?.[color]?.length > 0 && (
                <div className="flex flex-wrap gap-4 p-4 bg-white border rounded">
                  {newProd.fotosPorColor[color].map((img, idx) => (
                    <div key={idx} className="relative w-24 h-32 group">
                      <img
                        src={img}
                        className={`w-full h-full object-cover border rounded ${idx === 0 ? 'ring-2 ring-black' : ''}`}
                        alt={`Foto ${color}`}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveImage(color, idx, 'up', false)}
                            disabled={idx === 0}
                            className="bg-white p-1 rounded-full text-black disabled:opacity-30"
                          >
                            <FaArrowUp size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(color, idx, 'down', false)}
                            disabled={idx === newProd.fotosPorColor[color].length - 1}
                            className="bg-white p-1 rounded-full text-black disabled:opacity-30"
                          >
                            <FaArrowDown size={10} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAsMainImage(color, idx, false)}
                          className={`p-1 rounded-full ${idx === 0 ? 'bg-yellow-400 text-white' : 'bg-white text-gray-400'}`}
                        >
                          <FaStar size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteColorImage(color, idx, false)}
                          className="bg-red-500 text-white p-1 rounded-full"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                      {idx === 0 && (
                        <span className="absolute -top-2 -left-2 bg-black text-white text-[6px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter z-10">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-6 gap-2">
                {TALLES.map((talle) => (
                  <div
                    key={talle}
                    className="flex flex-col gap-1 items-center bg-white p-2 border rounded"
                  >
                    <span className="text-[10px] font-bold text-gray-500">
                      T.{talle}
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-2 border text-center text-xs focus:border-black focus:outline-none"
                      value={newProd.stock[color]?.[talle] || 0}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setNewProd({
                          ...newProd,
                          stock: {
                            ...newProd.stock,
                            [color]: {
                              ...(newProd.stock[color] || {}),
                              [talle]: val,
                            },
                          },
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-full flex items-center justify-between mt-6 pt-6 border-t">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-black"
              checked={newProd.destacado}
              onChange={(e) =>
                setNewProd({ ...newProd, destacado: e.target.checked })
              }
            />
            Destacar en Inicio
          </label>
          <button
            type="submit"
            disabled={uploading || cropQueue.length > 0}
            className="bg-black text-white px-10 py-4 uppercase text-[10px] tracking-[0.2em] font-bold disabled:bg-gray-400 hover:bg-gray-800 transition-colors shadow-lg"
          >
            {uploading ? "Procesando..." : "Guardar Producto"}
          </button>
        </div>
      </form>

      <h3 className="font-serif text-2xl mb-6 italic">Catálogo Actual</h3>
      <div className="space-y-8">
        {filteredProducts.map((p) => {
          const isEditing = editingId === p.id;
          const data = isEditing ? editingData : p;
          const pColores = Array.isArray(data.colores) ? data.colores : (data.colores || "").split(",").map(c => c.trim()).filter(c => c !== "");
          const displayColores = pColores.length > 0 ? pColores : ["Único"];
          const isFlat = typeof data.stock?.[TALLES[0]] === "number";

          return (
            <div
              key={p.id}
              className={`p-6 border bg-white shadow-sm flex flex-col md:flex-row gap-8 relative rounded-xl transition-all ${isEditing ? 'ring-2 ring-black shadow-2xl' : ''}`}
            >
              {!isEditing && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setShowPreview(p)}
                    className="text-[10px] bg-white border border-black px-3 py-1 rounded-full font-bold hover:bg-black hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
                  >
                    <FaEye /> Vista Previa
                  </button>
                  <button
                    onClick={() => startEditing(p)}
                    className="text-[10px] bg-gray-100 px-3 py-1 rounded-full font-bold hover:bg-black hover:text-white transition-all uppercase tracking-widest"
                  >
                    Modificar
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform p-1"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              )}

              <div className="w-full md:w-1/4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 p-3 border bg-gray-50 rounded-lg min-h-[160px] justify-center items-center">
                  {Object.values(data.fotosPorColor || {}).flat()[0] ? (
                    <div className="relative w-32 h-44 group">
                      <img
                        src={Object.values(data.fotosPorColor || {}).flat()[0]}
                        className="w-full h-full object-cover border-2 border-black rounded shadow-md"
                        alt="Miniatura"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[7px] text-center font-bold py-1 uppercase tracking-widest">
                        Miniatura
                      </span>
                    </div>
                  ) : (
                    <div className="w-32 h-44 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Sin imágenes</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400">
                        Nombre del Modelo
                      </label>
                      <input
                        type="text"
                        value={data.nombre}
                        disabled={!isEditing}
                        onChange={(e) => setEditingData({...editingData, nombre: e.target.value})}
                        className={`w-full font-bold border-b pb-1 focus:outline-none focus:border-black text-xl bg-transparent ${isEditing ? 'border-gray-300' : 'border-transparent'}`}
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400">
                        Categoría
                      </label>
                      <select
                        value={data.categoria}
                        disabled={!isEditing}
                        onChange={(e) => setEditingData({...editingData, categoria: e.target.value})}
                        className={`w-full text-xs font-bold border-b pb-1 focus:outline-none focus:border-black bg-transparent ${isEditing ? 'border-gray-300' : 'border-transparent appearance-none'}`}
                      >
                        <option value="TEXANAS">TEXANAS</option>
                        <option value="BOTAS">BOTAS</option>
                        <option value="BORCEGOS">BORCEGOS</option>
                        <option value="DISCONTINUOS">DISCONTINUOS</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400">
                        Precio ($)
                      </label>
                      <input
                        type="number"
                        value={data.precio}
                        disabled={!isEditing}
                        onChange={(e) => setEditingData({...editingData, precio: e.target.value})}
                        className={`w-full font-bold border-b pb-1 focus:outline-none focus:border-black text-xl bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isEditing ? 'border-gray-300' : 'border-transparent'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400">
                      Colores (separados por coma)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Negro, Suela, Blanco"
                      value={isEditing ? data.colores : (data.colores || []).join(", ")}
                      disabled={!isEditing}
                      onChange={(e) => setEditingData({...editingData, colores: e.target.value})}
                      className={`w-full text-sm border-b pb-1 focus:outline-none focus:border-black bg-transparent ${isEditing ? 'border-gray-300' : 'border-transparent'}`}
                    />
                  </div>

                  <div>
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400">
                      Descripción
                    </label>
                    <textarea
                      value={data.descripcion || ""}
                      disabled={!isEditing}
                      onChange={(e) => setEditingData({...editingData, descripcion: e.target.value})}
                      className={`w-full text-sm border p-2 focus:outline-none focus:border-black bg-transparent min-h-[100px] ${isEditing ? 'border-gray-300' : 'border-transparent'}`}
                      placeholder="Sin descripción"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="text-[10px] flex items-center gap-2 font-bold uppercase cursor-pointer border px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="accent-black w-4 h-4"
                        checked={data.destacado}
                        disabled={!isEditing}
                        onChange={(e) => setEditingData({...editingData, destacado: e.target.checked})}
                      />
                      Destacar en Inicio
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 border rounded-xl space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-500 block text-center border-b pb-3">
                    Gestión de Stock y Fotos
                  </label>
                  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6">
                    {displayColores.map((color) => {
                      const colorStock = isFlat ? data.stock : data.stock?.[color] || {};
                      const colorFotos = data.fotosPorColor?.[color] || [];

                      return (
                        <div key={color} className="space-y-3 p-3 border border-gray-200 rounded-lg bg-white/50">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase text-black flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-black"></span>
                              {color}
                            </span>
                            {isEditing && (
                              <div>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  id={`edit-color-img-${color}-${p.id}`}
                                  className="hidden"
                                  onChange={(e) => handleColorFiles(e, color, true)}
                                />
                                <label
                                  htmlFor={`edit-color-img-${color}-${p.id}`}
                                  className="text-[8px] bg-black text-white px-2 py-1 rounded cursor-pointer font-bold"
                                >
                                  + Agregar y Recortar
                                </label>
                              </div>
                            )}
                          </div>

                          {isEditing && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400">
                                Descripción específica
                              </label>
                              <textarea
                                className="p-2 border text-[10px] focus:outline-none focus:border-black min-h-[50px] bg-white"
                                value={data.descripcionesPorColor?.[color] || ""}
                                onChange={(e) => {
                                  setEditingData({
                                    ...editingData,
                                    descripcionesPorColor: {
                                      ...(editingData.descripcionesPorColor || {}),
                                      [color]: e.target.value,
                                    },
                                  });
                                }}
                                placeholder="Usar descripción general..."
                              />
                            </div>
                          )}

                          {colorFotos.length > 0 && (
                            <div className="flex flex-wrap gap-3 p-3 bg-white border rounded">
                              {colorFotos.map((img, idx) => (
                                <div key={idx} className="relative w-16 h-20 group">
                                  <img
                                    src={img}
                                    className={`w-full h-full object-cover border rounded shadow-sm ${idx === 0 ? 'ring-1 ring-black' : ''}`}
                                    alt={`${color}-${idx}`}
                                  />
                                  {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5">
                                      <div className="flex gap-0.5">
                                        <button
                                          type="button"
                                          onClick={() => moveImage(color, idx, 'up', true)}
                                          disabled={idx === 0}
                                          className="bg-white p-0.5 rounded-full text-black disabled:opacity-30"
                                        >
                                          <FaArrowUp size={8} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveImage(color, idx, 'down', true)}
                                          disabled={idx === colorFotos.length - 1}
                                          className="bg-white p-0.5 rounded-full text-black disabled:opacity-30"
                                        >
                                          <FaArrowDown size={8} />
                                        </button>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setAsMainImage(color, idx, true)}
                                        className={`p-0.5 rounded-full ${idx === 0 ? 'bg-yellow-400 text-white' : 'bg-white text-gray-400'}`}
                                      >
                                        <FaStar size={8} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteColorImage(color, idx, true)}
                                        className="bg-red-500 text-white p-0.5 rounded-full"
                                      >
                                        <FaTrash size={8} />
                                      </button>
                                    </div>
                                  )}
                                  {idx === 0 && (
                                    <span className="absolute -top-1 -left-1 bg-black text-white text-[5px] font-bold px-1 rounded uppercase z-10">
                                      Principal
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-6 gap-2">
                            {TALLES.map((talle) => (
                              <div
                                key={talle}
                                className="flex flex-col items-center bg-white border p-2 rounded shadow-sm"
                              >
                                <span className="text-[9px] font-bold text-gray-400 mb-1">
                                  T.{talle}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  value={colorStock[talle] || 0}
                                  disabled={!isEditing}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    const newStock = { ...data.stock };
                                    if (isFlat) {
                                      newStock[talle] = val;
                                    } else {
                                      newStock[color] = { ...(newStock[color] || {}), [talle]: val };
                                    }
                                    setEditingData({...editingData, stock: newStock});
                                  }}
                                  className={`w-full text-center text-xs font-bold bg-transparent outline-none focus:text-black ${isEditing ? 'text-blue-600' : 'text-gray-900'}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isEditing && (
                  <div className="lg:col-span-2 flex justify-end gap-3 mt-4 pt-6 border-t">
                    <button
                      onClick={cancelEditing}
                      className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdate(p.id)}
                      disabled={uploading || cropQueue.length > 0}
                      className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] rounded shadow-lg hover:bg-gray-800 disabled:bg-gray-400 transition-all"
                    >
                      {uploading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPanel;
