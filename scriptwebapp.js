document.addEventListener("DOMContentLoaded", () => {
    const subjects = [];
    const addSubjectBtn = document.getElementById("add-subject");
    const subjectList = document.getElementById("subject-list");
    const finalScore = document.getElementById("final-score");
    const progressBar = document.getElementById("progress-bar");
    const popup = document.getElementById("popup");
    const popupSubmit = document.getElementById("popup-submit");
    const popupClose = document.getElementById("popup-close");

    // Abre el popup para agregar materia
    addSubjectBtn.addEventListener("click", () => {
        popup.style.display = "block";
    });

    // Cierra el popup
    popupClose.addEventListener("click", () => {
        popup.style.display = "none";
    });

    // Añadir materia desde el popup
    popupSubmit.addEventListener("click", () => {
        const name = document.getElementById("subject-name").value;
        const percentage = parseFloat(document.getElementById("subject-percentage").value);
        const color = document.getElementById("subject-color").value;
        
        if (name && !isNaN(percentage) && percentage > 0) {
            const subject = { name, percentage, color, grades: [] };
            subjects.push(subject);
            renderSubjects();
            popup.style.display = "none";
            document.getElementById("subject-name").value = "";
            document.getElementById("subject-percentage").value = "";
            document.getElementById("subject-color").value = "#ffffff";
        } else {
            alert("Por favor, ingresa todos los datos correctamente.");
        }
    });

// Función para añadir una nueva nota
function addGrade(index) {
    // Pedimos el nombre de la nota (por ejemplo, "parcial", "trabajo", etc.)
    const gradeName = prompt("Nombre de la tarea: (Ex: parcial, trabajo, etc.)");

    // Pedimos el valor de la nota
    const gradeValue = parseFloat(prompt("Valeur de la note: (/20):"));

    // Pedimos el porcentaje que afecta a la materia
    const gradePercentage = parseFloat(prompt("Porcentage de la note du cours %:"));

    if (!isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 20 && gradeName && !isNaN(gradePercentage) && gradePercentage > 0) {
        // Creamos un objeto para la nota con su nombre, valor y porcentaje
        const grade = { name: gradeName, value: gradeValue, percentage: gradePercentage };

        // Añadimos la nueva nota al arreglo de notas de la materia correspondiente
        subjects[index].grades.push(grade);

        // Actualizamos la lista de materias
        renderSubjects();
    } else {
        alert("Por favor, ingresa todos los datos correctamente.");
    }
}

// Renderizar materias en la lista
function renderSubjects() {
    subjectList.innerHTML = "";  // Limpiamos la lista antes de renderizar

    subjects.forEach((subject, index) => {
        const div = document.createElement("div");
        div.classList.add("subject-item");
        div.style.backgroundColor = `${subject.color}`;  // Color de la materia

        // Calculamos el puntaje acumulado de la materia
        const subjectScore = subject.grades.reduce((acc, grade) => {
            return acc + (grade.value * grade.percentage / 100);
        }, 0);  // Sumamos las notas ponderadas

        // Construimos el contenido HTML para cada materia
        div.innerHTML = `
            <strong>${subject.name}</strong> (${subject.percentage}%) 
            - Puntaje actual: ${subjectScore.toFixed(2)} / 20
            <button class="add-grade-btn" data-index="${index}">Ajouter une note</button>
            <div>Notes:</div>
            <ul>
                ${subject.grades.map(grade => `
                    <li>${grade.name}: ${grade.value} (Porcentaje: ${grade.percentage}%)</li>
                `).join('')}
            </ul>
        `;
        
        // Añadimos el div de la materia a la lista
        subjectList.appendChild(div);

        // Botón para añadir una nota
        document.querySelectorAll(".add-grade-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                addGrade(index);  // Llamamos a la función para añadir una nueva nota
            });
        });
    });

    // Actualizamos la nota final
    updateFinalScore();
}


    // Actualizar el resultado final y la barra de progreso
    // Actualizar el resultado final y la barra de progreso
function updateFinalScore() {
    let total = 0;
    let weightSum = 0;

    subjects.forEach(subject => {
        if (subject.grades.length > 0) {
            // Calculamos el ScoreSubject sumando las notas y multiplicando por su porcentaje
            const subjectScore = subject.grades.reduce((acc, grade) => {
                return acc + (grade.value * grade.percentage / 100);
            }, 0); // Reduce acumula los valores de las notas ponderadas
            
            total += subjectScore * (subject.percentage / 100);  // Peso de la materia
            weightSum += subject.percentage;  // Acumulamos el porcentaje total de las materias
        }
    });

    // Calculamos la puntuación final
    const score = weightSum > 0 ? total : 0;
    finalScore.textContent = score.toFixed(2);
    progressBar.style.height = `${(score / 20) * 100}%`;
}

});
