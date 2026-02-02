# CLAUDE.md - APPSTUDY3.0 (Etudly)

## Project Overview

Student grade tracker web application with Google OAuth authentication. Users can manage courses (subjects), add grades with weighted percentages, and track their overall academic performance. The app also includes a Study Plan feature for exam preparation.

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel (with serverless functions)
- **No frameworks** - Pure JS with modular file structure

## File Structure

```
/
├── index.html              # Landing page
├── app.html                # Grade Calculator feature
├── study-plan.html         # Study Plan feature
├── app.js                  # Grade calculator logic
├── study-plan.js           # Study plan logic
├── app.css                 # Application styles (shared)
│
├── src/                    # Modular source code
│   ├── core/               # Shared core modules
│   │   ├── state.js        # Global state management (AppState)
│   │   └── grading-utils.js # Grade conversion utilities
│   ├── shared/             # Shared UI components
│   │   └── grading-scale-ui.js # Grading scale selector
│   ├── features/           # Feature-specific code (future)
│   │   ├── grade-calculator/
│   │   └── study-plan/
│   └── styles/             # CSS modules (future)
│
├── auth.js                 # Firebase Auth (Google OAuth + Email/Password)
├── auth-manager.js         # Auth state management
├── firestore.js            # Firestore database operations
├── config.js               # Firebase configuration (uses .env)
│
├── api/                    # Vercel serverless functions
│   └── send-email.js       # Contact form email
│
├── public/                 # Static pages
│   └── (terms.html, privacy.html, etc.)
│
└── .env                    # Environment variables (not committed)
```

## Core Architecture

### Modular State Management

The app uses a centralized state management system in `src/core/state.js`:

```javascript
window.AppState = {
    gradingScale: 20,      // Current grading scale (20, 100, or 10)
    subjects: [],          // All courses and grades

    setGradingScale(scale) // Change scale + persist
    getGradingScale()      // Get current scale
    setSubjects(subjects)  // Update subjects
    getSubjects()          // Get subjects
    subscribe(key, cb)     // Listen for changes
    loadFromFirestore()    // Load user preferences
    clear()                // Reset on logout
}
```

### Grading Utilities (`src/core/grading-utils.js`)

```javascript
window.GradingUtils = {
    convertFromBase(value)     // /20 -> current scale
    convertToBase(value)       // current scale -> /20
    formatGrade(valueIn20)     // Format for display
    getScaleLabel()            // Get "%" or "/20" or "/10"
    getGradeStatus(score)      // "Excellent", "Bien", etc.
    getGradeColor(score)       // Status color
    calculateSubjectScore(subj) // Subject average
    calculateFinalScore(subjs)  // Overall average
}
```

### Shared UI (`src/shared/grading-scale-ui.js`)

```javascript
window.GradingScaleUI = {
    init()                  // Setup event listeners
    openPopup()             // Show scale selector
    closePopup()            // Hide selector
    selectScale(scale)      // User selects scale
    updateAllScaleLabels()  // Refresh UI labels
}
```

### Data Model

```javascript
// Subject (Course)
{
  name: string,              // e.g., "Mathematics"
  weight: number,            // 1-100 (percentage or ECTS credits)
  weightingType: string,     // "percentage" | "credits"
  color: string,             // Hex color for UI badge
  grades: Grade[]
}

// Grade (stored in /20 scale internally)
{
  name: string,              // e.g., "Midterm Exam"
  value: number,             // Score (always 0-20 for storage)
  percentage: number         // Weight of this grade in subject (%)
}
```

### Firestore Schema

```
/users/{userId}
  ├── displayName, email, photoURL
  ├── createdAt, updatedAt
  ├── gradingScale: number    # User's preferred scale (20, 100, 10)
  ├── subjects: Subject[]
  └── studyPlans/             # Subcollection
      └── {planId}
          ├── subject, examDate, studyHours
          ├── sessions: Session[]
          └── ...
```

## Features

### 1. Grade Calculator (`app.html`, `app.js`)

- Add/edit/delete courses with weighted percentages or ECTS
- Add/edit/delete grades within courses
- Automatic weighted average calculation
- Color-coded status (Excellent, Bien, Passable, Échec)
- Progress bar visualization

### 2. Grading Scale System

Supports multiple grading scales with automatic conversion:

| Scale | Range | Label |
|-------|-------|-------|
| French | 0-20 | /20 |
| Percentage | 0-100 | % |
| Decimal | 0-10 | /10 |

**Persistence:**
- Saved in `localStorage` (immediate)
- Saved in Firestore `users/{uid}.gradingScale`
- Persists across page navigation

### 3. Study Plan (`study-plan.html`, `study-plan.js`)

- Upload course documents (PDF, Word, TXT)
- Select subject from existing courses
- Set exam date and study hours
- Generate study sessions
- Track completion progress

## Key Global Functions

```javascript
// State
window.AppState               // Centralized state
window.GradingUtils           // Conversion utilities
window.GradingScaleUI         // Scale selector UI

// Grade Calculator
window.subjects               // Course array
window.renderSubjects()       // Re-render subject list
window.updateFinalScore()     // Recalculate final score
window.showSubjectDetails(i)  // Navigate to course detail
window.calculateSubjectScore(subject) // Get course average

// Data persistence
window.saveUserData()         // Save to Firestore
window.loadUserData(userId)   // Load from Firestore

// Scale (wrappers for AppState)
window.setGradingScale(scale) // Change scale
window.getGradingScale()      // Get current scale
window.onGradingScaleChange   // Callback when scale changes
```

## Authentication Flow

1. Landing page (`index.html`) shows login options
2. Google OAuth or Email/Password via Firebase Auth
3. On success, redirects to `app.html`
4. Session stored in localStorage (`etudlyAuth*` keys)
5. `onAuthStateChanged` listener manages state

## Adding New Features

To add a new feature:

1. Create feature folder: `src/features/my-feature/`
2. Add feature HTML page: `my-feature.html`
3. Include core modules in HTML:
   ```html
   <script src="src/core/state.js"></script>
   <script src="src/core/grading-utils.js"></script>
   <script src="src/shared/grading-scale-ui.js"></script>
   ```
4. Include grading scale button in header (copy from app.html)
5. Include grading scale popup (copy from app.html)
6. Access shared state via `window.AppState`

## Common Tasks

### Run Locally
```bash
npx serve .
# or
python -m http.server 8000
```

### Environment Variables (.env)
```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

### Deploy
- Push to GitHub, Vercel auto-deploys
- Serverless functions in `/api` folder

## Code Style

- Vanilla JS, no transpilation
- Global functions exposed on `window`
- Modular code in `src/` folder
- CSS custom properties for theming
- Mobile-first responsive design
- Bilingual comments (French/Spanish/English)
