// firestore.js - Gère les opérations avec la base de données Firestore

// Función mejorada para cargar datos de usuario
// Asegurarse de que auth está definido y accesible
function loadUserData(userId) {
    // Verificar que userId no sea nulo o indefinido
    if (!userId) {
        console.error("loadUserData: No se proporcionó userId");
        return Promise.reject("No userId provided");
    }
    
    // Verificar que auth existe
    if (typeof auth === 'undefined' || !auth) {
        console.error("loadUserData: El objeto auth no está definido");
        return Promise.reject("Auth object not defined");
    }
    
    console.log("Intentando cargar datos para el usuario:", userId);
    
    // Referencia al documento del usuario
    const userRef = db.collection('users').doc(userId);
    
    // Obtener el documento
    return userRef.get().then((doc) => {
        if (doc.exists) {
            // El usuario existe en la base de datos
            console.log("Datos del usuario cargados correctamente");
            
            // Cargar las materias del usuario
            const userData = doc.data();
            if (userData.subjects && Array.isArray(userData.subjects)) {
                // Actualizar el array global 'subjects' con los datos de Firestore
                window.subjects = userData.subjects;
                
                // Asegurarse de que window.renderSubjects existe antes de llamarla
                if (typeof window.renderSubjects === 'function') {
                    window.renderSubjects();
                } else {
                    console.error("La función renderSubjects no está definida");
                    // Esperar a que esté disponible
                    let attempts = 0;
                    const maxAttempts = 5;
                    
                    function tryRender() {
                        if (typeof window.renderSubjects === 'function') {
                            window.renderSubjects();
                        } else if (attempts < maxAttempts) {
                            attempts++;
                            setTimeout(tryRender, 500);
                        } else {
                            console.error("No se pudo encontrar renderSubjects después de varios intentos");
                        }
                    }
                    
                    tryRender();
                }
                
                // Asegurarse de que window.updateFinalScore existe antes de llamarla
                if (typeof window.updateFinalScore === 'function') {
                    window.updateFinalScore();
                }
                
                return userData.subjects;
            } else {
                console.log("El usuario no tiene materias registradas o el formato es incorrecto");
                window.subjects = [];
                if (typeof window.renderSubjects === 'function') {
                    window.renderSubjects();
                }
                return [];
            }
        } else {
            // El usuario es nuevo, crear un documento
            console.log("Nuevo usuario, creando documento...");
            return userRef.set({
                displayName: auth.currentUser.displayName || "Usuario",
                email: auth.currentUser.email || "",
                photoURL: auth.currentUser.photoURL || "",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                subjects: [] // Inicialmente sin materias
            })
            .then(() => {
                console.log("Documento de usuario creado con éxito");
                window.subjects = []; // Inicializar subjects como array vacío
                if (typeof window.renderSubjects === 'function') {
                    window.renderSubjects();
                }
                return [];
            })
            .catch((error) => {
                console.error("Error al crear el documento de usuario:", error);
                throw error;
            });
        }
    }).catch((error) => {
        console.error("Error al obtener el documento de usuario:", error);
        throw error;
    });
}

// Fonction pour sauvegarder les données de l'utilisateur
function saveUserData() {
    // Verificar que auth existe
    if (typeof auth === 'undefined' || !auth) {
        console.error("saveUserData: El objeto auth no está definido");
        return Promise.reject("Auth object not defined");
    }
    
    if (!auth.currentUser) {
        console.log("Aucun utilisateur connecté pour sauvegarder les données");
        return Promise.reject("No user logged in");
    }
    
    const userId = auth.currentUser.uid;
    const userRef = db.collection('users').doc(userId);
    
    // Verificar que window.subjects existe
    if (!window.subjects) {
        console.error("window.subjects no está definido");
        window.subjects = [];
    }
    
    // Sauvegarder les matières dans Firestore
    return userRef.update({
        subjects: window.subjects, // Le tableau global 'subjects'
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Données sauvegardées avec succès");
        return true;
    })
    .catch((error) => {
        console.error("Erreur lors de la sauvegarde des données:", error);
        
        // Si l'erreur est due au fait que le document n'existe pas (par exemple, s'il a été supprimé)
        // essayer de le créer à nouveau
        if (error.code === 'not-found') {
            return userRef.set({
                displayName: auth.currentUser.displayName,
                email: auth.currentUser.email,
                photoURL: auth.currentUser.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                subjects: window.subjects
            })
            .then(() => {
                console.log("Document recréé et données sauvegardées avec succès");
                return true;
            })
            .catch((setError) => {
                console.error("Erreur lors de la recréation du document:", setError);
                throw setError;
            });
        } else {
            throw error;
        }
    });
}

// Fonction pour nettoyer les données lorsque l'utilisateur se déconnecte
function clearUserData() {
    window.subjects = [];
    if (typeof window.renderSubjects === 'function') {
        window.renderSubjects(); // Rendre la liste vide
    }
    if (typeof window.updateFinalScore === 'function') {
        window.updateFinalScore(); // Mettre à jour le score final
    }
}