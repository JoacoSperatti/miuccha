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
  const [authorized, setAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
    const snap = await getDocs(collection(db, "productos"));
    setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
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
    const p = products.find((prod) => prod.id === id);
    if (!p) return;

    try {
      if (type === "main") {
        if (p.galeria && p.galeria.length > 0) {
          const newMain = p.galeria[0];
          const newGal = p.galeria.slice(1);
          await updateDoc(doc(db, "productos", id), {
            img: newMain,
            galeria: newGal,
          });
        } else {
          await updateDoc(doc(db, "productos", id), { img: "" });
        }
      } else {
        const newGal = p.galeria.filter((_, i) => i !== index);
        await updateDoc(doc(db, "productos", id), { galeria: newGal });
      }
      fetchProducts();
      Toast.fire({ icon: "info", title: "Imagen eliminada" });
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

  const updateField = async (id, field, value) => {
    try {
      const val = field === "precio" ? parseInt(value) : value;
      await updateDoc(doc(db, "productos", id), { [field]: val });
      fetchProducts();
      if (field !== "img" && field !== "galeria")
        Toast.fire({ icon: "success", title: "Campo actualizado" });
    } catch (e) {
      console.error(e);
    }
  };

  const updateStock = async (id, color, talle, nuevoValor, isFlat) => {
    try {
      const field = isFlat ? `stock.${talle}` : `stock.${color}.${talle}`;
      await updateDoc(doc(db, "productos", id), {
        [field]: parseInt(nuevoValor),
      });
      fetchProducts();
      Toast.fire({ icon: "success", title: `Stock T.${talle} actualizado` });
    } catch (e) {
      console.error(e);
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

  return (
    <div className="pt-40 px-6 max-w-6xl mx-auto mb-20 font-sans">
      <div className="flex justify-between items-end border-b pb-4 mb-8">
        <h2 className="font-serif text-3xl italic tracking-widest uppercase">
          Panel de Control
        </h2>
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
          En Línea
        </span>
      </div>

      {/* FORMULARIO NUEVO PRODUCTO */}
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
                      className="w-full p-2 border text-center text-xs focus:border-black focus:outline-none"
                      value={newProd.stock[color]?.[talle] || 0}
                      onChange={(e) =>
                        setNewProd({
                          ...newProd,
                          stock: {
                            ...newProd.stock,
                            [color]: {
                              ...(newProd.stock[color] || {}),
                              [talle]: e.target.value,
                            },
                          },
                        })
                      }
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
      <div className="space-y-6">
        {products.map((p) => {
          const pColores = p.colores?.length > 0 ? p.colores : ["Único"];
          const isFlat = typeof p.stock?.[TALLES[0]] === "number";

          return (
            <div
              key={p.id}
              className="p-6 border bg-white shadow-sm flex flex-col md:flex-row gap-6 relative rounded-lg"
            >
              <button
                onClick={() => deleteProduct(p.id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:scale-110 transition-transform p-2"
              >
                <FaTrash size={16} />
              </button>

              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 p-3 border bg-gray-50 rounded min-h-[120px]">
                  <div className="relative w-20 h-28 group">
                    <img
                      src={p.img}
                      className="w-full h-full object-cover border-2 border-black"
                      alt="Portada"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[7px] text-center font-bold py-1">
                      PORTADA
                    </span>
                    <button
                      onClick={() => handleDeleteImage(p.id, "main")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                  {(p.galeria || []).map((img, idx) => (
                    <div key={idx} className="relative w-20 h-28 group">
                      <img
                        src={img}
                        className="w-full h-full object-cover border"
                        alt="Galeria"
                      />
                      <button
                        onClick={() => handleDeleteImage(p.id, "galeria", idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id={`main-${p.id}`}
                    className="hidden"
                    onChange={(e) =>
                      handleSingleFile(e, (base64) =>
                        updateField(p.id, "img", base64),
                      )
                    }
                  />
                  <label
                    htmlFor={`main-${p.id}`}
                    className="text-[8px] border border-gray-300 py-3 text-center cursor-pointer hover:bg-black hover:text-white font-bold uppercase transition-all rounded"
                  >
                    {uploading ? "Cargando..." : "Cambiar Portada"}
                  </label>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id={`gal-${p.id}`}
                    className="hidden"
                    onChange={(e) =>
                      handleMultipleFiles(e, (base64Arr) =>
                        updateField(p.id, "galeria", [
                          ...(p.galeria || []),
                          ...base64Arr,
                        ]),
                      )
                    }
                  />
                  <label
                    htmlFor={`gal-${p.id}`}
                    className="text-[8px] bg-black text-white py-3 text-center cursor-pointer hover:bg-gray-800 font-bold uppercase transition-all rounded shadow"
                  >
                    {uploading ? "Cargando..." : "+ Añadir Fotos"}
                  </label>
                </div>
              </div>

              <div className="flex-grow grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400">
                      Nombre
                    </label>
                    <input
                      type="text"
                      defaultValue={p.nombre}
                      onBlur={(e) =>
                        updateField(p.id, "nombre", e.target.value)
                      }
                      className="w-full font-bold border-b pb-1 focus:outline-none focus:border-black text-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400">
                      Colores (separar con coma)
                    </label>
                    <input
                      type="text"
                      placeholder="Agregar colores..."
                      defaultValue={(p.colores || []).join(", ")}
                      onBlur={(e) =>
                        updateField(
                          p.id,
                          "colores",
                          e.target.value
                            .split(",")
                            .map((c) => c.trim())
                            .filter((c) => c !== ""),
                        )
                      }
                      className="w-full border-b pb-1 focus:outline-none focus:border-black text-sm text-gray-600"
                    />
                  </div>
                  <div className="flex items-end gap-6 pt-2">
                    <div>
                      <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400">
                        Precio ($)
                      </label>
                      <input
                        type="number"
                        defaultValue={p.precio}
                        onBlur={(e) =>
                          updateField(p.id, "precio", e.target.value)
                        }
                        className="w-24 border-b pb-1 focus:outline-none focus:border-black text-lg font-bold"
                      />
                    </div>
                    <label className="text-[10px] flex items-center gap-2 font-bold uppercase cursor-pointer mb-1 border px-3 py-1 rounded bg-gray-50">
                      <input
                        type="checkbox"
                        className="accent-black"
                        defaultChecked={p.destacado}
                        onChange={(e) =>
                          updateField(p.id, "destacado", e.target.checked)
                        }
                      />
                      Destacado Home
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 border rounded space-y-4">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 block text-center border-b pb-2">
                    Control de Stock Multidimensional
                  </label>
                  {pColores.map((color) => {
                    const colorStock = isFlat
                      ? p.stock
                      : p.stock?.[color] || {};
                    return (
                      <div key={color}>
                        <span className="text-[9px] font-bold uppercase mb-2 block text-black">
                          Color: {color}
                        </span>
                        <div className="grid grid-cols-6 gap-2">
                          {TALLES.map((talle) => (
                            <div
                              key={talle}
                              className="flex flex-col items-center bg-white border p-1 rounded"
                            >
                              <span className="text-[8px] font-bold text-gray-400">
                                T.{talle}
                              </span>
                              <input
                                type="number"
                                defaultValue={colorStock[talle] || 0}
                                onBlur={(e) =>
                                  updateStock(
                                    p.id,
                                    color,
                                    talle,
                                    e.target.value,
                                    isFlat,
                                  )
                                }
                                className="w-full text-center text-xs font-bold bg-transparent outline-none focus:text-blue-600"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPanel;
