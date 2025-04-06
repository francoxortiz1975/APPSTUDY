// auth.js - Gestiona la autenticación con Firebase
// Modificado para ser compatible con la estructura de Vercel

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado, esperando a que Firebase esté listo...");
    
    // Función principal que se ejecutará cuando Firebase esté listo
    function initAuth() {
        console.log("Inicializando autenticación...");
        
        // Verificar que auth esté disponible
        if (!window.auth) {
            console.error("El objeto auth no está disponible. Firebase puede no haberse inicializado correctamente.");
            return;
        }
        
        // Referencias a elementos UI
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
        
        // Provider para autenticación con Google
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
        
        function signInWithGoogle() {
            console.log("Intentando iniciar sesión con Google...");
            
            firebase.auth().signInWithPopup(googleProvider)
                .then((result) => {
                    console.log("Connexion réussie", result.user);
                    
                    // Guardar información en localStorage para persistencia entre páginas
                    storeUserDataInLocalStorage(result.user);
                })
                .catch((error) => {
                    console.error("Erreur de connexion:", error);
                    console.error("Code:", error.code);
                    console.error("Message:", error.message);
                    
                    // Manejar errores específicos
                    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                        console.log("Popup bloqueado o cerrado, intentando con redirección...");
                        return firebase.auth().signInWithRedirect(googleProvider);
                    } else if (error.code === 'auth/cancelled-popup-request') {
                        console.log("Solicitud de popup cancelada, probablemente múltiples intentos");
                        return;
                    } else {
                        alert("Error de autenticación: " + error.message);
                    }
                });
        }
        
        // Función para conectarse con email/contraseña
        function signInWithEmail(e) {
            e.preventDefault();
            console.log("Intentando iniciar sesión con email...");
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            
            if (!email || !password) {
                alert("Veuillez remplir tous les champs.");
                return;
            }
            
            window.auth.signInWithEmailAndPassword(email, password)
                .then((result) => {
                    console.log("Connexion par email réussie", result.user);
                    
                    // Guardar información en localStorage para persistencia entre páginas
                    storeUserDataInLocalStorage(result.user);
                })
                .catch((error) => {
                    console.error("Erreur de connexion par email:", error);
                    
                    // Mensajes de error más amigables
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
        
        // Función para crear una cuenta
        function registerUser(e) {
            e.preventDefault();
            console.log("Intentando registrar usuario...");
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;
            const confirmPassword = document.getElementById("register-confirm-password").value;
            const displayName = document.getElementById("register-name").value;
            
            // Validación básica
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
            
            // Crear nuevo usuario
            window.auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Compte créé avec succès");
                    
                    // Actualizar perfil con nombre
                    return userCredential.user.updateProfile({
                        displayName: displayName,
                        // Foto de perfil por defecto (opcional)
                        photoURL: "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName) + "&background=random"
                    });
                })
                .then(() => {
                    // Refrescar usuario para obtener nueva data de perfil
                    return window.auth.currentUser.reload();
                })
                .then(() => {
                    // Forzar actualización de UI (el listener no siempre se dispara después de updateProfile)
                    if (window.auth.currentUser) {
                        userDisplayName.textContent = window.auth.currentUser.displayName;
                        userEmail.textContent = window.auth.currentUser.email;
                        userProfilePic.src = window.auth.currentUser.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(window.auth.currentUser.displayName) + "&background=random";
                        
                        // Guardar información en localStorage para persistencia entre páginas
                        storeUserDataInLocalStorage(window.auth.currentUser);
                    }
                    
                    alert("Compte créé avec succès!");
                    
                    // Cambiar a página principal
                    loginPage.style.display = "none";
                    appContainer.style.display = "block";
                    
                    // Cargar datos de usuario vacíos
                    if (window.auth.currentUser) {
                        loadUserData(window.auth.currentUser.uid);
                    }
                })
                .catch((error) => {
                    console.error("Erreur lors de la création du compte:", error);
                    
                    // Mensajes de error más amigables
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
        
        // Función para cerrar sesión
        function signOut() {
            console.log("Cerrando sesión...");
            
            // Limpiar localStorage antes de cerrar sesión
            clearUserDataFromLocalStorage();
            
            window.auth.signOut()
                .then(() => {
                    console.log("Déconnexion réussie");
                    // El listener se encargará de actualizar la UI
                })
                .catch((error) => {
                    console.error("Erreur lors de la déconnexion:", error);
                });
        }
        
        // Función para guardar datos del usuario en localStorage
        function storeUserDataInLocalStorage(user) {
            if (user) {
                localStorage.setItem('etudlyAuthToken', 'authenticated'); // No es un token real, solo un indicador
                localStorage.setItem('etudlyAuthEmail', user.email || '');
                localStorage.setItem('etudlyAuthName', user.displayName || user.email.split('@')[0]);
                localStorage.setItem('etudlyAuthPhoto', user.photoURL || '');
                localStorage.setItem('etudlyAuthUid', user.uid || '');
                
                console.log("Datos de usuario guardados en localStorage");
            }
        }
        
        // Función para limpiar datos del usuario de localStorage
        function clearUserDataFromLocalStorage() {
            localStorage.removeItem('etudlyAuthToken');
            localStorage.removeItem('etudlyAuthEmail');
            localStorage.removeItem('etudlyAuthName');
            localStorage.removeItem('etudlyAuthPhoto');
            localStorage.removeItem('etudlyAuthUid');
            
            console.log("Datos de usuario eliminados de localStorage");
        }
        
        // Listener para cambios de estado de autenticación
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                // Usuario conectado
                console.log("Usuario conectado:", user);
                
                // Guardar información en localStorage
                storeUserDataInLocalStorage(user);
                
                // Mostrar aplicación principal, ocultar página de login
                loginPage.style.display = "none";
                appContainer.style.display = "block";
                
                // Actualizar info de usuario en sidebar
                userDisplayName.textContent = user.displayName || user.email.split('@')[0];
                userEmail.textContent = user.email || "";
                
                // Si el usuario tiene foto de perfil, usarla; si no, usar avatar generado
                const displayName = user.displayName || user.email.split('@')[0];
                userProfilePic.src = user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName) + "&background=random";
                
                // Asegurar que window.subjects existe antes de cargar datos
                window.subjects = window.subjects || [];
                
                // Cargar datos de usuario
                if (typeof loadUserData === 'function') {
                    loadUserData(user.uid);
                } else {
                    console.error("La función loadUserData no está definida");
                }
            } else {
                // Usuario desconectado
                console.log("Usuario desconectado");
                
                // Verificar si hay datos en localStorage para intentar reconexión
                const authUid = localStorage.getItem('etudlyAuthUid');
                const authEmail = localStorage.getItem('etudlyAuthEmail');
                
                if (authUid && authEmail) {
                    console.log("Datos de autenticación encontrados en localStorage, pero no hay sesión activa en Firebase");
                    // No hacemos nada aquí, dejamos que la UI muestre la página de login
                    // En una implementación más avanzada, podríamos intentar reconectar automáticamente
                    
                    // Limpiar localStorage ya que la sesión Firebase no es válida
                    clearUserDataFromLocalStorage();
                }
                
                // Mostrar página de login, ocultar aplicación principal
                loginPage.style.display = "flex";
                appContainer.style.display = "none";
                
                // Resetear formulario de login
                document.getElementById("login-section").style.display = "block";
                document.getElementById("login-email-section").style.display = "none";
                document.getElementById("register-section").style.display = "none";
                
                // Limpiar datos
                if (typeof clearUserData === 'function') {
                    clearUserData();
                } else {
                    window.subjects = [];
                }
            }
        });
        
        // Exposición global de funciones
        window.storeUserDataInLocalStorage = storeUserDataInLocalStorage;
        window.clearUserDataFromLocalStorage = clearUserDataFromLocalStorage;
        
        // Asignar eventos a botones
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
        
        // Protección de navegación para la barra lateral
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', function(e) {
                // Verificar autenticación antes de permitir la navegación
                if (!localStorage.getItem('etudlyAuthToken') && !window.auth.currentUser) {
                    e.preventDefault();
                    alert('Vous devez être connecté pour accéder à cette page.');
                    loginPage.style.display = "flex";
                    appContainer.style.display = "none";
                }
            });
        });
        
        console.log("Inicialización de auth.js completada");
    }
    
    // Esperar a que Firebase esté listo antes de inicializar la autenticación
    if (window.auth) {
        // Si Firebase ya está inicializado, proceder directamente
        initAuth();
    } else {
        // Si no, esperar al evento firebaseReady
        window.addEventListener('firebaseReady', initAuth);
    }
});