document.addEventListener('DOMContentLoaded', () => {

    // ── Constants ────────────────────────────────────────────────────────
    const GUEST_KEY = 'etudlyGuestSubjects';
    const MONTHS_FR = ['jan','fév','mar','avr','mai','juin','juil','aoû','sep','oct','nov','déc'];

    // ── State ────────────────────────────────────────────────────────────
    let subjects = [];

    // ── Init ─────────────────────────────────────────────────────────────

    function loadFromLocalStorage() {
        try { subjects = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]'); }
        catch(e) { subjects = []; }
    }

    function initData() {
        loadFromLocalStorage();
        renderDashboard();

        const tryFirebase = () => {
            if (window.auth) {
                window.auth.onAuthStateChanged(user => {
                    updateSidebarForUser(user);
                    updateGreeting(user);
                    if (user && window.db) {
                        window.db.collection('users').doc(user.uid).get()
                            .then(doc => {
                                if (doc.exists && doc.data().subjects) {
                                    subjects = doc.data().subjects;
                                    renderDashboard();
                                }
                            }).catch(console.error);
                    }
                });
            } else {
                window.addEventListener('firebaseReady', tryFirebase, { once: true });
            }
        };
        tryFirebase();
    }

    // ── Greeting ──────────────────────────────────────────────────────────

    function updateGreeting(user) {
        const greetEl = document.getElementById('dash-greeting-text');
        const name    = user ? (user.displayName?.split(' ')[0] || 'Étudiant') : 'Étudiant';

        const hour = new Date().getHours();
        const salut = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
        greetEl.textContent = `${salut}, ${name} !`;
    }

    (() => {
        const d = new Date();
        const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
        document.getElementById('dash-date-text').textContent =
            `${days[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
    })();

    // ── Auth sidebar ──────────────────────────────────────────────────────

    function updateSidebarForUser(user) {
        const guestEl = document.getElementById('guest-profile');
        const authEl  = document.getElementById('auth-profile');
        const nameEl  = document.getElementById('sidebar-user-name');
        const emailEl = document.getElementById('sidebar-user-email');
        const picEl   = document.getElementById('sidebar-user-pic');

        if (user) {
            if (guestEl) guestEl.style.display = 'none';
            if (authEl)  authEl.style.display  = 'flex';
            if (nameEl)  nameEl.textContent  = user.displayName || user.email;
            if (emailEl) emailEl.textContent = user.email || '';
            if (picEl)   picEl.src = user.photoURL ||
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'U') + '&background=random';
        } else {
            if (guestEl) guestEl.style.display = 'flex';
            if (authEl)  authEl.style.display  = 'none';
        }
    }

    document.getElementById('sidebar-login')?.addEventListener('click', () => {
        document.getElementById('login-page').style.display = 'flex';
    });
    document.getElementById('login-page-close')?.addEventListener('click', () => {
        document.getElementById('login-page').style.display = 'none';
    });
    document.getElementById('sidebar-logout')?.addEventListener('click', () => {
        if (window.auth) window.auth.signOut().then(() => updateSidebarForUser(null));
    });
    document.getElementById('login-with-google')?.addEventListener('click', () => {
        if (!window.auth) return;
        const provider = new firebase.auth.GoogleAuthProvider();
        window.auth.signInWithPopup(provider)
            .then(r => {
                localStorage.setItem('etudlyAuthUid', r.user.uid);
                document.getElementById('login-page').style.display = 'none';
            })
            .catch(console.error);
    });

    // ── Render ────────────────────────────────────────────────────────────

    function renderDashboard() {
        if (!subjects.length) {
            document.getElementById('dash-onboarding').style.display = 'flex';
            document.getElementById('dash-content').style.display    = 'none';
            return;
        }

        document.getElementById('dash-onboarding').style.display = 'none';
        document.getElementById('dash-content').style.display    = 'block';

        renderStats();
        renderGradesWidget();
        renderTimelineWidget();
        renderPlanWidget();
    }

    // ── Stats ─────────────────────────────────────────────────────────────

    function renderStats() {
        // Overall average
        const avg = calcOverallAverage();
        document.getElementById('stat-avg').textContent =
            avg !== null ? formatScore(avg) + '/20' : '—';

        // Upcoming deadlines
        const upcoming = getUpcomingDeadlines(30);
        document.getElementById('stat-deadlines').textContent = upcoming.length || '0';

        // Total topics
        const topicCount = subjects.reduce((n, s) => n + (s.topics?.length || 0), 0);
        document.getElementById('stat-topics').textContent = topicCount || '0';
    }

    // ── Grades widget ─────────────────────────────────────────────────────

    function renderGradesWidget() {
        const el  = document.getElementById('grades-widget-content');
        const avg = calcOverallAverage();

        let html = '';

        // Big average
        if (avg !== null) {
            const { level, label } = gradeLevel(avg);
            html += `
                <div class="grade-avg-display">
                    <span class="grade-avg-number color-${level}">${formatScore(avg)}</span>
                    <span class="grade-avg-scale">/20</span>
                    <span class="grade-avg-status ${level}">${label}</span>
                </div>
            `;
        } else {
            html += `<div class="grade-avg-display">
                <span class="grade-avg-number color-none">—</span>
                <span class="grade-avg-scale">/20</span>
            </div>`;
        }

        // Per-subject mini list (max 5)
        const scored = subjects
            .map(s => ({ ...s, score: calcSubjectScore(s) }))
            .filter(s => s.score !== null);

        if (scored.length) {
            html += '<div class="subject-mini-list">';
            scored.slice(0, 5).forEach(s => {
                const pct = (s.score / 20) * 100;
                html += `
                    <div class="subject-mini-item">
                        <span class="smi-dot" style="background:${s.color || '#4a90d9'}"></span>
                        <span class="smi-name" title="${escHtml(s.name)}">${escHtml(s.name)}</span>
                        <div class="smi-bar-wrap">
                            <div class="smi-bar-fill" style="width:${pct}%; background:${s.color || '#0d6efd'}"></div>
                        </div>
                        <span class="smi-score">${formatScore(s.score)}</span>
                    </div>
                `;
            });
            if (subjects.length > 5) {
                html += `<div style="font-size:0.72rem;color:#adb5bd;text-align:center;padding-top:4px">+${subjects.length - 5} autres cours</div>`;
            }
            html += '</div>';
        } else {
            html += '<div class="dash-no-data">Ajoutez des notes dans le <a href="../grade-calculator/app.html">Calculateur</a> pour voir votre moyenne.</div>';
        }

        el.innerHTML = html;
    }

    // ── Timeline widget ───────────────────────────────────────────────────

    function renderTimelineWidget() {
        const el       = document.getElementById('timeline-widget-content');
        const upcoming = getUpcomingDeadlines(90);

        if (!upcoming.length) {
            el.innerHTML = '<div class="dash-no-data">Aucune échéance à venir.<br>Ajoutez des dates dans la <a href="../timeline/timeline.html">Timeline</a>.</div>';
            return;
        }

        const today = new Date(); today.setHours(0,0,0,0);
        let html = '<div class="deadline-list">';

        upcoming.slice(0, 5).forEach(item => {
            const d = new Date(item.dueDate + 'T12:00:00');
            const days = Math.ceil((d - today) / 86400000);

            let daysText, daysClass;
            if (days === 0)      { daysText = "Auj."; daysClass = 'urgent'; }
            else if (days === 1) { daysText = "Demain"; daysClass = 'urgent'; }
            else if (days <= 7)  { daysText = `J-${days}`; daysClass = 'soon'; }
            else                 { daysText = `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`; daysClass = ''; }

            const type = item.type || 'default';
            html += `
                <div class="deadline-item">
                    <span class="deadline-badge type-${type}">${typeName(type)}</span>
                    <div class="deadline-info">
                        <div class="deadline-name">${escHtml(item.name)}</div>
                        <div class="deadline-subject">${escHtml(item.subjectName)}</div>
                    </div>
                    <span class="deadline-days ${daysClass}">${daysText}</span>
                </div>
            `;
        });

        if (upcoming.length > 5) {
            html += `<div style="font-size:0.72rem;color:#adb5bd;text-align:center;padding:4px 0">+${upcoming.length - 5} autres échéances</div>`;
        }

        html += '</div>';
        el.innerHTML = html;
    }

    // ── Study plan widget ─────────────────────────────────────────────────

    function renderPlanWidget() {
        const el = document.getElementById('plan-widget-content');

        const hasTopics = subjects.some(s => s.topics?.length > 0);

        if (!hasTopics) {
            el.innerHTML = '<div class="dash-no-data">Ajoutez des thèmes d\'étude dans le <a href="../study-plan/study-plan.html">Plan d\'Études</a> pour préparer vos quiz.</div>';
            return;
        }

        let html = '<div class="plan-subject-list">';
        subjects.slice(0, 6).forEach(s => {
            const count = s.topics?.length || 0;
            html += `
                <div class="plan-subject-item">
                    <span class="psi-dot" style="background:${s.color || '#4a90d9'}"></span>
                    <span class="psi-name" title="${escHtml(s.name)}">${escHtml(s.name)}</span>
                    <span class="psi-topics ${count > 0 ? 'has-topics' : ''}">
                        ${count > 0 ? count + ' thème' + (count > 1 ? 's' : '') : 'Aucun thème'}
                    </span>
                </div>
            `;
        });
        if (subjects.length > 6) {
            html += `<div style="font-size:0.72rem;color:#adb5bd;text-align:center;padding-top:4px">+${subjects.length - 6} autres</div>`;
        }
        html += '</div>';
        el.innerHTML = html;
    }

    // ── Calculation helpers ───────────────────────────────────────────────

    function calcSubjectScore(subject) {
        const grades = (subject.grades || []).filter(g => g.value != null && g.percentage != null);
        if (!grades.length) return null;

        let totalPct = 0, weightedSum = 0;
        grades.forEach(g => {
            weightedSum += (parseFloat(g.value) || 0) * (parseFloat(g.percentage) || 0);
            totalPct    += parseFloat(g.percentage) || 0;
        });

        return totalPct > 0 ? weightedSum / totalPct : null;
    }

    function calcOverallAverage() {
        const scored = subjects
            .map(s => ({ score: calcSubjectScore(s), weight: parseFloat(s.weight) || 1 }))
            .filter(s => s.score !== null);

        if (!scored.length) return null;

        const totalWeight = scored.reduce((n, s) => n + s.weight, 0);
        const weightedSum = scored.reduce((n, s) => n + s.score * s.weight, 0);
        return totalWeight > 0 ? weightedSum / totalWeight : null;
    }

    function getUpcomingDeadlines(daysAhead) {
        const today  = new Date(); today.setHours(0,0,0,0);
        const cutoff = new Date(today.getTime() + daysAhead * 86400000);
        const items  = [];

        subjects.forEach(s => {
            (s.grades || []).forEach(g => {
                if (!g.dueDate) return;
                const d = new Date(g.dueDate + 'T12:00:00');
                if (isNaN(d) || d < today) return;
                if (d > cutoff) return;
                items.push({ ...g, subjectName: s.name });
            });
        });

        return items.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    function formatScore(val) {
        return Number.isInteger(val) ? val.toString() : val.toFixed(1);
    }

    function gradeLevel(score) {
        if (score >= 16) return { level: 'excellent', label: 'Excellent' };
        if (score >= 12) return { level: 'good',      label: 'Bien' };
        if (score >= 10) return { level: 'ok',        label: 'Passable' };
        return              { level: 'fail',      label: 'Échec' };
    }

    function typeName(type) {
        const names = { exam: 'Examen', assignment: 'Devoir', quiz: 'Quiz', default: 'Éval.' };
        return names[type] || 'Éval.';
    }

    function escHtml(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── Boot ───────────────────────────────────────────────────────────────
    initData();
});
