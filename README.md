# 🌍 Globo eSIM — Mini-App para Lemon Cash  
**Venta de eSIM para viajeros, pagadas con USDC**

Globo eSIM es una **mini-app integrada al ecosistema de Lemon Cash** que permite a cualquier usuario comprar eSIM internacionales en más de **200 países**, con pago directo en **USDC** y activación instantánea.

La app está construida con **React + TypeScript + Vite**, integrada al SDK oficial de Lemon, y conectada a la **Airalo Partner API** para la provisión real de eSIMs.

---

## 🚀 Características principales

### 🟣 1. Integración completa con Lemon Mini-Apps
- Autenticación de usuario con `authenticate()`
- Detección de WebView con `isWebView()`
- Pago simulado en USDC mediante `deposit()`
- UI optimizada para WebView en iOS/Android

### 🟢 2. Integración Airalo Partner API (Sandbox)
- Obtención de planes por país  
- Creación de órdenes de eSIM  
- Recepción de:
  - QR de instalación  
  - Código LPA (activation code)  
  - Enlace automático de instalación en iPhone  
  - Guía de instalación paso a paso  
- Todo en **modo Sandbox**, sin activar eSIMs reales

### 🔵 3. Flujo completo para el usuario final
1. Seleccionar país de destino  
2. Elegir un plan  
3. Pagar con USDC en Lemon  
4. Recibir la eSIM lista para activar  
5. Instalar mediante:
   - QR  
   - Instalación automática en iPhone  
   - Código LPA manual  
6. Acceso a guía integrada para iPhone y Android

### 💎 4. UI moderna, clara y responsiva
- Paleta personalizada de Globo eSIM  
- Ventanas modales limpias para guías  
- Estilo profesional tipo “mini-app oficial”  
- Totalmente responsive para Lemon WebView

---

## 🏗️ Arquitectura

/frontend → React + TypeScript + Vite (Mini-App Lemon)
/server → Node + Express + Axios (Airalo Partner API client)


