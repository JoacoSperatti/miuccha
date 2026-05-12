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
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { Toast, TALLES } from "../constants/constants";

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
  const [newProd, setNewProd] = useState({
    nombre: "",
    precio: "",
    categoria: "BOTAS",
    destacado: false,
    img: "",
    colores: "",
    galeria: [],
    stock: {},
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
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === "miuccha2026") {
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

  const processImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSingleFile = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const base64 = await processImage(file);
    callback(base64);
    setUploading(false);
    e.target.value = "";
    Toast.fire({ icon: "success", title: "Imagen principal cargada" });
  };

  const handleMultipleFiles = async (e, callback) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const promises = files.map((file) => processImage(file));
    const base64Array = await Promise.all(promises);
    callback(base64Array);
    setUploading(false);
    e.target.value = "";
    Toast.fire({ icon: "success", title: "Imágenes añadidas a la galería" });
  };

  const handleDeleteImage = async (id, type, index = null) => {
    const isEditing = editingId === id;
    const p = isEditing ? editingData : products.find((prod) => prod.id === id);
    if (!p) return;

    try {
      let updatedImg = p.img;
      let updatedGaleria = [...(p.galeria || [])];

      if (type === "main") {
        if (updatedGaleria.length > 0) {
          updatedImg = updatedGaleria[0];
          updatedGaleria = updatedGaleria.slice(1);
        } else {
          updatedImg = "";
        }
      } else {
        updatedGaleria = updatedGaleria.filter((_, i) => i !== index);
      }

      if (isEditing) {
        setEditingData({ ...editingData, img: updatedImg, galeria: updatedGaleria });
        Toast.fire({ icon: "info", title: "Imagen removida localmente" });
      } else {
        await updateDoc(doc(db, "productos", id), {
          img: updatedImg,
          galeria: updatedGaleria,
        });
        fetchProducts();
        Toast.fire({ icon: "info", title: "Imagen eliminada" });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la imagen",
      });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProd.img) {
      Swal.fire({
        icon: "warning",
        title: "Falta la imagen principal",
        text: "Por favor seleccioná una portada para el producto.",
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
        categoria: "BOTAS",
        destacado: false,
        img: "",
        colores: "",
        galeria: [],
        stock: {},
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

      {/* FORMULARIO NUEVO PRODUCTO */}
      {/* ... (rest of the code remains similar but I will update the list below) ... */}

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

        <div className="md:col-span-2 flex flex-col gap-2 p-4 border bg-gray-50 rounded">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest border-b pb-2 mb-2">
            Imágenes del producto
          </span>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 mb-1 block">
                Foto Principal (Portada)
              </label>
              <input
                type="file"
                accept="image/*"
                className="text-xs w-full bg-white p-2 border"
                onChange={(e) =>
                  handleSingleFile(e, (base64) =>
                    setNewProd({ ...newProd, img: base64 }),
                  )
                }
              />
            </div>
            <div className="flex-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 mb-1 block">
                Fotos Extras (Galería)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="text-xs w-full bg-white p-2 border"
                onChange={(e) =>
                  handleMultipleFiles(e, (base64Array) =>
                    setNewProd({
                      ...newProd,
                      galeria: [...newProd.galeria, ...base64Array],
                    }),
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* PREVISUALIZACIÓN DE IMÁGENES AL CREAR */}
        {(newProd.img || newProd.galeria.length > 0) && (
          <div className="col-span-full p-4 border bg-gray-50 rounded flex flex-wrap gap-4 items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-full border-b pb-2 mb-2">
              Previsualización
            </span>
            {newProd.img && (
              <div className="relative w-20 h-28 group">
                <img
                  src={newProd.img}
                  className="w-full h-full object-cover border-2 border-black"
                  alt="Portada"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[7px] text-center font-bold py-1">
                  PORTADA
                </span>
                <button
                  type="button"
                  onClick={() => setNewProd({ ...newProd, img: "" })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg hover:scale-110"
                >
                  ✕
                </button>
              </div>
            )}
            {newProd.galeria.map((img, idx) => (
              <div key={idx} className="relative w-20 h-28 group">
                <img
                  src={img}
                  className="w-full h-full object-cover border"
                  alt="Galeria"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newGal = newProd.galeria.filter((_, i) => i !== idx);
                    setNewProd({ ...newProd, galeria: newGal });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg hover:scale-110"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="col-span-full flex flex-col gap-4 mt-4">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest border-b pb-2">
            Stock Inicial por Talle
          </span>
          {coloresFormRender.map((color) => (
            <div key={color} className="bg-gray-50 p-4 border rounded">
              <span className="text-[10px] font-bold uppercase mb-3 block">
                Color: {color}
              </span>
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
            disabled={uploading}
            className="bg-black text-white px-10 py-4 uppercase text-[10px] tracking-[0.2em] font-bold disabled:bg-gray-400 hover:bg-gray-800 transition-colors shadow-lg"
          >
            {uploading ? "Procesando..." : "Guardar Producto"}
          </button>
        </div>
      </form>

      {/* LISTADO DE PRODUCTOS EXISTENTES */}
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
                <div className="flex flex-wrap gap-2 p-3 border bg-gray-50 rounded-lg min-h-[160px]">
                  <div className="relative w-24 h-32 group">
                    <img
                      src={data.img}
                      className="w-full h-full object-cover border-2 border-black rounded shadow-md"
                      alt="Portada"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[7px] text-center font-bold py-1">
                      PORTADA
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteImage(p.id, "main")}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {(data.galeria || []).map((img, idx) => (
                    <div key={idx} className="relative w-24 h-32 group">
                      <img
                        src={img}
                        className="w-full h-full object-cover border rounded shadow-sm"
                        alt="Galeria"
                      />
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteImage(p.id, "galeria", idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id={`main-${p.id}`}
                      className="hidden"
                      onChange={(e) =>
                        handleSingleFile(e, (base64) =>
                          setEditingData({ ...editingData, img: base64 })
                        )
                      }
                    />
                    <label
                      htmlFor={`main-${p.id}`}
                      className="text-[8px] border border-gray-300 py-3 text-center cursor-pointer hover:bg-black hover:text-white font-bold uppercase transition-all rounded"
                    >
                      {uploading ? "..." : "Portada"}
                    </label>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      id={`gal-${p.id}`}
                      className="hidden"
                      onChange={(e) =>
                        handleMultipleFiles(e, (base64Arr) =>
                          setEditingData({
                            ...editingData,
                            galeria: [...(editingData.galeria || []), ...base64Arr],
                          })
                        )
                      }
                    />
                    <label
                      htmlFor={`gal-${p.id}`}
                      className="text-[8px] bg-black text-white py-3 text-center cursor-pointer hover:bg-gray-800 font-bold uppercase transition-all rounded"
                    >
                      {uploading ? "..." : "+ Fotos"}
                    </label>
                  </div>
                )}
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
                        className={`w-full font-bold border-b pb-1 focus:outline-none focus:border-black text-xl bg-transparent ${isEditing ? 'border-gray-300' : 'border-transparent'}`}
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
                    Gestión de Stock
                  </label>
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-6">
                    {displayColores.map((color) => {
                      const colorStock = isFlat ? data.stock : data.stock?.[color] || {};
                      return (
                        <div key={color} className="space-y-2">
                          <span className="text-[10px] font-bold uppercase text-black flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-black"></span>
                            {color}
                          </span>
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
                      disabled={uploading}
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
