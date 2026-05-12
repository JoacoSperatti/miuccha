import { useState } from "react";
import { FaTimes, FaWhatsapp } from "react-icons/fa";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Swal from "sweetalert2";
import { TALLES } from "../constants/constants";

const CartDrawer = ({ isOpen, onClose, cart, setCart }) => {
  const [userData, setUserData] = useState({
    nombre: "",
    direccion: "",
    localidad: "",
    cp: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const total = cart.reduce((acc, item) => acc + item.precio, 0);

  const finalizarCompra = async () => {
    if (cart.length === 0) return;

    if (
      !userData.nombre ||
      !userData.direccion ||
      !userData.localidad ||
      !userData.cp
    ) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Por favor, completa todos los datos de envío.",
        confirmButtonColor: "#000",
      });
      return;
    }

    try {
      const metaRef = doc(db, "metadata", "orders");
      await updateDoc(metaRef, { count: increment(1) });

      const metaSnap = await getDoc(metaRef);

      if (!metaSnap.exists()) {
        throw new Error("El documento de metadata no existe en Firestore");
      }

      const orderNumber = metaSnap.data().count;

      for (const item of cart) {
        const productoRef = doc(db, "productos", item.id);
        const itemSnap = await getDoc(productoRef);

        if (itemSnap.exists()) {
          const dbData = itemSnap.data();
          const isFlat = typeof dbData.stock?.[TALLES[0]] === "number";
          const updateField = isFlat
            ? `stock.${item.talle}`
            : `stock.${item.color || "Único"}.${item.talle}`;

          await updateDoc(productoRef, {
            [updateField]: increment(-1),
          });
        }
      }

      const productosTxt = cart
        .map(
          (item) =>
            `- ${item.nombre} (Talle: ${item.talle}${item.color && item.color !== "Único" ? `, Color: ${item.color}` : ""})`,
        )
        .join("\n");

      const datosPago =
        "ALIAS: zona.cansar.ropa.mp\nCBU: 0000003100106194229026\nTitular: Gas Fe Srl";

      const mensajeCuerpo = `Hola Miuccha! *ORDEN DE COMPRA #${orderNumber}*\n\n*DATOS DE ENVÍO:*\nNombre: ${userData.nombre}\nDirección: ${userData.direccion}\nLocalidad: ${userData.localidad}\nCP: ${userData.cp}\n\n*PEDIDO:*\n${productosTxt}\n\n*Total: $${total.toLocaleString()}*\n\n*(ADVERTENCIA, por deposito bancario consultar en el momento) DATOS PARA TRANSFERENCIA:*\n${datosPago}\n\n(Envío el comprobante por acá ni bien realice el pago)`;

      const mensajeCodificado = encodeURIComponent(mensajeCuerpo);
      const whatsappUrl = `https://wa.me/5491165283561?text=${mensajeCodificado}`;

      setCart([]);
      setUserData({ nombre: "", direccion: "", localidad: "", cp: "" });
      onClose();
      window.location.assign(whatsappUrl);
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Hubo un problema al generar tu pedido. Por favor, intenta de nuevo o contactanos por Instagram.",
        confirmButtonColor: "#000",
      });
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[200] ${isOpen ? "visible" : "invisible"}`}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full bg-white w-full max-w-md shadow-2xl transition-transform duration-500 transform ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-serif text-2xl italic tracking-widest text-gray-900">
            Tu Carrito
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:rotate-90 transition-transform"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6 space-y-6 font-sans">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 mt-20 text-[10px] uppercase tracking-widest font-bold">
              Carrito vacío
            </p>
          ) : (
            <>
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 border-b border-gray-50 pb-6"
                  >
                    <img
                      src={item.img}
                      className="w-20 h-28 object-cover bg-gray-100 shadow-sm"
                      alt={item.nombre}
                    />
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-serif text-lg leading-tight text-gray-900">
                          {item.nombre}
                        </h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">
                          Talle: {item.talle}{" "}
                          {item.color && item.color !== "Único"
                            ? `| Color: ${item.color}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="font-bold text-sm text-gray-800">
                          ${item.precio.toLocaleString()}
                        </p>
                        <button
                          onClick={() =>
                            setCart(cart.filter((_, i) => i !== index))
                          }
                          className="text-[9px] uppercase border-b border-black font-bold text-red-500 border-red-500"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario de Datos de Envío */}
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-900 mb-4">
                  Datos de Envío
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    name="nombre"
                    placeholder="NOMBRE COMPLETO"
                    value={userData.nombre}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-[10px] tracking-widest focus:outline-none focus:border-black transition-colors"
                  />
                  <input
                    type="text"
                    name="direccion"
                    placeholder="DIRECCIÓN"
                    value={userData.direccion}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-[10px] tracking-widest focus:outline-none focus:border-black transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="localidad"
                      placeholder="LOCALIDAD"
                      value={userData.localidad}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 text-[10px] tracking-widest focus:outline-none focus:border-black transition-colors"
                    />
                    <input
                      type="text"
                      name="cp"
                      placeholder="CÓDIGO POSTAL"
                      value={userData.cp}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 text-[10px] tracking-widest focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-8 bg-gray-50 space-y-4 border-t-2 border-white">
            <div className="bg-amber-50 border border-amber-200 p-4">
              <p className="text-[9px] font-bold text-amber-800 uppercase tracking-widest mb-1 font-sans">
                📌 Pago por Transferencia: zona.cansar.ropa.mp /
                0000003100106194229026 (por deposito bancario consultar en el
                momento){" "}
              </p>
              <p className="text-[10px] text-amber-900 font-sans">
                A nombre de <b>Gas Fe Srl</b>. Envianos el comprobante por
                WhatsApp para despachar.
              </p>
            </div>
            <div className="flex justify-between items-center mb-4 font-sans">
              <span className="uppercase text-[10px] tracking-[0.3em] font-bold text-gray-500">
                Total
              </span>
              <span className="text-2xl font-serif text-gray-900">
                ${total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={finalizarCompra}
              className="w-full py-5 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gray-800 flex items-center justify-center gap-2 transition-all"
            >
              <FaWhatsapp size={16} /> Enviar pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
