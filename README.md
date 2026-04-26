# MIUCCHA - Calzado de Autor 👠

Bienvenido al repositorio oficial de **MIUCCHA**, una plataforma de e-commerce diseñada para la venta de calzado artesanal 100% cuero. La aplicación está construida con un stack moderno enfocado en el rendimiento, la estética minimalista y la gestión eficiente de stock.

## 🚀 Tecnologías Utilizadas

* **Frontend:** React.js + Vite
* **Estilos:** Tailwind CSS (Diseño basado en Micadel)
* **Base de Datos y Backend:** Firebase (Firestore)
* **Navegación:** React Router DOM
* **Componentes de UI:** React Icons, Swiper.js (Carruseles)
* **Despliegue:** Vercel

## ✨ Características Principales

* **Diseño Premium:** Header dinámico que se contrae al hacer scroll y estética minimalista.
* **Gestión de Stock "Cuackstore":** Control preciso de stock por talle con descuento automático al confirmar el pedido.
* **Flujo de Compra por WhatsApp:** Carrito de compras que genera una **Orden de Compra única (#)** y envía el detalle listo para el vendedor.
* **Panel Administrativo:** Sección de gestión interna (`/gestion-interna`) protegida para carga de productos, edición de precios y ajuste de stock.
* **Catálogo Dinámico:** Filtrado por categorías (Texanas, Botas, Borcegos, Discontinuos) y etiquetas de "Destacados".
* **Responsive:** Optimizado para dispositivos móviles y escritorio.

## 🛠️ Configuración Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/miuccha.git
    cd miuccha
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz y configura tus credenciales de Firebase (con prefijo VITE_ para que sean accesibles):
    ```env
    VITE_FIREBASE_API_KEY=tu_api_key
    VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
    VITE_FIREBASE_PROJECT_ID=tu_project_id
    VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
    VITE_FIREBASE_APP_ID=tu_app_id
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

## 📦 Estructura de la Base de Datos (Firestore)

Para el correcto funcionamiento, se requieren las siguientes colecciones:

* **productos:** Documentos con campos `nombre`, `precio`, `categoria`, `img`, `destacado` (bool) y `stock` (map de talles).
* **metadata:** Un documento llamado `orders` con un campo `count` (number) para el correlativo de pedidos.

## 🛡️ Seguridad

* Las credenciales están protegidas mediante variables de entorno en el cliente.
* El archivo `.gitignore` debe incluir el archivo `.env` para evitar fugas de información.
* El acceso al panel de administración requiere una clave de acceso configurada.

---
Desarrollado por [Joaquín Speratti] - 2026