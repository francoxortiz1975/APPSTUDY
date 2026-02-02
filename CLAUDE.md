# CLAUDE.md - APPSTUDY3.0 (Etudly)

## Project Overview

Student grade tracker web application with Google OAuth authentication. Users can manage courses (subjects), add grades with weighted percentages, and track their overall academic performance.

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase (Auth, Firestore)
- **Deployment**: Vercel (with serverless functions)
- **No frameworks** - Pure JS with modular file structure

## File Structure

```
/
├── index.html          # Landing page with auth
├── app.html            # Main application (authenticated)
├── app.js              # Core logic: grading calculations, UI rendering
├── app.css             # Application styles
├── auth.js             # Firebase Auth (Google OAuth + Email/Password)
├── auth-manager.js     # Auth state management
├── firestore.js        # Firestore database operations
├── config.js           # Firebase configuration (uses .env)
├── api/
│   └── send-email.js   # Vercel serverless function for contact form
└── .env                # Environment variables (not committed)
```

## Core Architecture

### State Management
- **Global state**: `window.subjects` array holds all courses and grades
- **Persistence**: Firebase Firestore + localStorage fallback
- **No Redux/Context** - direct window object manipulation

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

// Grade
{
  name: string,              // e.g., "Midterm Exam"
  value: number,             // Score (0-20 scale)
  percentage: number         // Weight of this grade in subject (%)
}
```

### Firestore Schema

```
/users/{userId}
  ├── displayName, email, photoURL
  ├── createdAt, updatedAt
  └── subjects: Subject[]
```

## Grading System

### Current Implementation (French /20 Scale)

All grades are on a **0-20 scale**. Key functions in `app.js`:

- `calculateSubjectScore(subject)` (line ~802): Weighted average of grades within a subject
- `updateFinalScore()` (line ~843): Weighted average of all subjects

### Score Calculation Logic

```javascript
// Subject score = weighted average of grades
subjectScore = Σ(grade.value × grade.percentage) / 100

// Final score = weighted average of subjects
finalScore = Σ(subjectScore × subject.weight) / Σ(subject.weight)
```

### Color Coding (French Scale)
- **Green** (Excellent): >= 16/20
- **Cyan** (Very Good): >= 14/20
- **Light Blue** (Good): >= 12/20
- **Yellow** (Pass): >= 10/20
- **Red** (Fail): < 10/20

### Progress Bar
- Scales score to percentage: `(score / 20) * 100%`

## Key Global Functions

```javascript
window.subjects              // Course array
window.renderSubjects()      // Re-render subject list
window.updateFinalScore()    // Recalculate and display final score
window.showSubjectDetails(i) // Navigate to course detail view
window.calculateSubjectScore(subject) // Get course average
window.saveUserData()        // Save to Firestore
window.loadUserData(userId)  // Load from Firestore
```

## UI Structure (app.html)

1. **Calculator Page** (`#calculator-page`): Main view with all subjects and final score
2. **Subject Details Page** (`#subject-details-page`): Individual course grades
3. **Study Plan Page** (`#study-plan-page`): Future feature (currently empty)

### Modals
- Subject Popup: Add/edit courses
- Grade Popup: Add/edit grades

## Authentication Flow

1. Landing page (`index.html`) shows login options
2. Google OAuth or Email/Password via Firebase Auth
3. On success, redirects to `app.html`
4. Session stored in localStorage (`etudlyAuth*` keys)
5. `onAuthStateChanged` listener manages state

## Development Notes

### Grading Scale System (Implemented)

The app supports multiple grading scales. All grades are stored internally in /20 scale and converted for display.

**Available Scales:**
- **French (/20)**: Default, 0-20 scale
- **Percentage (100%)**: 0-100 scale
- **Decimal (/10)**: 0-10 scale

**Key Functions in `app.js`:**
- `setGradingScale(scale)` - Change the current scale (20, 100, or 10)
- `getGradingScale()` - Get current scale
- `convertFromBase(value)` - Convert from /20 to current scale
- `convertToBase(value)` - Convert from current scale to /20
- `formatGrade(valueIn20)` - Format a grade for display
- `loadGradingScalePreference()` - Load user's scale preference from Firestore
- `saveGradingScalePreference(scale)` - Save preference to Firestore

**Storage:**
- Grades are always stored in /20 scale in Firestore
- User's scale preference is stored in `users/{userId}.gradingScale`

**UI Elements:**
- Settings button in page header (`#grading-scale-btn`)
- Scale selector popup (`#grading-scale-popup`)
- Scale label updates: `#current-scale-label`, `#final-score-scale`

**Conversion Formulas:**
```javascript
// Convert from /20 to current scale
convertFromBase = (value / 20) * window.gradingScale

// Convert from current scale to /20
convertToBase = (value / window.gradingScale) * 20
```

## Common Tasks

### Run Locally
```bash
# Serve with any static server
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
- CSS custom properties for theming
- Mobile-first responsive design
- French comments in some places (bilingual codebase)
