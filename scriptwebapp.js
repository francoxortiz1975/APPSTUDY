document.addEventListener("DOMContentLoaded", () => {
    const subjects = [];
    
    // Main page elements
    const mainPage = document.getElementById("main-page");
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
    
    let currentSubjectIndex = -1;
    let editingGradeIndex = -1; // Pour suivre si nous modifions une note existante

    // Create progress bar inner div
    const progressBarInner = document.createElement("div");
    progressBar.appendChild(progressBarInner);

    // Open subject popup
    addSubjectBtn.addEventListener("click", () => {
        subjectPopup.style.display = "flex";
        subjectPopup.classList.add("active");
        
        // Reset form
        document.getElementById("subject-name").value = "";
        document.getElementById("subject-percentage").value = "";
        document.getElementById("other-subject-percentage").style.display = "none";
        
        // Deselect all percentage buttons for subject
        document.querySelectorAll('.subject-percentage-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.weighting-btn')[0].click(); // Select percentage by default
        document.querySelectorAll('.color-btn')[0].click(); // Select first color by default
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

    // Add subject from popup
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
            subjects.push(subject);
            renderSubjects();
            
            // Close popup with animation
            subjectPopup.classList.remove("active");
            setTimeout(() => {
                subjectPopup.style.display = "none";
            }, 300);
        } else {
            alert('Veuillez remplir tous les champs correctement.');
        }
    });

    // Add or update grade from popup
    gradePopupSubmit.addEventListener('click', () => {
        const gradeName = document.getElementById('grade-name').value;
        const gradeValue = parseFloat(document.getElementById('grade-value').value);
        
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

        if (currentSubjectIndex !== -1 && gradeName && 
            !isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 20 && 
            !isNaN(gradePercentage) && gradePercentage > 0) {
            
            const grade = { 
                name: gradeName, 
                value: gradeValue, 
                percentage: gradePercentage 
            };

            if (editingGradeIndex !== -1) {
                // Modification d'une note existante
                subjects[currentSubjectIndex].grades[editingGradeIndex] = grade;
            } else {
                // Ajout d'une nouvelle note
                subjects[currentSubjectIndex].grades.push(grade);
            }
            
            showSubjectDetails(subjects[currentSubjectIndex]);
            
            // Close popup with animation
            gradePopup.classList.remove("active");
            setTimeout(() => {
                gradePopup.style.display = "none";
            }, 300);
        } else {
            alert('Veuillez remplir tous les champs correctement.');
        }
    });

    // Fonction pour ouvrir le popup pour modifier une note
    function openEditGradePopup(gradeIndex) {
        if (currentSubjectIndex !== -1 && gradeIndex >= 0) {
            const grade = subjects[currentSubjectIndex].grades[gradeIndex];
            editingGradeIndex = gradeIndex;
            
            // Changer titre du popup et bouton
            document.querySelector("#grade-popup-form h3").textContent = "Modifier la Note";
            document.getElementById("grade-popup-submit").textContent = "Enregistrer";
            
            // Remplir le formulaire avec les données de la note
            document.getElementById("grade-name").value = grade.name;
            document.getElementById("grade-value").value = grade.value;
            document.getElementById("grade-percentage").value = grade.percentage;
            
            // Afficher le popup
            gradePopup.style.display = "flex";
            gradePopup.classList.add("active");
            
            // Essayer de sélectionner le bouton de pourcentage correspondant
            let percentageButtonFound = false;
            document.querySelectorAll('.grade-percentage-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.percentage == grade.percentage) {
                    btn.classList.add('active');
                    percentageButtonFound = true;
                }
            });
            
            // Si aucun bouton avec le pourcentage exact n'a été trouvé, sélectionner "Autre"
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
        }
    }

    // Render subjects in the list with improved styling (more compact)
    function renderSubjects() {
        subjectList.innerHTML = "";

        if (subjects.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.textContent = "Aucun cours enregistré pour le moment.";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.padding = "20px";
            emptyMessage.style.color = "#6c757d";
            subjectList.appendChild(emptyMessage);
        } else {
            subjects.forEach((subject, index) => {
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
                
                // Right side with score and delete button
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
                
                scoreCircle.innerHTML = `
                    <span style="font-size: 1.2rem; font-weight: bold; color: ${statusColor};">${subjectScore.toFixed(1)}</span>
                    <span style="font-size: 0.6rem; color: #666;">${getGradeStatus(subjectScore)}</span>
                `;
                
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
                        subjects.splice(index, 1);
                        renderSubjects();
                        updateFinalScore();
                    }
                });
                
                // Append elements
                actionSide.appendChild(scoreCircle);
                actionSide.appendChild(deleteBtn);
                div.appendChild(infoSide);
                div.appendChild(actionSide);
                
                // Make the div clickable (excluding the delete button)
                div.addEventListener("click", (e) => {
                    if (e.target !== deleteBtn && !deleteBtn.contains(e.target)) {
                        currentSubjectIndex = index;
                        showSubjectDetails(subject);
                    }
                });
                
                subjectList.appendChild(div);
            });
        }

        // Update final score
        updateFinalScore();
    }

    // Show subject details when clicked
    function showSubjectDetails(subject) {
        // Hide main page, show details page
        mainPage.style.display = "none";
        subjectDetailsPage.style.display = "block";

        // Set subject title and current score
        subjectDetailsTitle.textContent = subject.name;
        
        // Calculate and display subject score
        const subjectScore = calculateSubjectScore(subject);
        subjectCurrentScore.textContent = `${subjectScore.toFixed(2)} / 20`;

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
                
                // Middle with grade value
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
                gradeValueDisplay.textContent = grade.value;
                
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

    // Update final score and progress bar - FIXED VERSION
    function updateFinalScore() {
        let total = 0;
        let weightSum = 0;

        subjects.forEach(subject => {
            if (subject.grades.length > 0) {
                const subjectScore = calculateSubjectScore(subject);
                
                // Both percentage and credits use the same calculation now
                total += subjectScore * subject.weight;
                weightSum += subject.weight;
            }
        });

        const score = weightSum > 0 ? (total / weightSum) : 0;
        finalScore.textContent = score.toFixed(2);
        
        // Update progress bar
        progressBarInner.style.width = `${(score / 20) * 100}%`;
        
        // Change progress bar color based on score
        if (score >= 16) progressBarInner.style.backgroundColor = "#28a745"; // Green
        else if (score >= 12) progressBarInner.style.backgroundColor = "#17a2b8"; // Cyan
        else if (score >= 10) progressBarInner.style.backgroundColor = "#ffc107"; // Yellow
        else progressBarInner.style.backgroundColor = "#dc3545"; // Red
    }

    // Initialize app
    renderSubjects();
});