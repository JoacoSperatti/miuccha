import { FaTimes } from "react-icons/fa";

const SizeGuide = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-lg p-8 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="font-serif text-2xl italic mb-6 border-b pb-2">
          Guía de Talles
        </h2>
        <table className="w-full text-left font-sans border-collapse">
          <thead>
            <tr className="border-b text-[10px] uppercase tracking-widest text-gray-400">
              <th className="py-3">Talle</th>
              <th className="py-3 text-right">Centímetros</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { t: "35", cm: "22.5" },
              { t: "36", cm: "23.2" },
              { t: "37", cm: "24.0" },
              { t: "38", cm: "24.6" },
              { t: "39", cm: "25.3" },
              { t: "40", cm: "26.0" },
              { t: "41", cm: "26.7" },
              { t: "42", cm: "27.3" },
              { t: "43", cm: "28.0" },
            ].map((row) => (
              <tr
                key={row.t}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 font-bold">Talle {row.t}</td>
                <td className="py-3 text-right font-mono">{row.cm} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 bg-gray-50 p-4 text-[11px] leading-relaxed text-gray-600 font-sans">
          <p className="font-bold mb-2 uppercase tracking-tighter text-black">
            ¿Cómo medir tu pie?
          </p>
          <p>
            Apoyá el pie sobre una hoja de papel, marcá el talón y el dedo más
            largo. Medí la distancia y sumale 0.5 cm para mayor comodidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
