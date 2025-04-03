// googleConfig.js
const googleConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
};

// Global function for compatibility
window.getGoogleClientId = function() {
  return googleConfig.clientId;
};