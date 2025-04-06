// googleConfig.js - Configuración para autenticación de Google con Vercel
// Compatible con el enfoque de Next.js para variables de entorno

const googleConfig = {
  // Vercel inyectará esta variable en el cliente cuando se despliegue
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
};

// Para Next.js, exportar como default
export default googleConfig;

// Función para obtener el ID de cliente (para compatibilidad)
export function getGoogleClientId() {
  return googleConfig.clientId;
}

// Para asegurar que la función global está disponible (para compatibilidad)
if (typeof window !== 'undefined') {
  window.getGoogleClientId = getGoogleClientId;
}