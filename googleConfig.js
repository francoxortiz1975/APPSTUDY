// Configuración para Google OAuth
const googleConfig = {
  clientId: "157181619799-7bh6g4fkc1ft81m2tr09dec60cn2sktf.apps.googleusercontent.com",
  // No coloques el client secret aquí, debe mantenerse en el servidor
};

// Exponemos la función globalmente para que pueda ser utilizada por auth.js
window.getGoogleClientId = function() {
  return googleConfig.clientId;
}