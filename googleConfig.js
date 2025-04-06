// googleConfig.js - Versión corregida que expone las variables globalmente
const googleConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
};

// Función para obtener el ID que debe ser accesible globalmente
function getGoogleClientId() {
  return googleConfig.clientId;
}

// Exponer todo globalmente
if (typeof window !== 'undefined') {
  window.googleConfig = googleConfig;
  window.getGoogleClientId = getGoogleClientId;
}

// Mantener compatibilidad con ES modules
export default googleConfig;
export { getGoogleClientId };