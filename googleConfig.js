// Configuración para Google OAuth
const googleConfig = {
  clientId: "157181619799-7bh6g4fkc1ft81m2tr09dec60cn2sktf.apps.googleusercontent.com",
  // No coloques el client secret aquí, debe mantenerse en el servidor
};

// No exportamos directamente el objeto para evitar exposición en repositorios públicos
function getGoogleClientId() {
  return googleConfig.clientId;
}