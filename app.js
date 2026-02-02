document.addEventListener("DOMContentLoaded", () => {
    // Hacer subjects global para acceder desde las funciones de autenticación
    window.subjects = [];

    // Sistema de calificación - por defecto /20 (Francia)
    // Valores posibles: 20, 100, 10
    window.gradingScale = 20;

    // Hacer todas las funciones globales para que estén disponibles desde cualquier script
    window.renderSubjects = renderSubjects;
    window.updateFinalScore = updateFinalScore;
    window.showSubjectDetails = showSubjectDetails;
    window.calculateSubjectScore = calculateSubjectScore;
    window.setGradingScale = setGradingScale;
    window.getGradingScale = getGradingScale;
    
    // Main page elements
    const mainPage = document.getElementById("calculator-page");
    const addSubjectBtn = document.getElementById("add-subject");
    const subjectList = document.getElementById("subject-list");
    const finalScore = document.getElementById("final-score");
    const progressBar = document.getElementById("progress-bar");
    
    // Subject details page elements
    const subjectDetailsPage = document.getElementById("subject-details-page");
    const backToMainBtn = document.getElementById("back-to-main");
    const subjectDetailsTitle = document.getElementById("subject-details-title");
    const subjectCurrentScore = document.getElementById("subject-current-score");
    const subjectGradesList = document.getElementById("subject-grades-list");
    const addGradeInDetailsBtn = document.getElementById("add-grade-in-details");
    
    // Subject Popup Elements
    const subjectPopup = document.getElementById("subject-popup");
    const subjectPopupSubmit = document.getElementById("subject-popup-submit");
    const subjectPopupClose = document.getElementById("subject-popup-close");
    
    // Grade Popup Elements
    const gradePopup = document.getElementById("grade-popup");
    const gradePopupSubmit = document.getElementById("grade-popup-submit");
    const gradePopupClose = document.getElementById("grade-popup-close");

    // Grading Scale Popup Elements
    const gradingScaleBtn = document.getElementById("grading-scale-btn");
    const gradingScalePopup = document.getElementById("grading-scale-popup");
    const gradingScaleClose = document.getElementById("grading-scale-close");
    const scaleOptions = document.querySelectorAll(".scale-option");

    let currentSubjectIndex = -1;
    let editingSubjectIndex = -1; // Para seguir si estamos editando una materia existente
    let editingGradeIndex = -1; // Pour suivre si nous modifions une note existante


   

// Ajoutez aussi un listener pour fermer la barre latérale en cliquant en dehors
document.addEventListener('click', function(event) {

     // Gestion de la barre latérale en mode mobile
     const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
     const sidebar = document.querySelector('.sidebar');
 
     if (toggleSidebarBtn) {
         toggleSidebarBtn.addEventListener('click', function() {
             sidebar.classList.toggle('show');
         });
     }
 
     // Fermer la barre latérale lorsqu'on clique sur un élément du menu en mode mobile
     const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
     sidebarLinks.forEach(link => {
         link.addEventListener('click', function() {
             if (window.innerWidth <= 768) {
                 sidebar.classList.remove('show');
             }
         });
     });
});

// Gestion du bouton retour sur mobile pour fermer la sidebar
window.addEventListener('popstate', function(event) {
    if (window.innerWidth <= 768 && sidebar.classList.contains('show')) {
        event.preventDefault();
        sidebar.classList.remove('show');
        history.pushState(null, document.title, window.location.href);
    }
});

// On crée un état initial pour pouvoir revenir en arrière
history.pushState(null, document.title, window.location.href);







    // Create progress bar inner div
    const progressBarInner = document.createElement("div");
    progressBar.appendChild(progressBarInner);
    

    // Modificar el evento click del botón "Añadir materia" para resetear el formulario
    addSubjectBtn.addEventListener("click", () => {
        // Resetear el índice de edición
        editingSubjectIndex = -1;
        
        // Cambiar el título y el botón según corresponda
        document.querySelector("#subject-popup-form h3").textContent = "Ajouter un Cours";
        document.getElementById("subject-popup-submit").textContent = "Ajouter";
        
        // Resetear el formulario
        document.getElementById("subject-name").value = "";
        document.getElementById("subject-percentage").value = "";
        document.getElementById("other-subject-percentage").style.display = "none";
        
        // Deseleccionar todos los botones de porcentaje
        document.querySelectorAll('.subject-percentage-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.weighting-btn')[0].click(); // Seleccionar porcentaje por defecto
        document.querySelectorAll('.color-btn')[0].click(); // Seleccionar primer color por defecto
        
        // Mostrar el popup
        subjectPopup.style.display = "flex";
        subjectPopup.classList.add("active");
    });

    // Close subject popup
    subjectPopupClose.addEventListener("click", () => {
        subjectPopup.classList.remove("active");
        setTimeout(() => {
            subjectPopup.style.display = "none";
        }, 300);
    });

    // Back to main page
    backToMainBtn.addEventListener("click", () => {
        subjectDetailsPage.style.display = "none";
        mainPage.style.display = "block";
        renderSubjects();
    });

    // Open grade popup from subject details page
    addGradeInDetailsBtn.addEventListener("click", () => {
        // Reset editing state
        editingGradeIndex = -1;

        // Change popup title
        document.querySelector("#grade-popup-form h3").textContent = "Ajouter une Note";
        document.getElementById("grade-popup-submit").textContent = "Ajouter";

        // Actualizar el label del input según la escala actual
        updateGradeInputLabel();

        gradePopup.style.display = "flex";
        gradePopup.classList.add("active");

        // Reset form
        document.getElementById("grade-name").value = "";
        document.getElementById("grade-value").value = "";
        document.getElementById("other-grade-percentage").style.display = "none";
        document.getElementById("grade-percentage").value = "";

        // Deselect all percentage buttons
        document.querySelectorAll('.grade-percentage-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    });

    // Close grade popup
    gradePopupClose.addEventListener("click", () => {
        gradePopup.classList.remove("active");
        setTimeout(() => {
            gradePopup.style.display = "none";
        }, 300);
    });

    // Open grading scale popup
    if (gradingScaleBtn) {
        gradingScaleBtn.addEventListener("click", () => {
            // Marcar la opción activa actual
            scaleOptions.forEach(opt => {
                opt.classList.remove("active");
                if (parseInt(opt.dataset.scale) === window.gradingScale) {
                    opt.classList.add("active");
                }
            });
            gradingScalePopup.style.display = "flex";
            gradingScalePopup.classList.add("active");
        });
    }

    // Close grading scale popup
    if (gradingScaleClose) {
        gradingScaleClose.addEventListener("click", () => {
            gradingScalePopup.classList.remove("active");
            setTimeout(() => {
                gradingScalePopup.style.display = "none";
            }, 300);
        });
    }

    // Handle scale option selection
    scaleOptions.forEach(option => {
        option.addEventListener("click", () => {
            const newScale = parseInt(option.dataset.scale);
            setGradingScale(newScale);

            // Actualizar UI del popup
            scaleOptions.forEach(opt => opt.classList.remove("active"));
            option.classList.add("active");

            // Cerrar popup después de seleccionar
            setTimeout(() => {
                gradingScalePopup.classList.remove("active");
                setTimeout(() => {
                    gradingScalePopup.style.display = "none";
                }, 300);
            }, 200);
        });
    });

    // Función para cambiar el sistema de calificación
    function setGradingScale(scale) {
        window.gradingScale = scale;

        // Actualizar el label del botón
        const scaleLabel = document.getElementById("current-scale-label");
        if (scaleLabel) {
            if (scale === 100) {
                scaleLabel.textContent = "%";
            } else {
                scaleLabel.textContent = "/" + scale;
            }
        }

        // Actualizar el label del score final
        const finalScaleLabel = document.getElementById("final-score-scale");
        if (finalScaleLabel) {
            if (scale === 100) {
                finalScaleLabel.textContent = "%";
            } else {
                finalScaleLabel.textContent = "/" + scale;
            }
        }

        // Actualizar el label del input de nota en el popup
        updateGradeInputLabel();

        // Re-renderizar todo con la nueva escala
        renderSubjects();

        // Si estamos viendo detalles de una materia, actualizar también
        if (currentSubjectIndex !== -1 && window.subjects[currentSubjectIndex]) {
            showSubjectDetails(window.subjects[currentSubjectIndex]);
        }

        // Guardar preferencia en Firestore
        if (typeof auth !== 'undefined' && auth && auth.currentUser) {
            saveGradingScalePreference(scale);
        }
    }

    // Función para obtener el sistema de calificación actual
    function getGradingScale() {
        return window.gradingScale;
    }

    // Función para actualizar el label del input de nota
    function updateGradeInputLabel() {
        const label = document.getElementById("grade-value-label");
        const input = document.getElementById("grade-value");
        if (label && input) {
            if (window.gradingScale === 100) {
                label.textContent = "Note (%)";
            } else {
                label.textContent = "Note (/" + window.gradingScale + "):";
            }
            input.max = window.gradingScale;
        }
    }

    // Función para convertir una nota de escala /20 a la escala actual
    function convertFromBase(value) {
        return (value / 20) * window.gradingScale;
    }

    // Función para convertir una nota de la escala actual a /20 (para almacenamiento)
    function convertToBase(value) {
        return (value / window.gradingScale) * 20;
    }

    // Función para formatear la nota según la escala actual
    function formatGrade(valueIn20) {
        const converted = convertFromBase(valueIn20);
        if (window.gradingScale === 100) {
            return converted.toFixed(1) + "%";
        } else {
            return converted.toFixed(2) + "/" + window.gradingScale;
        }
    }

    // Función para guardar la preferencia de escala en Firestore
    function saveGradingScalePreference(scale) {
        if (typeof db === 'undefined' || !db) return;

        const userId = auth.currentUser.uid;
        const userRef = db.collection('users').doc(userId);

        userRef.update({
            gradingScale: scale
        }).then(() => {
            console.log("Preferencia de escala guardada:", scale);
        }).catch((error) => {
            console.error("Error al guardar preferencia de escala:", error);
        });
    }

    // Función para cargar la preferencia de escala desde Firestore
    function loadGradingScalePreference() {
        if (typeof db === 'undefined' || !db) return;
        if (typeof auth === 'undefined' || !auth || !auth.currentUser) return;

        const userId = auth.currentUser.uid;
        const userRef = db.collection('users').doc(userId);

        userRef.get().then((doc) => {
            if (doc.exists && doc.data().gradingScale) {
                const scale = doc.data().gradingScale;
                window.gradingScale = scale;

                // Actualizar UI del botón
                const scaleLabel = document.getElementById("current-scale-label");
                if (scaleLabel) {
                    if (scale === 100) {
                        scaleLabel.textContent = "%";
                    } else {
                        scaleLabel.textContent = "/" + scale;
                    }
                }

                // Actualizar label del score final
                const finalScaleLabel = document.getElementById("final-score-scale");
                if (finalScaleLabel) {
                    if (scale === 100) {
                        finalScaleLabel.textContent = "%";
                    } else {
                        finalScaleLabel.textContent = "/" + scale;
                    }
                }

                updateGradeInputLabel();

                // Re-renderizar con la escala cargada
                if (typeof window.renderSubjects === 'function') {
                    renderSubjects();
                }
            }
        }).catch((error) => {
            console.error("Error al cargar preferencia de escala:", error);
        });
    }

    // Hacer loadGradingScalePreference global
    window.loadGradingScalePreference = loadGradingScalePreference;

    // Gestion de la sélection de type de pondération
    const weightingTypeButtons = document.querySelectorAll('.weighting-btn');
    const percentageSection = document.getElementById('percentage-section');
    const creditsSection = document.getElementById('credits-section');
    const otherCreditsInput = document.getElementById('other-credits');

    weightingTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            weightingTypeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.type === 'percentage') {
                percentageSection.style.display = 'block';
                creditsSection.style.display = 'none';
            } else {
                percentageSection.style.display = 'none';
                creditsSection.style.display = 'block';
            }
        });
    });

    // Gestion de crédits
    const creditButtons = document.querySelectorAll('.credits-btn');
    creditButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            creditButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.other === 'true') {
                otherCreditsInput.style.display = 'block';
            } else {
                otherCreditsInput.style.display = 'none';
            }
        });
    });

    // Gestion de pourcentages des matières
    const subjectPercentageButtons = document.querySelectorAll('.subject-percentage-btn');
    const otherSubjectPercentageInput = document.getElementById('other-subject-percentage');
    subjectPercentageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            subjectPercentageButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.other === 'true') {
                otherSubjectPercentageInput.style.display = 'block';
            } else {
                otherSubjectPercentageInput.style.display = 'none';
                // Set the value to the selected percentage
                document.getElementById('subject-percentage').value = btn.dataset.percentage;
            }
        });
    });

    // Gestion de couleurs
    const colorButtons = document.querySelectorAll('.color-btn');
    const otherColorInput = document.getElementById('other-color');
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.other === 'true') {
                otherColorInput.style.display = 'block';
            } else {
                otherColorInput.style.display = 'none';
            }
        });
    });
    
    // Gestion de pourcentages des notes
    const gradePercentageButtons = document.querySelectorAll('.grade-percentage-btn');
    const otherGradePercentageInput = document.getElementById('other-grade-percentage');
    gradePercentageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            gradePercentageButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.other === 'true') {
                otherGradePercentageInput.style.display = 'block';
            } else {
                otherGradePercentageInput.style.display = 'none';
                // Set the value to the selected percentage
                document.getElementById('grade-percentage').value = btn.dataset.percentage;
            }
        });
    });

    // Modificar el evento submit del popup de materia para manejar edición
    subjectPopupSubmit.addEventListener('click', () => {
        const name = document.getElementById('subject-name').value;
        const weightingType = document.querySelector('.weighting-btn.active').dataset.type;
        let weight, color;

        if (weightingType === 'percentage') {
            // Check if a percentage button is active
            const activePercentageBtn = document.querySelector('.subject-percentage-btn.active');
            
            if (activePercentageBtn) {
                if (activePercentageBtn.dataset.other === 'true') {
                    weight = parseFloat(document.getElementById('other-subject-percentage').value);
                } else {
                    weight = parseFloat(activePercentageBtn.dataset.percentage);
                }
            } else {
                // Fallback to input value if no button is active
                weight = parseFloat(document.getElementById('subject-percentage').value);
            }
        } else {
            const creditsBtn = document.querySelector('.credits-btn.active');
            weight = creditsBtn.dataset.other === 'true' 
                ? parseFloat(document.getElementById('other-credits').value) 
                : parseFloat(creditsBtn.dataset.credits);
        }

        const colorBtn = document.querySelector('.color-btn.active');
        color = colorBtn.dataset.other === 'true'
            ? document.getElementById('other-color').value
            : colorBtn.style.backgroundColor;

        if (name && weight && color) {
            const subject = { 
                name, 
                weight, 
                weightingType, 
                color, 
                grades: [] 
            };
            
            if (editingSubjectIndex !== -1) {
                // Estamos editando una materia existente
                // Preservar las calificaciones existentes
                subject.grades = window.subjects[editingSubjectIndex].grades;
                window.subjects[editingSubjectIndex] = subject;
                editingSubjectIndex = -1; // Resetear el índice de edición
            } else {
                // Estamos añadiendo una nueva materia
                window.subjects.push(subject);
            }
            
            renderSubjects();
            
            // Guardar en Firebase
            if (auth && auth.currentUser) {
                saveUserData();
            }
            
            // Cerrar popup con animación
            subjectPopup.classList.remove("active");
            setTimeout(() => {
                subjectPopup.style.display = "none";
            }, 300);
        } else {
            alert('Veuillez remplir tous les champs correctement.');
        }
    });

    // Add or update grade from popup - MODIFICADO para Firebase
    gradePopupSubmit.addEventListener('click', () => {
        const gradeName = document.getElementById('grade-name').value;
        const gradeValueInput = parseFloat(document.getElementById('grade-value').value);

        // Get percentage value either from selected button or custom input
        let gradePercentage;
        const activePercentageBtn = document.querySelector('.grade-percentage-btn.active');

        if (activePercentageBtn) {
            if (activePercentageBtn.dataset.other === 'true') {
                gradePercentage = parseFloat(document.getElementById('other-grade-percentage').value);
            } else {
                gradePercentage = parseFloat(activePercentageBtn.dataset.percentage);
            }
        } else {
            // Fallback to input value if no button is active
            gradePercentage = parseFloat(document.getElementById('grade-percentage').value);
        }

        // Convertir la nota de la escala actual a /20 para almacenamiento
        const gradeValue = convertToBase(gradeValueInput);

        if (currentSubjectIndex !== -1 && gradeName &&
            !isNaN(gradeValueInput) && gradeValueInput >= 0 && gradeValueInput <= window.gradingScale &&
            !isNaN(gradePercentage) && gradePercentage > 0) {

            const grade = {
                name: gradeName,
                value: gradeValue, // Guardado en escala /20
                percentage: gradePercentage
            };

            if (editingGradeIndex !== -1) {
                // Modification d'une note existante
                window.subjects[currentSubjectIndex].grades[editingGradeIndex] = grade;
            } else {
                // Ajout d'une nouvelle note
                window.subjects[currentSubjectIndex].grades.push(grade);
            }
            
            showSubjectDetails(window.subjects[currentSubjectIndex]);
            
            // Nuevo: Guardar en Firebase
            if (auth && auth.currentUser) {
                saveUserData();
            }
            
            // Close popup with animation
            gradePopup.classList.remove("active");
            setTimeout(() => {
                gradePopup.style.display = "none";
            }, 300);
        } else {
            alert('Veuillez remplir tous les champs correctement.');
        }
    });

    // Función para abrir el popup para modificar una materia
    function openEditSubjectPopup(subjectIndex) {
        if (subjectIndex >= 0) {
            const subject = window.subjects[subjectIndex];
            editingSubjectIndex = subjectIndex;
            
            // Cambiar título del popup y botón
            document.querySelector("#subject-popup-form h3").textContent = "Modifier le Cours";
            document.getElementById("subject-popup-submit").textContent = "Enregistrer";
            
            // Rellenar el formulario con los datos de la materia
            document.getElementById("subject-name").value = subject.name;
            
            // Seleccionar el tipo de ponderación correcto
            const weightingButtons = document.querySelectorAll('.weighting-btn');
            weightingButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === subject.weightingType) {
                    btn.classList.add('active');
                    
                    // Mostrar la sección correspondiente
                    if (subject.weightingType === 'percentage') {
                        document.getElementById('percentage-section').style.display = 'block';
                        document.getElementById('credits-section').style.display = 'none';
                    } else {
                        document.getElementById('percentage-section').style.display = 'none';
                        document.getElementById('credits-section').style.display = 'block';
                    }
                }
            });
            
            // Manejar la selección del valor de ponderación
            if (subject.weightingType === 'percentage') {
                document.getElementById('subject-percentage').value = subject.weight;
                
                // Intentar seleccionar el botón de porcentaje correspondiente
                let percentageButtonFound = false;
                document.querySelectorAll('.subject-percentage-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.percentage == subject.weight) {
                        btn.classList.add('active');
                        percentageButtonFound = true;
                    }
                });
                
                // Si no se encontró un botón exacto, seleccionar "Otro"
                if (!percentageButtonFound) {
                    const otherBtn = document.querySelector('.subject-percentage-btn[data-other="true"]');
                    if (otherBtn) {
                        otherBtn.classList.add('active');
                        document.getElementById("other-subject-percentage").style.display = "block";
                        document.getElementById("other-subject-percentage").value = subject.weight;
                    }
                } else {
                    document.getElementById("other-subject-percentage").style.display = "none";
                }
            } else {
                // Manejar créditos ECTS
                let creditsButtonFound = false;
                document.querySelectorAll('.credits-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.credits == subject.weight) {
                        btn.classList.add('active');
                        creditsButtonFound = true;
                    }
                });
                
                // Si no se encontró un botón exacto, seleccionar "Otro"
                if (!creditsButtonFound) {
                    const otherBtn = document.querySelector('.credits-btn[data-other="true"]');
                    if (otherBtn) {
                        otherBtn.classList.add('active');
                        document.getElementById("other-credits").style.display = "block";
                        document.getElementById("other-credits").value = subject.weight;
                    }
                } else {
                    document.getElementById("other-credits").style.display = "none";
                }
            }
            
            // Manejar la selección del color
            let colorButtonFound = false;
            document.querySelectorAll('.color-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.style.backgroundColor === subject.color) {
                    btn.classList.add('active');
                    colorButtonFound = true;
                }
            });
            
            // Si no se encontró un color exacto, seleccionar "Otro"
            if (!colorButtonFound) {
                const otherBtn = document.querySelector('.color-btn[data-other="true"]');
                if (otherBtn) {
                    otherBtn.classList.add('active');
                    document.getElementById("other-color").style.display = "block";
                    document.getElementById("other-color").value = subject.color;
                }
            } else {
                document.getElementById("other-color").style.display = "none";
            }
            
            // Mostrar el popup
            subjectPopup.style.display = "flex";
            subjectPopup.classList.add("active");
        }
    }

    // Función para abrir el popup para editar una nota
    function openEditGradePopup(gradeIndex) {
        if (currentSubjectIndex !== -1 && gradeIndex >= 0) {
            const subject = window.subjects[currentSubjectIndex];
            const grade = subject.grades[gradeIndex];
            editingGradeIndex = gradeIndex;

            // Cambiar título del popup y botón
            document.querySelector("#grade-popup-form h3").textContent = "Modifier la Note";
            document.getElementById("grade-popup-submit").textContent = "Enregistrer";

            // Actualizar el label del input según la escala actual
            updateGradeInputLabel();

            // Rellenar el formulario (convertir de /20 a la escala actual)
            document.getElementById("grade-name").value = grade.name;
            document.getElementById("grade-value").value = convertFromBase(grade.value).toFixed(2);
            document.getElementById("grade-percentage").value = grade.percentage;
            
            // Intentar seleccionar el botón de porcentaje correspondiente
            let percentageButtonFound = false;
            document.querySelectorAll('.grade-percentage-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.percentage == grade.percentage) {
                    btn.classList.add('active');
                    percentageButtonFound = true;
                }
            });
            
            // Si no se encontró un botón exacto, seleccionar "Otro"
            if (!percentageButtonFound) {
                const otherBtn = document.querySelector('.grade-percentage-btn[data-other="true"]');
                if (otherBtn) {
                    otherBtn.classList.add('active');
                    document.getElementById("other-grade-percentage").style.display = "block";
                    document.getElementById("other-grade-percentage").value = grade.percentage;
                }
            } else {
                document.getElementById("other-grade-percentage").style.display = "none";
            }
            
            // Mostrar el popup
            gradePopup.style.display = "flex";
            gradePopup.classList.add("active");
        }
    }

    // Función para renderizar las materias con botón de editar
    function renderSubjects() {
        console.log("Renderizando materias:", window.subjects);
        subjectList.innerHTML = "";

        if (!window.subjects || window.subjects.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.textContent = "Aucun cours enregistré pour le moment.";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.padding = "20px";
            emptyMessage.style.color = "#6c757d";
            subjectList.appendChild(emptyMessage);
        } else {
            window.subjects.forEach((subject, index) => {
                const div = document.createElement("div");
                div.classList.add("subject-item");
                
                // Set background color to the subject color
                div.style.backgroundColor = subject.color;
                
                // Set text color based on background brightness
                const textColor = getContrastColor(subject.color);
                div.style.color = textColor;
                
                // Calculate subject score
                const subjectScore = calculateSubjectScore(subject);
                
                // Determine status color based on score
                let statusColor;
                if (subjectScore >= 16) statusColor = "#28a745"; // Green for excellent
                else if (subjectScore >= 12) statusColor = "#17a2b8"; // Cyan for good
                else if (subjectScore >= 10) statusColor = "#ffc107"; // Yellow for pass
                else statusColor = "#dc3545"; // Red for fail
                
                // Create a more compact layout
                div.style.display = "flex";
                div.style.justifyContent = "space-between";
                div.style.alignItems = "center";
                
                // Left side with subject info
                const infoSide = document.createElement('div');
                infoSide.style.flex = "1";
                infoSide.innerHTML = `
                    <strong style="font-size: 1.2rem; display: block;">${subject.name}</strong>
                    <span style="color: ${textColor}; opacity: 0.8; font-size: 0.9rem;">
                        ${subject.weightingType === 'percentage' ? `${subject.weight}%` : `${subject.weight} ECTS`}
                    </span>
                `;
                
                // Right side with score, edit and delete buttons
                const actionSide = document.createElement('div');
                actionSide.style.display = "flex";
                actionSide.style.flexDirection = "column";
                actionSide.style.alignItems = "center";
                actionSide.style.marginLeft = "10px";
                
                // Score circle
                const scoreCircle = document.createElement('div');
                scoreCircle.style.width = "60px";
                scoreCircle.style.height = "60px";
                scoreCircle.style.borderRadius = "20%";
                scoreCircle.style.backgroundColor = "white";
                scoreCircle.style.display = "flex";
                scoreCircle.style.flexDirection = "column";
                scoreCircle.style.justifyContent = "center";
                scoreCircle.style.alignItems = "center";
                scoreCircle.style.marginBottom = "8px";
                scoreCircle.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";

                // Convertir la nota a la escala actual
                const displayScore = convertFromBase(subjectScore);
                const scaleLabel = window.gradingScale === 100 ? "%" : "/" + window.gradingScale;

                scoreCircle.innerHTML = `
                    <span style="font-size: 1.2rem; font-weight: bold; color: ${statusColor};">${displayScore.toFixed(1)}</span>
                    <span style="font-size: 0.6rem; color: #666;">${getGradeStatus(subjectScore)}</span>
                `;
                
                // Container for buttons
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = "flex";
                buttonContainer.style.gap = "4px";
                buttonContainer.style.marginBottom = "5px";
                
                // Edit button
                const editBtn = document.createElement("button");
                editBtn.textContent = "Modifier";
                editBtn.style.padding = "4px 8px";
                editBtn.style.backgroundColor = "#007bff";
                editBtn.style.fontSize = "0.75rem";
                editBtn.style.margin = "0";
                
                editBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openEditSubjectPopup(index);
                });
                
                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Supprimer";
                deleteBtn.style.padding = "4px 8px";
                deleteBtn.style.backgroundColor = "#dc3545";
                deleteBtn.style.fontSize = "0.75rem";
                deleteBtn.style.margin = "0";
                
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (confirm(`Êtes-vous sûr de vouloir supprimer "${subject.name}" ?`)) {
                        window.subjects.splice(index, 1);
                        renderSubjects();
                        updateFinalScore();
                        
                        // Guardar en Firebase
                        if (auth && auth.currentUser) {
                            saveUserData();
                        }
                    }
                });
                
                // Append buttons to container
                buttonContainer.appendChild(editBtn);
                buttonContainer.appendChild(deleteBtn);
                
                // Append elements
                actionSide.appendChild(scoreCircle);
                actionSide.appendChild(buttonContainer);
                div.appendChild(infoSide);
                div.appendChild(actionSide);
                
                // Make the div clickable (excluding the edit and delete buttons)
                div.addEventListener("click", (e) => {
                    if (e.target !== editBtn && !editBtn.contains(e.target) && 
                        e.target !== deleteBtn && !deleteBtn.contains(e.target)) {
                        currentSubjectIndex = index;
                        showSubjectDetails(subject);
                    }
                });
                
                subjectList.appendChild(div);
            });
        }

        // Update final score
        updateFinalScore();
        
        // Guardar datos en Firebase después de cada cambio
        if (auth && auth.currentUser) {
            saveUserData();
        }
    }

    // Show subject details when clicked - MODIFICADO para Firebase
function showSubjectDetails(subject) {
        // Ocultar todas las páginas de contenido
        document.querySelectorAll('.content-page').forEach(page => {
            page.style.display = "none";
        });
        
        // Mostrar la página de detalles
        const subjectDetailsPage = document.getElementById("subject-details-page");
        subjectDetailsPage.style.display = "block";
        

        // Set subject title and current score
        document.getElementById("subject-details-title").textContent = subject.name;

        // Calculate and display subject score
        const subjectScore = calculateSubjectScore(subject);

        // Convertir a la escala actual
        const displayScore = convertFromBase(subjectScore);
        const scaleLabel = window.gradingScale === 100 ? "%" : " / " + window.gradingScale;
        document.getElementById("subject-current-score").textContent = `${displayScore.toFixed(2)}${scaleLabel}`;
   
        // Render grades list
        subjectGradesList.innerHTML = "";
        
        if (subject.grades.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.textContent = "Aucune note enregistrée pour ce cours.";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.padding = "20px";
            emptyMessage.style.color = "#6c757d";
            subjectGradesList.appendChild(emptyMessage);
        } else {
            subject.grades.forEach((grade, index) => {
                const gradeDiv = document.createElement("div");
                gradeDiv.classList.add("grade-item");
                
                // Create a more compact layout for grades
                gradeDiv.style.display = "flex";
                gradeDiv.style.justifyContent = "space-between";
                gradeDiv.style.alignItems = "center";
                
                // Add status color based on grade
                let statusColor;
                if (grade.value >= 16) statusColor = "#28a745"; // Green for excellent
                else if (grade.value >= 12) statusColor = "#17a2b8"; // Cyan for good
                else if (grade.value >= 10) statusColor = "#ffc107"; // Yellow for pass
                else statusColor = "#dc3545"; // Red for fail
                
                // Left side with grade info
                const infoSide = document.createElement('div');
                infoSide.style.flex = "1";
                infoSide.innerHTML = `
                    <strong style="display: block; margin-bottom: 3px;">${grade.name}</strong>
                    <span style="font-size: 0.85rem; color: #6c757d;">${grade.percentage}%</span>
                `;
                
                // Middle with grade value (convertir a la escala actual)
                const displayGradeValue = convertFromBase(grade.value);
                const gradeValueDisplay = document.createElement('div');
                gradeValueDisplay.style.display = "flex";
                gradeValueDisplay.style.alignItems = "center";
                gradeValueDisplay.style.justifyContent = "center";
                gradeValueDisplay.style.width = "40px";
                gradeValueDisplay.style.height = "40px";
                gradeValueDisplay.style.borderRadius = "20%";
                gradeValueDisplay.style.backgroundColor = statusColor;
                gradeValueDisplay.style.color = "white";
                gradeValueDisplay.style.fontWeight = "bold";
                gradeValueDisplay.style.marginRight = "10px";
                gradeValueDisplay.textContent = displayGradeValue.toFixed(1);
                
                // Right side with action buttons
                const actionSide = document.createElement('div');
                actionSide.style.display = "flex";
                
                // Edit button
                const editBtn = document.createElement("button");
                editBtn.textContent = "Modifier";
                editBtn.style.padding = "4px 8px";
                editBtn.style.backgroundColor = "#007bff";
                editBtn.style.fontSize = "0.75rem";
                editBtn.style.marginRight = "5px";
                
                editBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openEditGradePopup(index);
                });
                
                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Supprimer";
                deleteBtn.style.padding = "4px 8px";
                deleteBtn.style.backgroundColor = "#dc3545";
                deleteBtn.style.fontSize = "0.75rem";
                
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (confirm(`Êtes-vous sûr de vouloir supprimer cette note ?`)) {
                        subject.grades.splice(index, 1);
                        showSubjectDetails(subject);
                        updateFinalScore();
                        
                        // Nuevo: Guardar en Firebase
                        if (auth && auth.currentUser) {
                            saveUserData();
                        }
                    }
                });
                
                // Append buttons to action side
                actionSide.appendChild(editBtn);
                actionSide.appendChild(deleteBtn);
                
                // Append all sections to the grade div
                gradeDiv.appendChild(infoSide);
                gradeDiv.appendChild(gradeValueDisplay);
                gradeDiv.appendChild(actionSide);
                
                subjectGradesList.appendChild(gradeDiv);
            });
        }
        
        // Guardar datos en Firebase después de cada cambio
        if (auth && auth.currentUser) {
            saveUserData();
        }
    }

    // Helper function to calculate subject score
    function calculateSubjectScore(subject) {
        if (subject.grades.length === 0) return 0;
        
        const totalPercentage = subject.grades.reduce((acc, grade) => acc + grade.percentage, 0);
        
        // If total percentage is over 100, normalize the scores
        const normalizeFactor = totalPercentage > 100 ? 100 / totalPercentage : 1;
        
        return subject.grades.reduce((acc, grade) => {
            return acc + (grade.value * (grade.percentage * normalizeFactor) / 100);
        }, 0);
    }

    // Helper function to get status text based on grade
    function getGradeStatus(score) {
        if (score >= 16) return "Excellent";
        if (score >= 14) return "Très Bien";
        if (score >= 12) return "Bien";
        if (score >= 10) return "Passable";
        return "Échec";
    }

    // Helper function to determine text color based on background
    function getContrastColor(bgColor) {
        // If color is a named color, convert to hex
        if (bgColor.startsWith('rgb')) {
            const rgb = bgColor.match(/\d+/g);
            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
            return brightness > 128 ? '#000000' : '#FFFFFF';
        } else {
            // For hex colors
            const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
            const r = parseInt(color.substring(0, 2), 16);
            const g = parseInt(color.substring(2, 4), 16);
            const b = parseInt(color.substring(4, 6), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 128 ? '#000000' : '#FFFFFF';
        }
    }

    // Update final score and progress bar - MODIFICADO para Firebase
    function updateFinalScore() {
        let total = 0;
        let weightSum = 0;

        window.subjects.forEach(subject => {
            if (subject.grades.length > 0) {
                const subjectScore = calculateSubjectScore(subject);
                
                // Both percentage and credits use the same calculation now
                total += subjectScore * subject.weight;
                weightSum += subject.weight;
            }
        });

        const score = weightSum > 0 ? (total / weightSum) : 0;

        // Convertir a la escala actual para mostrar
        const displayScore = convertFromBase(score);
        finalScore.textContent = displayScore.toFixed(2);

        // Update progress bar (siempre usa el porcentaje real)
        progressBarInner.style.width = `${(score / 20) * 100}%`;
        
        // Change progress bar color based on score
        if (score >= 16) progressBarInner.style.backgroundColor = "#28a745"; // Green
        else if (score >= 12) progressBarInner.style.backgroundColor = "#17a2b8"; // Cyan
        else if (score >= 10) progressBarInner.style.backgroundColor = "#ffc107"; // Yellow
        else progressBarInner.style.backgroundColor = "#dc3545"; // Red
    }

    // Inicializar la aplicación - Verificar si el usuario ya está autenticado al cargar
    function initializeApp() {
        console.log("Inicializando aplicación...");

        // Verificar si auth está definido y si hay un usuario autenticado
        if (typeof auth !== 'undefined') {
            console.log("Auth está definido");
            if (auth.currentUser) {
                console.log("Usuario autenticado:", auth.currentUser.uid);
                loadUserData(auth.currentUser.uid);
                // Cargar preferencia de escala después de un pequeño delay
                setTimeout(() => {
                    loadGradingScalePreference();
                }, 500);
            } else {
                console.log("No hay usuario autenticado, renderizando materias vacías");
                window.subjects = window.subjects || [];
                renderSubjects();
            }
        } else {
            console.log("Auth no está definido, esperando...");
            // Si auth no está definido, esperar un poco y volver a intentar
            setTimeout(initializeApp, 1000);
        }
    }

    // Llamar a la función de inicialización
    initializeApp();
});