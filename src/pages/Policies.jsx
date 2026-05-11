const PolicyPage = () => (
  <div className="pt-44 pb-24 px-6 max-w-4xl mx-auto font-sans leading-relaxed">
    <h2 className="font-serif text-4xl md:text-5xl italic mb-12 text-center tracking-tight text-gray-900">
      Política de Devolución y Cambios
    </h2>
    
    <div className="space-y-12 text-gray-700">
      <p className="text-lg text-center font-serif italic text-gray-600 max-w-2xl mx-auto">
        En nuestra tienda, valoramos la confianza que depositás en nuestros productos y queremos que tu experiencia de compra sea completamente satisfactoria. Por eso, te presentamos nuestra Política de Devolución y Cambios, diseñada para proteger tus derechos y garantizarte claridad en cada paso.
      </p>

      <section className="bg-gray-50 p-8 md:p-12 border border-gray-100 rounded-2xl shadow-sm">
        <h3 className="font-bold uppercase tracking-[0.2em] text-black mb-6 border-b pb-4 text-sm">
          Cambios de Productos
        </h3>
        <div className="space-y-6 text-sm md:text-base">
          <p>
            Escribinos a nuestro WhatsApp indicando tu <b>Nro de Orden (#)</b> y el motivo del cambio. 
            Podés solicitar un cambio dentro de los <b>15 días corridos</b> desde la fecha de compra, 
            siempre que el producto cumpla con las siguientes condiciones:
          </p>
          
          <ul className="list-disc pl-5 space-y-3 marker:text-black">
            <li>Esté sin uso y en perfectas condiciones.</li>
            <li>Conserve su caja original.</li>
            <li>El cambio será por un producto de igual o mayor valor, abonando la diferencia si corresponde.</li>
            <li>Si optás por un producto de menor valor, no se reintegra la diferencia.</li>
          </ul>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-6">
            <p className="text-amber-900 font-bold uppercase text-[11px] tracking-widest">
              Importante:
            </p>
            <p className="text-amber-800 text-sm">
              Las <b>ofertas u promociones no tienen cambio</b>. Asegurate de revisar bien tu talle antes de realizar la compra.
            </p>
          </div>
          
          <p className="italic text-gray-500 text-sm pt-4">
            Este proceso asegura que mantengas la calidad que caracteriza a nuestros artículos.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="p-6 border border-gray-100 rounded-xl">
          <h4 className="font-bold uppercase tracking-widest text-black mb-4 text-xs">Falla del producto</h4>
          <p className="text-sm">
            Si el cambio es por un <b>error o falla</b> en el producto, nos haremos cargo del costo de envío.
          </p>
        </div>
        <div className="p-6 border border-gray-100 rounded-xl">
          <h4 className="font-bold uppercase tracking-widest text-black mb-4 text-xs">Elección del cliente</h4>
          <p className="text-sm">
            Si el cambio es por <b>elección del cliente</b>, los costos de envío correrán por cuenta del comprador.
          </p>
        </div>
      </section>

      <footer className="text-center space-y-4 pt-8">
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          Con esta política, buscamos ofrecerte un servicio transparente y justo, cuidando tanto tu satisfacción como la integridad de nuestros productos.
        </p>
        <div className="flex flex-col items-center gap-2">
          <p className="font-bold text-black uppercase text-[10px] tracking-[0.3em]">
            Para consultas adicionales, no dudes en contactarnos:
          </p>
          <a 
            href="mailto:miucchashoes@gmail.com" 
            className="text-sm text-gray-600 hover:text-black border-b border-transparent hover:border-black transition-all font-medium"
          >
            miucchashoes@gmail.com
          </a>
        </div>
      </footer>
    </div>
  </div>
);

export default PolicyPage;
