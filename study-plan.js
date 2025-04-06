document.addEventListener("DOMContentLoaded", () => {
    // Éléments du DOM
    const uploadButton = document.getElementById("upload-button");
    const fileInput = document.getElementById("file-input");
    const documentDropzone = document.getElementById("document-dropzone");
    const uploadedFilesList = document.getElementById("uploaded-files-list");
    const examSubjectSelect = document.getElementById("exam-subject");
    const examDateInput = document.getElementById("exam-date");
    const studyHoursInput = document.getElementById("study-hours");
    const generatePlanButton = document.getElementById("generate-plan-button");
    const studyPlansSection = document.getElementById("study-plans-section");
    const studyPlansList = document.getElementById("study-plans-list");
    const planDetailsPopup = document.getElementById("plan-details-popup");
    const planDetailsClose = document.getElementById("plan-details-close");
    
    // Variables pour stocker les fichiers et les sujets
    let uploadedFiles = [];
    let subjects = [];
    
    // Vérifier si l'utilisateur est connecté
    function checkAuth() {
        // Vérifier d'abord le localStorage pour l'authentification
        const authToken = localStorage.getItem('etudlyAuthToken');
        const authUid = localStorage.getItem('etudlyAuthUid');
        
        if (authToken && authUid) {
            console.log("Authentification trouvée dans localStorage:", authUid);
            // Charger les données utilisateur en utilisant l'ID depuis localStorage
            loadUserData(authUid);
        } else if (window.auth && window.auth.currentUser) {
            console.log("Utilisateur connecté via Firebase:", window.auth.currentUser.uid);
            // Charger les données utilisateur à partir de l'objet auth de Firebase
            loadUserData(window.auth.currentUser.uid);
        } else {
            console.log("Aucune authentification trouvée, redirection vers la page de connexion");
            // Rediriger vers la page de connexion
            window.location.href = "app.html";
        }
    }
    
    // Fonction pour charger les données utilisateur
    function loadUserData(userId) {
        if (!userId) {
            console.error("ID utilisateur non fourni pour charger les données");
            return;
        }
        
        console.log("Chargement des données pour l'utilisateur:", userId);
        
        // Charger les matières de l'utilisateur
        loadUserSubjects(userId);
        
        // Charger les plans d'études existants
        loadStudyPlans(userId);
    }
    
    // Écouter l'événement Firebase Ready
    window.addEventListener('firebaseReady', checkAuth);
    
    // Si Firebase est déjà initialisé, vérifier l'authentification
    if (window.auth) {
        checkAuth();
    } else {
        console.log("Firebase non initialisé, attente...");
        // Si Firebase n'est pas encore prêt, on peut mettre en place une vérification différée
        setTimeout(() => {
            if (window.auth) {
                checkAuth();
            } else {
                // Vérifier quand même l'authentification via localStorage
                const authToken = localStorage.getItem('etudlyAuthToken');
                const authUid = localStorage.getItem('etudlyAuthUid');
                
                if (authToken && authUid) {
                    console.log("Tentative de chargement des données via localStorage malgré Firebase non initialisé");
                    loadUserData(authUid);
                }
            }
        }, 1000);
    }
    
    // Charger les matières depuis Firestore
    function loadUserSubjects(userId) {
        if (!userId) return;
        
        if (!window.db) {
            console.error("Firestore non initialisé");
            return;
        }
        
        window.db.collection("users").doc(userId).get()
            .then((doc) => {
                if (doc.exists && doc.data().subjects) {
                    subjects = doc.data().subjects;
                    populateSubjectsDropdown();
                } else {
                    console.log("Pas de matières trouvées pour cet utilisateur");
                }
            })
            .catch((error) => {
                console.error("Erreur lors du chargement des matières:", error);
            });
    }
    
    // Remplir le dropdown des matières
    function populateSubjectsDropdown() {
        // Vider le dropdown
        while (examSubjectSelect.options.length > 1) {
            examSubjectSelect.remove(1);
        }
        
        // Ajouter les matières
        subjects.forEach((subject, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = subject.name;
            examSubjectSelect.appendChild(option);
        });
        
        // Activer le bouton si des matières sont disponibles
        if (subjects.length > 0) {
            generatePlanButton.disabled = false;
        }
    }
    
    // Charger les plans d'études existants
    function loadStudyPlans(userId) {
        if (!userId) return;
        
        if (!window.db) {
            console.error("Firestore non initialisé");
            return;
        }
        
        window.db.collection("users").doc(userId).collection("studyPlans").get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    studyPlansSection.style.display = "block";
                    studyPlansList.innerHTML = "";
                    
                    querySnapshot.forEach((doc) => {
                        const plan = doc.data();
                        createStudyPlanItem(doc.id, plan);
                    });
                } else {
                    console.log("Pas de plans d'études trouvés pour cet utilisateur");
                }
            })
            .catch((error) => {
                console.error("Erreur lors du chargement des plans d'études:", error);
            });
    }
    
    // Créer un élément de plan d'études dans la liste
    function createStudyPlanItem(planId, plan) {
        const planItem = document.createElement("div");
        planItem.classList.add("study-plan-item");
        planItem.dataset.id = planId;
        
        // Calculer le pourcentage de progression
        const totalSessions = plan.sessions ? plan.sessions.length : 0;
        const completedSessions = plan.sessions ? plan.sessions.filter(session => session.completed).length : 0;
        const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
        
        // Formater les dates
        const examDate = new Date(plan.examDate);
        const formattedExamDate = examDate.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        
        planItem.innerHTML = `
            <div class="plan-header">
                <h3 class="plan-title">${plan.subject}</h3>
                <span class="plan-date">Examen le ${formattedExamDate}</span>
            </div>
            <div class="plan-progress">
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-text">
                    <span>${completedSessions} sur ${totalSessions} sessions terminées</span>
                    <span>${Math.round(progressPercentage)}%</span>
                </div>
            </div>
        `;
        
        // Ajouter un événement de clic pour afficher les détails
        planItem.addEventListener("click", () => {
            showPlanDetails(planId, plan);
        });
        
        studyPlansList.appendChild(planItem);
    }
    
    // Afficher les détails d'un plan d'études
    function showPlanDetails(planId, plan) {
        document.getElementById("plan-title").textContent = plan.subject;
        
        // Formater les dates
        const examDate = new Date(plan.examDate);
        const startDate = new Date(plan.startDate);
        
        document.getElementById("plan-start-date").textContent = startDate.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long"
        });
        
        document.getElementById("plan-end-date").textContent = examDate.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        
        // Afficher les sessions d'étude
        const planSessions = document.getElementById("plan-sessions");
        planSessions.innerHTML = "";
        
        if (plan.sessions && plan.sessions.length > 0) {
            plan.sessions.forEach((session, index) => {
                const sessionItem = document.createElement("div");
                sessionItem.classList.add("session-item");
                
                if (session.completed) {
                    sessionItem.classList.add("session-completed");
                }
                
                const sessionDate = new Date(session.date);
                const formattedSessionDate = sessionDate.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                });
                
                sessionItem.innerHTML = `
                    <div class="session-header">
                        <h4 class="session-title">${session.title}</h4>
                        <span class="session-date">${formattedSessionDate}</span>
                    </div>
                    <div class="session-content">
                        <p>${session.content}</p>
                    </div>
                    <div class="session-actions">
                        <label class="checkbox-container">
                            <input type="checkbox" ${session.completed ? 'checked' : ''} 
                                   onchange="toggleSessionComplete('${planId}', ${index}, this.checked)">
                            <span class="checkmark"></span>
                            Terminé
                        </label>
                    </div>
                `;
                
                planSessions.appendChild(sessionItem);
            });
        } else {
            planSessions.innerHTML = "<p>Aucune session d'étude n'a été créée pour ce plan.</p>";
        }
        
        // Afficher le popup
        planDetailsPopup.style.display = "flex";
        planDetailsPopup.classList.add("active");
    }
    
    // Fonction globale pour marquer une session comme terminée/non terminée
    window.toggleSessionComplete = function(planId, sessionIndex, completed) {
        // Obtenir l'ID utilisateur soit de Firebase soit de localStorage
        const userId = window.auth && window.auth.currentUser 
            ? window.auth.currentUser.uid 
            : localStorage.getItem('etudlyAuthUid');
            
        if (!userId) {
            console.error("Impossible de mettre à jour la session: utilisateur non identifié");
            return;
        }
        
        if (!window.db) {
            console.error("Firestore non initialisé");
            return;
        }
        
        const planRef = window.db.collection("users").doc(userId).collection("studyPlans").doc(planId);
        
        planRef.get().then((doc) => {
            if (doc.exists) {
                const plan = doc.data();
                if (plan.sessions && plan.sessions[sessionIndex]) {
                    plan.sessions[sessionIndex].completed = completed;
                    
                    return planRef.update({
                        sessions: plan.sessions
                    }).then(() => {
                        // Mettre à jour la liste des plans d'études
                        loadStudyPlans(userId);
                    });
                }
            }
        }).catch((error) => {
            console.error("Erreur lors de la mise à jour de la session:", error);
        });
    };
    
    // Fermer le popup de détails
    planDetailsClose.addEventListener("click", () => {
        planDetailsPopup.classList.remove("active");
        setTimeout(() => {
            planDetailsPopup.style.display = "none";
        }, 300);
    });
    
    // Gestionnaire pour le bouton d'upload
    uploadButton.addEventListener("click", () => {
        fileInput.click();
    });
    
    // Gestionnaire pour le changement de fichier
    fileInput.addEventListener("change", handleFileSelection);
    
    // Gestionnaire pour le glisser-déposer
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        documentDropzone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        documentDropzone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        documentDropzone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        documentDropzone.classList.add('dragover');
    }
    
    function unhighlight() {
        documentDropzone.classList.remove('dragover');
    }
    
    documentDropzone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Gérer la sélection de fichiers
    function handleFileSelection(e) {
        const files = e.target.files;
        handleFiles(files);
    }
    
    // Traiter les fichiers sélectionnés
    function handleFiles(files) {
        if (files.length === 0) return;
        
        // Convertir FileList en array
        const filesArray = Array.from(files);
        
        // Filtrer les fichiers valides
        const validFiles = filesArray.filter(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            const validExtensions = ['pdf', 'docx', 'doc', 'txt'];
            const isValidExtension = validExtensions.includes(extension);
            const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB max
            
            return isValidExtension && isValidSize;
        });
        
        // Ajouter les fichiers valides à la liste et les afficher
        validFiles.forEach(file => {
            uploadedFiles.push({
                file: file,
                name: file.name,
                size: file.size,
                status: 'pending'
            });
            
            // Afficher le fichier dans la liste
            displayFile(uploadedFiles.length - 1);
        });
        
        // Activer le bouton de génération si des fichiers sont disponibles
        if (uploadedFiles.length > 0 && subjects.length > 0) {
            generatePlanButton.disabled = false;
        }
        
        // Réinitialiser l'input pour permettre de sélectionner à nouveau les mêmes fichiers
        fileInput.value = '';
    }
    
    // Afficher un fichier dans la liste
    function displayFile(fileIndex) {
        const fileData = uploadedFiles[fileIndex];
        const extension = fileData.name.split('.').pop().toLowerCase();
        
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.dataset.index = fileIndex;
        
        // Déterminer l'icône en fonction de l'extension
        let iconPath;
        switch (extension) {
            case 'pdf':
                iconPath = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
                break;
            case 'docx':
            case 'doc':
                iconPath = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
                break;
            default:
                iconPath = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
        }
        
        // Formater la taille du fichier
        const fileSizeFormatted = formatFileSize(fileData.size);
        
        fileItem.innerHTML = `
            <div class="file-icon">${iconPath}</div>
            <div class="file-info">
                <div class="file-name">${fileData.name}</div>
                <div class="file-size">${fileSizeFormatted}</div>
            </div>
            <div class="file-status ${fileData.status}">${getStatusText(fileData.status)}</div>
            <div class="file-actions">
                <button class="file-delete" onclick="removeFile(${fileIndex})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        
        uploadedFilesList.appendChild(fileItem);
    }
    
    // Formater la taille du fichier
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    // Obtenir le texte du statut
    function getStatusText(status) {
        switch (status) {
            case 'pending': return 'En attente';
            case 'uploading': return 'Téléchargement...';
            case 'success': return 'Téléchargé';
            case 'error': return 'Erreur';
            default: return '';
        }
    }
    
    // Fonction globale pour supprimer un fichier
    window.removeFile = function(fileIndex) {
        if (fileIndex >= 0 && fileIndex < uploadedFiles.length) {
            // Supprimer le fichier de la liste
            uploadedFiles.splice(fileIndex, 1);
            
            // Rafraîchir l'affichage
            refreshFilesList();
            
            // Désactiver le bouton de génération s'il n'y a plus de fichiers
            if (uploadedFiles.length === 0) {
                generatePlanButton.disabled = true;
            }
        }
    };
    
    // Rafraîchir la liste des fichiers
    function refreshFilesList() {
        uploadedFilesList.innerHTML = '';
        uploadedFiles.forEach((_, index) => {
            displayFile(index);
        });
    }
    
    // Soumettre le formulaire pour générer un plan d'études
    document.getElementById("exam-details-form").addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Obtenir l'ID utilisateur soit de Firebase soit de localStorage
        const userId = window.auth && window.auth.currentUser 
            ? window.auth.currentUser.uid 
            : localStorage.getItem('etudlyAuthUid');
            
        if (!userId) {
            console.error("Impossible de créer un plan d'études: utilisateur non identifié");
            alert("Vous devez être connecté pour créer un plan d'études.");
            return;
        }
        
        const subjectIndex = examSubjectSelect.value;
        
        if (subjectIndex === "" || !subjects[subjectIndex]) {
            alert("Veuillez sélectionner une matière.");
            return;
        }
        
        // Récupérer les données du formulaire
        const subjectName = subjects[subjectIndex].name;
        const examDate = examDateInput.value;
        const studyHours = parseFloat(studyHoursInput.value);
        const difficultyLevel = parseInt(document.getElementById("difficulty-level").value);
        
        // Récupérer les jours d'étude sélectionnés
        const studyDays = [];
        if (document.getElementById("monday").checked) studyDays.push(1); // Lundi
        if (document.getElementById("tuesday").checked) studyDays.push(2); // Mardi
        if (document.getElementById("wednesday").checked) studyDays.push(3); // Mercredi
        if (document.getElementById("thursday").checked) studyDays.push(4); // Jeudi
        if (document.getElementById("friday").checked) studyDays.push(5); // Vendredi
        if (document.getElementById("saturday").checked) studyDays.push(6); // Samedi
        if (document.getElementById("sunday").checked) studyDays.push(0); // Dimanche
        
        if (studyDays.length === 0) {
            alert("Veuillez sélectionner au moins un jour d'étude.");
            return;
        }
        
        // Désactiver le bouton pendant le traitement
        generatePlanButton.disabled = true;
        generatePlanButton.textContent = "Traitement en cours...";
        
        // Simuler la génération d'un plan d'études
        // Note: Dans une implémentation réelle, cette partie serait plus complexe
        // et impliquerait l'analyse des documents téléchargés
        
        // Date de début (aujourd'hui)
        const startDate = new Date().toISOString();
        
        // Créer un plan d'études simple avec des sessions génériques
        const studyPlan = {
            subject: subjectName,
            startDate: startDate,
            examDate: examDate,
            studyHours: studyHours,
            difficultyLevel: difficultyLevel,
            studyDays: studyDays,
            sessions: []
        };
        
        // Générer des sessions d'étude fictives
        // (à remplacer par un vrai algorithme basé sur l'analyse des documents)
        const today = new Date();
        const examDay = new Date(examDate);
        const daysUntilExam = Math.floor((examDay - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExam <= 0) {
            alert("La date d'examen doit être future.");
            generatePlanButton.disabled = false;
            generatePlanButton.textContent = "Générer mon plan d'études";
            return;
        }
        
        // Créer des sessions d'étude simplifiées
        const sessionTopics = [
            "Introduction et concepts de base",
            "Révision des principes fondamentaux",
            "Approfondissement des notions clés",
            "Exercices pratiques",
            "Synthèse et préparation finale"
        ];
        
        // Répartir les sessions sur les jours disponibles jusqu'à l'examen
        let currentDate = new Date(today);
        let sessionIndex = 0;
        
        while (currentDate < examDay) {
            // Vérifier si le jour est un jour d'étude sélectionné
            if (studyDays.includes(currentDate.getDay())) {
                const sessionTopic = sessionTopics[sessionIndex % sessionTopics.length];
                
                studyPlan.sessions.push({
                    title: `Session ${studyPlan.sessions.length + 1}: ${sessionTopic}`,
                    date: new Date(currentDate).toISOString(),
                    content: `Étude de ${sessionTopic.toLowerCase()} pendant ${studyHours} heures.`,
                    duration: studyHours,
                    completed: false
                });
                
                sessionIndex++;
            }
            
            // Passer au jour suivant
            currentDate.setDate(currentDate.getDate() + 1);
            
            // Limiter le nombre de sessions pour la démo
            if (studyPlan.sessions.length >= 10) break;
        }
        
        // Vérifier si Firestore est initialisé
        if (!window.db) {
            console.error("Firestore non initialisé");
            alert("Une erreur s'est produite. Veuillez réessayer ultérieurement.");
            generatePlanButton.disabled = false;
            generatePlanButton.textContent = "Générer mon plan d'études";
            return;
        }
        
        // Sauvegarder le plan d'études dans Firestore
        window.db.collection("users").doc(userId).collection("studyPlans").add(studyPlan)
            .then((docRef) => {
                console.log("Plan d'études créé avec ID:", docRef.id);
                
                // Charger les plans d'études
                loadStudyPlans(userId);
                
                // Réinitialiser le formulaire
                document.getElementById("exam-details-form").reset();
                
                // Réactiver le bouton
                generatePlanButton.disabled = false;
                generatePlanButton.textContent = "Générer mon plan d'études";
                
                // Afficher un message de succès
                alert("Plan d'études créé avec succès!");
            })
            .catch((error) => {
                console.error("Erreur lors de la création du plan d'études:", error);
                
                // Réactiver le bouton
                generatePlanButton.disabled = false;
                generatePlanButton.textContent = "Générer mon plan d'études";
                
                // Afficher un message d'erreur
                alert("Une erreur s'est produite lors de la création du plan d'études.");
            });
    });
    
    // Définir une date minimum pour l'examen (aujourd'hui)
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    examDateInput.min = formattedToday;
    
    // Gestion de la barre latérale en mode mobile
    const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
        
        // Fermer la barre latérale si on clique en dehors
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && event.target !== toggleSidebarBtn && window.innerWidth <= 768) {
                sidebar.classList.remove('show');
            }
        });
    }
});