# 🌍 Globo eSIM — Mini-App para Lemon Cash  
**Venta de eSIM para viajeros, pagadas con USDC**

Globo eSIM es una mini-app pensada para integrarse al ecosistema de **Lemon Cash** y permitir a los usuarios comprar eSIM internacionales en más de **200 países**, pagando en **USDC**.

Actualmente la app corre como **SPA web (modo desarrollo)** mientras espera la aprobación oficial de Lemon para integrarse al SDK de Mini-Apps.  
Ya está conectada a la **Airalo Partner API (sandbox)**, que se utiliza para simular la compra y provisión de eSIMs.

---

## 🚀 Características principales

### 🟣 1. Preparada para integrar Lemon Mini-Apps
> ⚠️ Aún pendiente de activación por parte de Lemon.  
> El código y diseño están pensados para correr dentro del WebView de Lemon y usar su SDK cuando la mini-app sea aprobada.

Diseñada para soportar:

- Autenticación del usuario mediante `authenticate()`
- Detección del entorno con `isWebView()`
- Pago en USDC mediante `deposit()`
- Flujo optimizado para WebView en iOS/Android

Estas funciones están documentadas en:  
https://lemoncash.mintlify.app

### 🟢 2. Integración Airalo Partner API (Sandbox)
Hoy la app **sí está integrada** con Airalo en modo sandbox:

- Obtención de planes por país  
- Creación de órdenes de eSIM  
- Recepción de:
  - QR de instalación  
  - Código LPA (activation code)  
  - Enlace automático de instalación para iPhone  
  - HTML de guía de instalación  
- Todo en **sandbox**, sin activar eSIMs reales en producción.

### 🔵 3. Flujo completo para el usuario final (modo sandbox)
1. Selecciona país de destino  
2. Elige un plan  
3. Simula el pago (en el futuro: pago real con USDC desde Lemon)  
4. Recibe la eSIM lista para activar  
5. Puede instalarla usando:
   - QR  
   - Instalación automática en iPhone  
   - Código LPA manual  
6. Accede a una guía integrada para iPhone y Android

### 💎 4. UI moderna, clara y responsiva
- Paleta personalizada de **Globo eSIM**  
- Modal propio con guía paso a paso  
- Estilo tipo “mini-app oficial”  
- Layout mobile-first pensado para WebView

---

## 🏗️ Arquitectura


/frontend → React + TypeScript + Vite (Mini-App Lemon)
/server → Node + Express + Axios (Airalo Partner API client)



### Frontend
- React + TypeScript
- Vite  
- CSS-in-JS / estilos custom
- Diseño mobile-first para WebView
- Preparado para integrar el SDK de Lemon (authenticate, deposit, isWebView) una vez que la mini-app sea aprobada

### Backend
- Node.js + Express  
- Axios  
- Módulo de caching de token para Airalo  
- Endpoints REST:
  - `GET /api/airalo/packages` → lista planes por país  
  - `POST /api/airalo/orders` → crea la orden y devuelve QR + LPA + links

---

## 🔐 Integraciones externas

### 🟢 Lemon Cash Mini-Apps  *(planeado)*
- Documentación: https://lemoncash.mintlify.app  
- Se usará para:
  - Autenticación del usuario
  - Verificación del entorno (WebView)
  - Pago con USDC
  - Deep links y comunicación con la app de Lemon

### 🟣 Airalo Partner API  *(implementado en sandbox)*
- Documentación: https://partners-api.airalo.com  
- Se utiliza para:
  - Obtener access token (OAuth client_credentials)
  - Listar planes por país
  - Crear órdenes de eSIM en modo sandbox
  - Obtener QR, LPA, links de instalación y guías HTML

---

## 📱 Screenshots de la mini-app Globo eSIM

Vistas reales de la mini-app corriendo en modo sandbox con Airalo.

---

### 🌍 Selección de país y compra del eSIM
<img src="./public/screenshots/screenshot1.png" width="350"/>

### 🎉 eSIM generada (QR + LPA)
<img src="./public/screenshots/screenshot2.png" width="350"/>

### 📖 Instrucciones dentro de Globo eSIM (GUIA QR + LPA)
<img src="./public/screenshots/screenshot3.png" width="350"/>

### 📧 Confirmación por email enviada por Airalo (sandbox)
<img src="./public/screenshots/emailconfirm.png.jpg" width="350"/>

---

## 🛠️ Scripts de desarrollo

### Frontend
```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build de producción
npm run build

```

### Backend

# Instalar dependencias
npm install

# Modo desarrollo (ts-node-dev)
npm run dev

# Producción (usar el build/compilado si aplica)
npm start



📦 Variables de entorno
Frontend
VITE_LEMON_ENV=dev
VITE_API_BASE=http://localhost:4000

📌 Estado actual del proyecto

✅ UI principal terminada

✅ Integración con Airalo Partner API (sandbox)

✅ Flujo de compra + generación de eSIM + guía de instalación

✅ Documentación básica y screenshots listos

⏳ A la espera de aprobación de Lemon para:

Integrar el SDK oficial de Mini-Apps

Activar autenticación y pagos reales en USDC dentro de Lemon Cash

👤 Autor

Pedro Vega
Desarrollador de Globo eSIM
Mendoza, Argentina
GitHub: https://github.com/pedrocjs1




