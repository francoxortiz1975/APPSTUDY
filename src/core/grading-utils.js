/**
 * Grading Utilities Module
 * Functions for converting and formatting grades between different scales
 */

const GradingUtils = {
    /**
     * Convert a grade from base scale (/20) to current scale
     */
    convertFromBase(value) {
        const scale = window.AppState ? window.AppState.getGradingScale() : 20;
        return (value / 20) * scale;
    },

    /**
     * Convert a grade from current scale to base scale (/20)
     */
    convertToBase(value) {
        const scale = window.AppState ? window.AppState.getGradingScale() : 20;
        return (value / scale) * 20;
    },

    /**
     * Format a grade for display (value is in /20 scale)
     */
    formatGrade(valueIn20) {
        const scale = window.AppState ? window.AppState.getGradingScale() : 20;
        const converted = this.convertFromBase(valueIn20);

        if (scale === 100) {
            return converted.toFixed(1) + '%';
        } else {
            return converted.toFixed(2) + '/' + scale;
        }
    },

    /**
     * Get the scale label for display
     */
    getScaleLabel() {
        const scale = window.AppState ? window.AppState.getGradingScale() : 20;
        if (scale === 100) {
            return '%';
        } else {
            return '/' + scale;
        }
    },

    /**
     * Get the max value for the current scale
     */
    getMaxValue() {
        return window.AppState ? window.AppState.getGradingScale() : 20;
    },

    /**
     * Get status text based on grade (in /20 scale)
     */
    getGradeStatus(score) {
        if (score >= 16) return 'Excellent';
        if (score >= 14) return 'Très Bien';
        if (score >= 12) return 'Bien';
        if (score >= 10) return 'Passable';
        return 'Échec';
    },

    /**
     * Get status color based on grade (in /20 scale)
     */
    getGradeColor(score) {
        if (score >= 16) return '#28a745'; // Green
        if (score >= 14) return '#17a2b8'; // Cyan
        if (score >= 12) return '#17a2b8'; // Cyan
        if (score >= 10) return '#ffc107'; // Yellow
        return '#dc3545'; // Red
    },

    /**
     * Calculate subject score (weighted average of grades)
     */
    calculateSubjectScore(subject) {
        if (!subject.grades || subject.grades.length === 0) return 0;

        const totalPercentage = subject.grades.reduce((acc, grade) => acc + grade.percentage, 0);
        const normalizeFactor = totalPercentage > 100 ? 100 / totalPercentage : 1;

        return subject.grades.reduce((acc, grade) => {
            return acc + (grade.value * (grade.percentage * normalizeFactor) / 100);
        }, 0);
    },

    /**
     * Calculate final score (weighted average of all subjects)
     */
    calculateFinalScore(subjects) {
        let total = 0;
        let weightSum = 0;

        subjects.forEach(subject => {
            if (subject.grades && subject.grades.length > 0) {
                const subjectScore = this.calculateSubjectScore(subject);
                total += subjectScore * subject.weight;
                weightSum += subject.weight;
            }
        });

        return weightSum > 0 ? (total / weightSum) : 0;
    },

    /**
     * Get contrast color (black or white) based on background
     */
    getContrastColor(bgColor) {
        if (bgColor.startsWith('rgb')) {
            const rgb = bgColor.match(/\d+/g);
            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
            return brightness > 128 ? '#000000' : '#FFFFFF';
        } else {
            const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
            const r = parseInt(color.substring(0, 2), 16);
            const g = parseInt(color.substring(2, 4), 16);
            const b = parseInt(color.substring(4, 6), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 128 ? '#000000' : '#FFFFFF';
        }
    }
};

// Make GradingUtils globally available
window.GradingUtils = GradingUtils;
