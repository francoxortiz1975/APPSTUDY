// auth-manager.js - Gestion de l'authentification partagée entre les pages

// Fonction pour vérifier l'état d'authentification
function checkAuthStateAndRedirect() {
    console.log("Vérification de l'état d'authentification...");
    
    // Vérifier si l'utilisateur a déjà un token dans le localStorage
    const authToken = localStorage.getItem('etudlyAuthToken');
    const authEmail = localStorage.getItem('etudlyAuthEmail');
    const authName = localStorage.getItem('etudlyAuthName');
    const authPhoto = localStorage.getItem('etudlyAuthPhoto');
    
    // Attendre que Firebase soit prêt
    const checkFirebase = () => {
      if (window.firebase && window.firebase.auth) {
        // Observer l'état d'authentification
        firebase.auth().onAuthStateChanged((user) => {
          if (!user) {
            console.log("Utilisateur non connecté");
            
            // Si nous avons un token mais pas d'utilisateur Firebase, essayer de reconnecter
            if (authToken && authEmail) {
              console.log("Tentative de reconnexion avec le token local");
              
              // Cette tentative est simplifiée et peut ne pas fonctionner dans tous les cas
              // Une meilleure approche serait d'utiliser la persistance Firebase
              firebase.auth().signInWithEmailAndPassword(authEmail, authToken)
                .catch((error) => {
                  console.error("Échec de la reconnexion automatique:", error);
                  // En cas d'échec, nettoyer le localStorage et afficher la page de connexion
                  clearAuthData();
                  showLoginPage();
                });
            } else {
              // Pas de token, afficher la page de connexion
              showLoginPage();
            }
          } else {
            console.log("Utilisateur connecté:", user.email);
            
            // Stocker les informations d'authentification dans localStorage
            storeAuthData(user);
            
            // Afficher l'application
            showAppContainer(user);
          }
        });
      } else {
        console.log("Firebase n'est pas encore prêt, nouvelle tentative dans 100ms");
        // Firebase n'est pas encore prêt, réessayer dans 100ms
        setTimeout(checkFirebase, 100);
      }
    };
    
    checkFirebase();
  }
  
  // Fonction pour stocker les données d'authentification
  function storeAuthData(user) {
    if (user) {
      localStorage.setItem('etudlyAuthToken', 'authenticated'); // Ne stockez jamais de vrais tokens ici!
      localStorage.setItem('etudlyAuthEmail', user.email || '');
      localStorage.setItem('etudlyAuthName', user.displayName || 'Utilisateur');
      localStorage.setItem('etudlyAuthPhoto', user.photoURL || '');
    }
  }
  
  // Fonction pour effacer les données d'authentification
  function clearAuthData() {
    localStorage.removeItem('etudlyAuthToken');
    localStorage.removeItem('etudlyAuthEmail');
    localStorage.removeItem('etudlyAuthName');
    localStorage.removeItem('etudlyAuthPhoto');
  }
  
  // Fonction pour afficher la page de connexion
  function showLoginPage() {
    const loginPage = document.getElementById('login-page');
    const appContainer = document.getElementById('app-container');
    
    if (loginPage && appContainer) {
      loginPage.style.display = 'flex';
      appContainer.style.display = 'none';
    } else {
      console.error("Éléments d'interface non trouvés");
      // Si nous sommes sur une page qui ne possède pas la page de login,
      // rediriger vers la page principale
      window.location.href = 'app.html';
    }
  }
  
  // Fonction pour afficher le conteneur de l'application
  function showAppContainer(user) {
    const loginPage = document.getElementById('login-page');
    const appContainer = document.getElementById('app-container');
    
    if (loginPage && appContainer) {
      loginPage.style.display = 'none';
      appContainer.style.display = 'block';
      
      // Mettre à jour les informations utilisateur dans la barre latérale
      updateSidebarUserInfo(user);
    }
  }
  
  // Mettre à jour les informations utilisateur dans la barre latérale
  function updateSidebarUserInfo(user) {
    const userNameElement = document.getElementById('sidebar-user-name');
    const userEmailElement = document.getElementById('sidebar-user-email');
    const userPicElement = document.getElementById('sidebar-user-pic');
    
    if (userNameElement && userEmailElement && userPicElement) {
      userNameElement.textContent = user.displayName || localStorage.getItem('etudlyAuthName') || 'Utilisateur';
      userEmailElement.textContent = user.email || localStorage.getItem('etudlyAuthEmail') || '';
      
      if (user.photoURL || localStorage.getItem('etudlyAuthPhoto')) {
        userPicElement.src = user.photoURL || localStorage.getItem('etudlyAuthPhoto');
      } else {
        // Image par défaut si pas de photo
        userPicElement.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userNameElement.textContent) + '&background=random';
      }
    }
  }
  
  // Gérer la déconnexion
  function setupLogoutButton() {
    const logoutButton = document.getElementById('sidebar-logout');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        if (window.firebase && window.firebase.auth) {
          firebase.auth().signOut().then(() => {
            console.log("Déconnexion réussie");
            clearAuthData();
            showLoginPage();
          }).catch((error) => {
            console.error("Erreur lors de la déconnexion:", error);
          });
        }
      });
    }
  }
  
  // Protection de navigation pour la barre latérale
  function setupNavigationProtection() {
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
      // Conserver le comportement de navigation normal mais s'assurer qu'on est authentifié
      link.addEventListener('click', function(e) {
        if (!localStorage.getItem('etudlyAuthToken')) {
          e.preventDefault();
          alert('Vous devez être connecté pour accéder à cette page.');
          showLoginPage();
        }
      });
    });
  }
  
  // Fonction principale à appeler dans chaque page
  function initializeAuth() {
    checkAuthStateAndRedirect();
    setupLogoutButton();
    setupNavigationProtection();
    
    // Exposer les fonctions importantes globalement
    window.checkAuthStateAndRedirect = checkAuthStateAndRedirect;
    window.clearAuthData = clearAuthData;
  }
  
  // Lancer l'initialisation au chargement
  document.addEventListener('DOMContentLoaded', initializeAuth);