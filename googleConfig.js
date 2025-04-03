const googleConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
};

export default googleConfig;

// Optional: Global function for compatibility
if (typeof window !== 'undefined') {
  window.getGoogleClientId = function() {
    return googleConfig.clientId;
  };
}