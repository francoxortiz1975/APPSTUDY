// auth.js - Gère l'authentification Firebase
document.addEventListener("DOMContentLoaded", () => {
    // Références aux éléments de l'interface utilisateur pour la connexion
    const loginBtn = document.getElementById("login-with-google");
    const emailLoginForm = document.getElementById("login-with-email");
    const registerForm = document.getElementById("register-button");
    const logoutBtn = document.getElementById("sidebar-logout");
    const loginPage = document.getElementById("login-page");
    const appContainer = document.getElementById("app-container");
    const userDisplayName = document.getElementById("sidebar-user-name");
    const userEmail = document.getElementById("sidebar-user-email");
    const userProfilePic = document.getElementById("sidebar-user-pic");
    
    // Navegación UI
    const showLoginFormBtn = document.getElementById("show-login-form");
    const showRegisterFormBtn = document.getElementById("show-register-form");
    const showLoginFormAltBtn = document.getElementById("show-login-form-alt");
    const showRegisterFormAltBtn = document.getElementById("show-register-form-alt");
    const backToLoginBtns = document.querySelectorAll(".back-to-login-options");
    
    // Configuración de navegación UI
    if (showLoginFormBtn) {
        showLoginFormBtn.addEventListener("click", () => {
            document.getElementById("login-section").style.display = "none";
            document.getElementById("register-section").style.display = "none";
            document.getElementById("login-email-section").style.display = "block";
        });
    }
    
    if (showRegisterFormBtn) {
        showRegisterFormBtn.addEventListener("click", () => {
            document.getElementById("login-section").style.display = "none";
            document.getElementById("login-email-section").style.display = "none";
            document.getElementById("register-section").style.display = "block";
        });
    }
    
    if (showLoginFormAltBtn) {
        showLoginFormAltBtn.addEventListener("click", () => {
            document.getElementById("login-section").style.display = "none";
            document.getElementById("register-section").style.display = "none";
            document.getElementById("login-email-section").style.display = "block";
        });
    }
    
    if (showRegisterFormAltBtn) {
        showRegisterFormAltBtn.addEventListener("click", () => {
            document.getElementById("login-section").style.display = "none";
            document.getElementById("login-email-section").style.display = "none";
            document.getElementById("register-section").style.display = "block";
        });
    }
    
    backToLoginBtns.forEach((button) => {
        button.addEventListener("click", () => {
            document.getElementById("login-email-section").style.display = "none";
            document.getElementById("register-section").style.display = "none";
            document.getElementById("login-section").style.display = "block";
        });
    });
    
    // Obtener el clientId de Google desde el archivo de configuración
    const googleClientId = getGoogleClientId();
    
    // Fournisseur d'authentification Google
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({
        client_id: googleClientId,
        prompt: 'select_account'
    });
    
    // Fonction pour se connecter avec Google
    function signInWithGoogle() {
        console.log("Intentando iniciar sesión con Google...");
        firebase.auth().signInWithPopup(googleProvider)
            .then((result) => {
                console.log("Connexion réussie", result.user);
                // Pas besoin de faire quoi que ce soit ici, l'écouteur de changement d'auth s'en chargera
            })
            .catch((error) => {
                console.error("Erreur de connexion:", error);
                console.error("Code:", error.code);
                console.error("Message:", error.message);
                alert("Un problème est survenu lors de la connexion. Veuillez réessayer.");
            });
    }
    
    // Fonction pour se connecter avec email/mot de passe
    function signInWithEmail(e) {
        e.preventDefault();
        console.log("Intentando iniciar sesión con email...");
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        if (!email || !password) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        
        auth.signInWithEmailAndPassword(email, password)
            .then((result) => {
                console.log("Connexion par email réussie", result.user);
                // L'écouteur de changement d'auth s'en chargera
            })
            .catch((error) => {
                console.error("Erreur de connexion par email:", error);
                
                // Messages d'erreur plus conviviaux
                let errorMessage = "Un problème est survenu lors de la connexion.";
                
                if (error.code === 'auth/user-not-found') {
                    errorMessage = "Aucun utilisateur trouvé avec cet email.";
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = "Mot de passe incorrect.";
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = "Format d'email invalide.";
                }
                
                alert(errorMessage);
            });
    }
    
    // Fonction pour créer un compte
    function registerUser(e) {
        e.preventDefault();
        console.log("Intentando registrar usuario...");
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm-password").value;
        const displayName = document.getElementById("register-name").value;
        
        // Validation de base
        if (!email || !password || !confirmPassword || !displayName) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        
        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas.");
            return;
        }
        
        if (password.length < 6) {
            alert("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        
        // Créer un nouvel utilisateur
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Compte créé avec succès");
                
                // Mettre à jour le profil avec le nom d'affichage
                return userCredential.user.updateProfile({
                    displayName: displayName,
                    // Photo de profil par défaut (optionnel)
                    photoURL: "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName) + "&background=random"
                });
            })
            .then(() => {
                // Rafraîchir l'utilisateur pour obtenir les nouvelles données de profil
                return auth.currentUser.reload();
            })
            .then(() => {
                // Force la mise à jour de l'interface (l'écouteur ne se déclenche pas toujours après updateProfile)
                if (auth.currentUser) {
                    userDisplayName.textContent = auth.currentUser.displayName;
                    userEmail.textContent = auth.currentUser.email;
                    userProfilePic.src = auth.currentUser.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(auth.currentUser.displayName) + "&background=random";
                }
                
                alert("Compte créé avec succès!");
                
                // Basculer vers la page principale
                loginPage.style.display = "none";
                appContainer.style.display = "block";
                
                // Charger les données utilisateur vides
                if (auth.currentUser) {
                    loadUserData(auth.currentUser.uid);
                }
            })
            .catch((error) => {
                console.error("Erreur lors de la création du compte:", error);
                
                // Messages d'erreur plus conviviaux
                let errorMessage = "Un problème est survenu lors de la création du compte.";
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = "Cet email est déjà utilisé par un autre compte.";
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = "Format d'email invalide.";
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = "Le mot de passe est trop faible.";
                }
                
                alert(errorMessage);
            });
    }
    
    // Fonction pour se déconnecter
    function signOut() {
        console.log("Deconnexion en process");
        auth.signOut()
            .then(() => {
                console.log("Déconnexion réussie");
                // L'écouteur s'occupera de mettre à jour l'interface
            })
            .catch((error) => {
                console.error("Erreur lors de la déconnexion:", error);
            });
    }
    
    // Écouteur pour les changements d'état d'authentification
    auth.onAuthStateChanged((user) => {
        if (user) {
            // El usuario está conectado
            console.log("Usuario conectado:", user);
            
            // Mostrar la aplicación principal, ocultar la página de login
            loginPage.style.display = "none";
            appContainer.style.display = "block";
            
            // Actualizar la información del usuario en la barra lateral
            userDisplayName.textContent = user.displayName || user.email.split('@')[0];
            userEmail.textContent = user.email || "";
            
            // Si el usuario tiene una foto de perfil, usarla, si no usar un avatar generado
            const displayName = user.displayName || user.email.split('@')[0];
            userProfilePic.src = user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName) + "&background=random";
            
            // Asegurarse de que window.subjects existe antes de cargar datos
            window.subjects = window.subjects || [];
            
            // Cargar los datos del usuario
            if (typeof loadUserData === 'function') {
                loadUserData(user.uid);
            } else {
                console.error("La función loadUserData no está definida");
            }
        } else {
            // El usuario está desconectado
            console.log("Usuario desconectado");
            
            // Mostrar la página de login, ocultar la aplicación principal
            loginPage.style.display = "flex";
            appContainer.style.display = "none";
            
            // Resetear el formulario de login
            document.getElementById("login-section").style.display = "block";
            document.getElementById("login-email-section").style.display = "none";
            document.getElementById("register-section").style.display = "none";
            
            // Limpiar los datos
            if (typeof clearUserData === 'function') {
                clearUserData();
            } else {
                window.subjects = [];
            }
        }
    });
    
    // Assigner des événements aux boutons
    if (loginBtn) {
        console.log("Añadiendo evento click al botón login-with-google");
        loginBtn.addEventListener("click", signInWithGoogle);
    } else {
        console.error("Botón login-with-google no encontrado");
    }
    
    if (emailLoginForm) {
        console.log("Añadiendo evento submit al formulario login-with-email");
        emailLoginForm.addEventListener("submit", signInWithEmail);
    } else {
        console.error("Formulario login-with-email no encontrado");
    }
    
    if (registerForm) {
        console.log("Añadiendo evento submit al formulario register-button");
        registerForm.addEventListener("submit", registerUser);
    } else {
        console.error("Formulario register-button no encontrado");
    }
    
    if (logoutBtn) {
        console.log("Añadiendo evento click al botón sidebar-logout");
        logoutBtn.addEventListener("click", signOut);
    } else {
        console.error("Botón sidebar-logout no encontrado");
    }
    
    console.log("Inicialización de auth.js completada");
});