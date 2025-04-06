const fs = require('fs');

// Crear archivo de configuración Firebase
const firebaseConfigContent = `
// IMPORTANTE: Este archivo es generado automáticamente durante el build
// NO editar directamente

// Configuración de Firebase
window.firebaseConfig = {
  apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}",
  authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}",
  projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}",
  measurementId: "${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''}"
};
`;

// Crear archivo de configuración Google
const googleConfigContent = `
// IMPORTANTE: Este archivo es generado automáticamente durante el build
// NO editar directamente

// Configuración de Google Auth
window.googleConfig = {
  clientId: "${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}"
};

// Función para obtener el ID de cliente
window.getGoogleClientId = function() {
  return window.googleConfig.clientId;
};
`;

// Escribir los archivos
fs.writeFileSync('./config.js', firebaseConfigContent);
fs.writeFileSync('./googleConfig.js', googleConfigContent);

console.log('Archivos de configuración generados correctamente');