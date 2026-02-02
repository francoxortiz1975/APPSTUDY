/**
 * State Management Module
 * Manages global application state including user preferences
 */

const AppState = {
    // User preferences
    gradingScale: 20, // Default: French /20 scale
    subjects: [],

    // Callbacks for state changes
    listeners: {
        gradingScale: [],
        subjects: []
    },

    /**
     * Initialize state from localStorage or Firestore
     */
    init() {
        // Load from localStorage first (faster)
        const savedScale = localStorage.getItem('etudlyGradingScale');
        if (savedScale) {
            this.gradingScale = parseInt(savedScale);
        }

        // Load subjects from localStorage
        const savedSubjects = localStorage.getItem('etudlySubjects');
        if (savedSubjects) {
            try {
                this.subjects = JSON.parse(savedSubjects);
            } catch (e) {
                console.error('Error parsing subjects from localStorage:', e);
                this.subjects = [];
            }
        }

        console.log('AppState initialized:', { gradingScale: this.gradingScale });
    },

    /**
     * Set grading scale and persist it
     */
    setGradingScale(scale) {
        this.gradingScale = scale;

        // Save to localStorage immediately
        localStorage.setItem('etudlyGradingScale', scale.toString());

        // Save to Firestore if user is authenticated
        this.saveToFirestore({ gradingScale: scale });

        // Notify listeners
        this.notifyListeners('gradingScale', scale);

        console.log('Grading scale updated:', scale);
    },

    /**
     * Get current grading scale
     */
    getGradingScale() {
        return this.gradingScale;
    },

    /**
     * Set subjects array
     */
    setSubjects(subjects) {
        this.subjects = subjects;

        // Save to localStorage
        localStorage.setItem('etudlySubjects', JSON.stringify(subjects));

        // Notify listeners
        this.notifyListeners('subjects', subjects);
    },

    /**
     * Get subjects array
     */
    getSubjects() {
        return this.subjects;
    },

    /**
     * Subscribe to state changes
     */
    subscribe(key, callback) {
        if (this.listeners[key]) {
            this.listeners[key].push(callback);
        }
    },

    /**
     * Unsubscribe from state changes
     */
    unsubscribe(key, callback) {
        if (this.listeners[key]) {
            this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
        }
    },

    /**
     * Notify all listeners of a state change
     */
    notifyListeners(key, value) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value));
        }
    },

    /**
     * Save data to Firestore
     */
    saveToFirestore(data) {
        if (typeof window.db === 'undefined' || !window.db) return;
        if (typeof window.auth === 'undefined' || !window.auth || !window.auth.currentUser) return;

        const userId = window.auth.currentUser.uid;
        const userRef = window.db.collection('users').doc(userId);

        userRef.update(data)
            .then(() => console.log('State saved to Firestore:', Object.keys(data)))
            .catch(error => console.error('Error saving state to Firestore:', error));
    },

    /**
     * Load preferences from Firestore
     */
    loadFromFirestore() {
        return new Promise((resolve, reject) => {
            if (typeof window.db === 'undefined' || !window.db) {
                resolve(false);
                return;
            }
            if (typeof window.auth === 'undefined' || !window.auth || !window.auth.currentUser) {
                resolve(false);
                return;
            }

            const userId = window.auth.currentUser.uid;
            const userRef = window.db.collection('users').doc(userId);

            userRef.get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();

                        // Load grading scale
                        if (data.gradingScale) {
                            this.gradingScale = data.gradingScale;
                            localStorage.setItem('etudlyGradingScale', data.gradingScale.toString());
                            this.notifyListeners('gradingScale', data.gradingScale);
                        }

                        // Load subjects
                        if (data.subjects && Array.isArray(data.subjects)) {
                            this.subjects = data.subjects;
                            localStorage.setItem('etudlySubjects', JSON.stringify(data.subjects));
                            this.notifyListeners('subjects', data.subjects);
                        }

                        console.log('State loaded from Firestore');
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(error => {
                    console.error('Error loading state from Firestore:', error);
                    reject(error);
                });
        });
    },

    /**
     * Clear all state (on logout)
     */
    clear() {
        this.gradingScale = 20;
        this.subjects = [];
        localStorage.removeItem('etudlyGradingScale');
        localStorage.removeItem('etudlySubjects');
    }
};

// Make AppState globally available
window.AppState = AppState;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    AppState.init();
});
