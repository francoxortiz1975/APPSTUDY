/**
 * Grading Scale UI Module
 * Handles the grading scale selector UI components
 */

const GradingScaleUI = {
    /**
     * Initialize the grading scale UI components
     */
    init() {
        this.setupScaleButton();
        this.setupScalePopup();
        this.updateAllScaleLabels();

        // Subscribe to scale changes
        if (window.AppState) {
            window.AppState.subscribe('gradingScale', (scale) => {
                this.updateAllScaleLabels();
            });
        }
    },

    /**
     * Setup the scale button in header
     */
    setupScaleButton() {
        const btn = document.getElementById('grading-scale-btn');
        const popup = document.getElementById('grading-scale-popup');

        if (btn && popup) {
            btn.addEventListener('click', () => {
                this.openPopup();
            });
        }
    },

    /**
     * Setup the scale popup
     */
    setupScalePopup() {
        const popup = document.getElementById('grading-scale-popup');
        const closeBtn = document.getElementById('grading-scale-close');
        const options = document.querySelectorAll('.scale-option');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePopup();
            });
        }

        options.forEach(option => {
            option.addEventListener('click', () => {
                const newScale = parseInt(option.dataset.scale);
                this.selectScale(newScale);
            });
        });
    },

    /**
     * Open the grading scale popup
     */
    openPopup() {
        const popup = document.getElementById('grading-scale-popup');
        const options = document.querySelectorAll('.scale-option');
        const currentScale = window.AppState ? window.AppState.getGradingScale() : 20;

        // Mark current option as active
        options.forEach(opt => {
            opt.classList.remove('active');
            if (parseInt(opt.dataset.scale) === currentScale) {
                opt.classList.add('active');
            }
        });

        if (popup) {
            popup.style.display = 'flex';
            popup.classList.add('active');
        }
    },

    /**
     * Close the grading scale popup
     */
    closePopup() {
        const popup = document.getElementById('grading-scale-popup');
        if (popup) {
            popup.classList.remove('active');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
        }
    },

    /**
     * Select a new grading scale
     */
    selectScale(scale) {
        const options = document.querySelectorAll('.scale-option');

        // Update UI
        options.forEach(opt => {
            opt.classList.remove('active');
            if (parseInt(opt.dataset.scale) === scale) {
                opt.classList.add('active');
            }
        });

        // Update state
        if (window.AppState) {
            window.AppState.setGradingScale(scale);
        }

        // Update all labels
        this.updateAllScaleLabels();

        // Close popup after selection
        setTimeout(() => {
            this.closePopup();
        }, 200);

        // Trigger re-render if callback exists
        if (typeof window.onGradingScaleChange === 'function') {
            window.onGradingScaleChange(scale);
        }
    },

    /**
     * Update all scale-related labels in the UI
     */
    updateAllScaleLabels() {
        const scale = window.AppState ? window.AppState.getGradingScale() : 20;
        const scaleLabel = scale === 100 ? '%' : '/' + scale;

        // Update button label
        const btnLabel = document.getElementById('current-scale-label');
        if (btnLabel) {
            btnLabel.textContent = scaleLabel;
        }

        // Update final score label
        const finalScaleLabel = document.getElementById('final-score-scale');
        if (finalScaleLabel) {
            finalScaleLabel.textContent = scaleLabel;
        }

        // Update grade input label
        const gradeValueLabel = document.getElementById('grade-value-label');
        const gradeValueInput = document.getElementById('grade-value');
        if (gradeValueLabel) {
            gradeValueLabel.textContent = scale === 100 ? 'Note (%):' : `Note (/${scale}):`;
        }
        if (gradeValueInput) {
            gradeValueInput.max = scale;
        }

        // Update subject current score label if on details page
        const subjectScoreLabel = document.getElementById('subject-current-score');
        if (subjectScoreLabel && window.currentSubjectScore !== undefined) {
            const displayScore = window.GradingUtils ?
                window.GradingUtils.convertFromBase(window.currentSubjectScore) :
                window.currentSubjectScore;
            subjectScoreLabel.textContent = `${displayScore.toFixed(2)}${scaleLabel}`;
        }
    },

    /**
     * Get the scale label HTML for the header button
     */
    getScaleButtonHTML() {
        const scale = window.AppState ? window.AppState.getGradingScale() : 20;
        const scaleLabel = scale === 100 ? '%' : '/' + scale;

        return `
            <button id="grading-scale-btn" class="grading-scale-btn" title="Changer le système de notation">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span id="current-scale-label">${scaleLabel}</span>
            </button>
        `;
    },

    /**
     * Get the scale popup HTML
     */
    getScalePopupHTML() {
        return `
            <div id="grading-scale-popup" class="modal-popup">
                <div class="popup-form grading-scale-form">
                    <h3>Système de Notation</h3>
                    <p class="popup-description">Choisissez comment afficher vos notes</p>

                    <div class="grading-scale-options">
                        <button type="button" class="scale-option" data-scale="20" data-max="20">
                            <span class="scale-icon">/20</span>
                            <span class="scale-name">France</span>
                            <span class="scale-desc">Note sur 20 points</span>
                        </button>
                        <button type="button" class="scale-option" data-scale="100" data-max="100">
                            <span class="scale-icon">%</span>
                            <span class="scale-name">Pourcentage</span>
                            <span class="scale-desc">Note sur 100%</span>
                        </button>
                        <button type="button" class="scale-option" data-scale="10" data-max="10">
                            <span class="scale-icon">/10</span>
                            <span class="scale-name">Décimal</span>
                            <span class="scale-desc">Note sur 10 points</span>
                        </button>
                    </div>

                    <div class="popup-actions">
                        <button type="button" id="grading-scale-close">Fermer</button>
                    </div>
                </div>
            </div>
        `;
    }
};

// Make GradingScaleUI globally available
window.GradingScaleUI = GradingScaleUI;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for AppState to be initialized
    setTimeout(() => {
        GradingScaleUI.init();
    }, 100);
});
