// Definición de traducciones para la aplicación
const translations = {
    // Español (idioma por defecto)
    'es': {
        appTitle: "StudEasy - Calcula tus notas fácilmente",
        finalScore: "Nota media",
        addSubject: "Añadir Curso",
        backToMain: "Volver",
        currentScore: "Nota Actual",
        addGrade: "Añadir Nota",
        noSubjects: "No hay cursos registrados todavía.",
        noGrades: "No hay notas registradas para este curso.",
        percentage: "Porcentaje",
        credits: "Créditos ECTS",
        addSubjectTitle: "Añadir Curso",
        subjectName: "Nombre del Curso",
        weightingType: "Tipo de Ponderación",
        subjectPercentage: "Porcentaje del Curso",
        subjectCredits: "Créditos ECTS",
        subjectColor: "Color del Curso",
        other: "Otro",
        otherPercentage: "Otro porcentaje",
        otherCredits: "Otros créditos",
        add: "Añadir",
        close: "Cerrar",
        addGradeTitle: "Añadir Nota",
        editGradeTitle: "Editar Nota",
        saveChanges: "Guardar Cambios",
        assessmentName: "Nombre de la Evaluación",
        gradePercentage: "Porcentaje de la Nota",
        gradeValue: "Nota (/20)",
        edit: "Editar",
        delete: "Eliminar",
        confirmDelete: "¿Estás seguro de que deseas eliminar",
        confirmDeleteGrade: "¿Estás seguro de que deseas eliminar esta nota?",
        fillAllFields: "Por favor, complete todos los campos correctamente.",
        excellent: "Excelente",
        veryGood: "Muy Bien",
        good: "Bien",
        pass: "Aprobado",
        fail: "Suspenso"
    },
    // Francés
    'fr': {
        appTitle: "StudEasy - Calculez facilement vos notes",
        finalScore: "Note moyenne",
        addSubject: "Ajouter un Cours",
        backToMain: "Retour",
        currentScore: "Note Actuelle",
        addGrade: "Ajouter une Note",
        noSubjects: "Aucun cours enregistré pour le moment.",
        noGrades: "Aucune note enregistrée pour ce cours.",
        percentage: "Pourcentage",
        credits: "Crédits ECTS",
        addSubjectTitle: "Ajouter un Cours",
        subjectName: "Nom du Cours",
        weightingType: "Type de Pondération",
        subjectPercentage: "Pourcentage du Cours",
        subjectCredits: "Crédits ECTS",
        subjectColor: "Couleur du Cours",
        other: "Autre",
        otherPercentage: "Autre pourcentage",
        otherCredits: "Autres crédits",
        add: "Ajouter",
        close: "Fermer",
        addGradeTitle: "Ajouter une Note",
        editGradeTitle: "Modifier une Note",
        saveChanges: "Enregistrer",
        assessmentName: "Nom de l'Évaluation",
        gradePercentage: "Pourcentage de la Note",
        gradeValue: "Note (/20)",
        edit: "Modifier",
        delete: "Supprimer",
        confirmDelete: "Êtes-vous sûr de vouloir supprimer",
        confirmDeleteGrade: "Êtes-vous sûr de vouloir supprimer cette note ?",
        fillAllFields: "Veuillez remplir correctement tous les champs.",
        excellent: "Excellent",
        veryGood: "Très Bien",
        good: "Bien",
        pass: "Passable",
        fail: "Échec"
    }
};

// Idioma actual (por defecto español)
let currentLang = 'es';

// Función para cambiar el idioma
function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        
        // Actualizar título de la página
        document.title = translations[lang].appTitle;
        
        // Actualizar todos los elementos con atributo data-i18n
        const elementsToTranslate = document.querySelectorAll('[data-i18n]');
        elementsToTranslate.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        
        // Guardar la preferencia de idioma
        localStorage.setItem('language', lang);
        
        // Actualizar elementos específicos
        updateSpecificElements();
        
        // Si estamos en la página principal, actualizar la lista de materias
        if (document.getElementById('main-page').style.display !== 'none') {
            if (typeof renderSubjects === 'function') {
                renderSubjects();
            }
        }
        
        // Si estamos en la página de detalles de materia, actualizar los detalles
        if (document.getElementById('subject-details-page').style.display !== 'none') {
            if (typeof showSubjectDetails === 'function' && currentSubjectIndex !== -1) {
                showSubjectDetails(subjects[currentSubjectIndex]);
            }
        }
    }
}

// Función para actualizar elementos específicos que no se pueden manejar con data-i18n
function updateSpecificElements() {
    // Elementos del documento principal
    updateElement('#final-score', function(el) {
        // Mantener el valor numérico y solo cambiar el texto
        const scoreValue = el.textContent.split('/')[0].trim();
        el.textContent = scoreValue + '/20';
    });
    
    // Elementos de popups
    updateElement('#grade-popup-form h3', function(el) {
        if (el.textContent.includes('Editar') || el.textContent.includes('Modifier')) {
            el.textContent = translations[currentLang].editGradeTitle;
        } else {
            el.textContent = translations[currentLang].addGradeTitle;
        }
    });
    
    updateElement('#grade-popup-submit', function(el) {
        if (el.textContent.includes('Guardar') || el.textContent.includes('Enregistrer')) {
            el.textContent = translations[currentLang].saveChanges;
        } else {
            el.textContent = translations[currentLang].add;
        }
    });
}

// Función auxiliar para actualizar elementos específicos
function updateElement(selector, callback) {
    const el = document.querySelector(selector);
    if (el) callback(el);
}

// Función para obtener texto traducido
function getTranslation(key) {
    return translations[currentLang][key] || key;
}

// Inicializar el idioma al cargar
function initializeLanguage() {
    // Comprobar si hay una preferencia de idioma guardada
    const savedLang = localStorage.getItem('language');
    
    if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
    } else {
        // Si no hay preferencia guardada, intentar detectar el idioma del navegador
        const browserLang = navigator.language.split('-')[0];
        if (translations[browserLang]) {
            setLanguage(browserLang);
        } else {
            // Si no se puede detectar o no es compatible, usar español por defecto
            setLanguage('es');
        }
    }
}