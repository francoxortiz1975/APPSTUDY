document.addEventListener('DOMContentLoaded', () => {

    // ── State ────────────────────────────────────────────────────────────
    const GUEST_KEY    = 'etudlyGuestSubjects';
    const META_KEY     = 'etudlyTimelineEnd';
    const MONTHS_FR    = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];

    let subjects        = [];
    let editingIndex    = -1;   // subject index being edited in modal
    let metaDate        = localStorage.getItem(META_KEY) || defaultMetaDate();

    // ── Helpers ──────────────────────────────────────────────────────────

    function defaultMetaDate() {
        const d = new Date();
        d.setMonth(d.getMonth() + 4);
        return d.toISOString().split('T')[0];
    }

    function parseDate(str) {
        if (!str) return null;
        const d = new Date(str + 'T12:00:00');
        return isNaN(d) ? null : d;
    }

    function formatDateShort(str) {
        const d = parseDate(str);
        if (!d) return '';
        return d.getDate() + ' ' + MONTHS_FR[d.getMonth()];
    }

    function dateToPercent(dateStr, start, end) {
        const d = parseDate(dateStr);
        if (!d) return null;
        const total = end - start;
        if (total <= 0) return 0;
        return Math.max(0, Math.min(100, ((d - start) / total) * 100));
    }

    function getRange() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let start = new Date(today);
        let end   = parseDate(metaDate) || new Date(today.getTime() + 120 * 86400000);

        // Expand range to include all events
        subjects.forEach(s => (s.grades || []).forEach(g => {
            if (!g.dueDate) return;
            const d = parseDate(g.dueDate);
            if (!d) return;
            if (d < start) start = new Date(d);
            if (d > end)   end   = new Date(d);
        }));

        // 1-week padding on each side
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 14);

        // Minimum range: 10 weeks
        const minEnd = new Date(start.getTime() + 70 * 86400000);
        if (end < minEnd) end = minEnd;

        return { start, end };
    }

    // ── Data loading ─────────────────────────────────────────────────────

    function loadFromLocalStorage() {
        try { subjects = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]'); }
        catch(e) { subjects = []; }
    }

    function saveData() {
        if (window.auth && window.auth.currentUser && window.db) {
            const uid = window.auth.currentUser.uid;
            window.db.collection('users').doc(uid).update({
                subjects,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(console.error);
        }
        localStorage.setItem(GUEST_KEY, JSON.stringify(subjects));
    }

    function initData() {
        loadFromLocalStorage();
        render();

        const tryFirebase = () => {
            if (window.auth) {
                window.auth.onAuthStateChanged(user => {
                    updateSidebarForUser(user);
                    if (user && window.db) {
                        window.db.collection('users').doc(user.uid).get()
                            .then(doc => {
                                if (doc.exists && doc.data().subjects) {
                                    subjects = doc.data().subjects;
                                    render();
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

    // ── Sidebar auth UI ──────────────────────────────────────────────────

    function updateSidebarForUser(user) {
        const guestEl   = document.getElementById('guest-profile');
        const authEl    = document.getElementById('auth-profile');
        const nameEl    = document.getElementById('sidebar-user-name');
        const emailEl   = document.getElementById('sidebar-user-email');
        const picEl     = document.getElementById('sidebar-user-pic');

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

    // Google sign-in on overlay
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

    // ── Meta date control ────────────────────────────────────────────────

    const metaInput = document.getElementById('meta-date-input');
    if (metaInput) {
        metaInput.value = metaDate;
        metaInput.addEventListener('change', () => {
            metaDate = metaInput.value;
            localStorage.setItem(META_KEY, metaDate);
            render();
        });
    }

    // ── Render ───────────────────────────────────────────────────────────

    function render() {
        const emptyState = document.getElementById('timeline-empty');
        const scrollArea = document.getElementById('timeline-scroll');

        if (!subjects.length) {
            emptyState.style.display = 'flex';
            scrollArea.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        scrollArea.style.display = 'block';

        const { start, end } = getRange();
        renderMonthLabels(start, end);
        renderRows(start, end);
    }

    function renderMonthLabels(start, end) {
        const monthsCol = document.getElementById('tl-months');
        monthsCol.innerHTML = '';

        const today   = new Date(); today.setHours(12, 0, 0, 0);
        const todayPct = dateToPercent(today.toISOString().split('T')[0], start, end);
        const metaPct  = metaDate ? dateToPercent(metaDate, start, end) : null;

        // Walk months
        const cur = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cur <= end) {
            const pct = ((cur - start) / (end - start)) * 100;
            if (pct >= 0 && pct <= 100) {
                const tick = document.createElement('div');
                tick.className = 'tl-month-tick';
                tick.style.left = pct + '%';
                monthsCol.appendChild(tick);

                const label = document.createElement('div');
                label.className = 'tl-month-label';
                label.style.left = pct + '%';
                label.textContent = MONTHS_FR[cur.getMonth()] + ' ' + cur.getFullYear();
                monthsCol.appendChild(label);
            }
            cur.setMonth(cur.getMonth() + 1);
        }

        // Today label
        if (todayPct !== null && todayPct >= 0 && todayPct <= 100) {
            const todayLbl = document.createElement('div');
            todayLbl.className = 'tl-today-label';
            todayLbl.style.left = todayPct + '%';
            todayLbl.textContent = 'Aujourd\'hui';
            monthsCol.appendChild(todayLbl);
        }

        // Meta label
        if (metaPct !== null && metaPct >= 0 && metaPct <= 100) {
            const metaLbl = document.createElement('div');
            metaLbl.className = 'tl-meta-label';
            metaLbl.style.left = metaPct + '%';
            metaLbl.textContent = 'Fin';
            monthsCol.appendChild(metaLbl);
        }
    }

    function renderRows(start, end) {
        const container = document.getElementById('timeline-rows');
        container.innerHTML = '';

        const today    = new Date(); today.setHours(12, 0, 0, 0);
        const todayPct = ((today - start) / (end - start)) * 100;
        const metaPct  = metaDate ? ((parseDate(metaDate) - start) / (end - start)) * 100 : null;

        subjects.forEach((subject, idx) => {
            const row = document.createElement('div');
            row.className = 'timeline-row';

            // ── Label column ──────────────────────────────────────────
            const label = document.createElement('div');
            label.className = 'timeline-row-label';
            label.innerHTML = `
                <span class="subject-dot" style="background:${subject.color || '#4a90d9'}"></span>
                <span class="subject-name-text" title="${subject.name}">${subject.name}</span>
                <button class="add-dates-btn" title="Ajouter / modifier des dates">+</button>
            `;
            label.querySelector('.add-dates-btn').addEventListener('click', () => openModal(idx));

            // ── Chart column ──────────────────────────────────────────
            const chart = document.createElement('div');
            chart.className = 'timeline-row-chart';

            // Grid lines (one per month tick)
            const cur = new Date(start.getFullYear(), start.getMonth(), 1);
            while (cur <= end) {
                const pct = ((cur - start) / (end - start)) * 100;
                if (pct >= 0 && pct <= 100) {
                    const gl = document.createElement('div');
                    gl.className = 'tl-grid-line';
                    gl.style.left = pct + '%';
                    chart.appendChild(gl);
                }
                cur.setMonth(cur.getMonth() + 1);
            }

            // Today line
            if (todayPct >= 0 && todayPct <= 100) {
                const tl = document.createElement('div');
                tl.className = 'today-marker';
                tl.style.left = todayPct + '%';
                chart.appendChild(tl);
            }

            // Meta line
            if (metaPct !== null && metaPct >= 0 && metaPct <= 100) {
                const ml = document.createElement('div');
                ml.className = 'meta-marker';
                ml.style.left = metaPct + '%';
                chart.appendChild(ml);
            }

            // Events
            (subject.grades || []).forEach(grade => {
                if (!grade.dueDate) return;
                const pct = dateToPercent(grade.dueDate, start, end);
                if (pct === null) return;

                const type = grade.type || 'default';
                const ev   = document.createElement('div');
                ev.className = `timeline-event type-${type}`;
                ev.style.left = pct + '%';

                const dot     = document.createElement('div');
                dot.className = 'event-dot';

                const tick    = document.createElement('div');
                tick.className = 'event-tick';

                const evLabel = document.createElement('div');
                evLabel.className = 'event-label';
                evLabel.textContent = grade.name;

                const tooltip = document.createElement('div');
                tooltip.className = 'event-tooltip';
                tooltip.textContent = `${grade.name} · ${formatDateShort(grade.dueDate)} (${grade.percentage}%)`;

                ev.appendChild(tooltip);
                ev.appendChild(dot);
                ev.appendChild(tick);
                ev.appendChild(evLabel);
                chart.appendChild(ev);
            });

            row.appendChild(label);
            row.appendChild(chart);
            container.appendChild(row);
        });
    }

    // ── Modal ────────────────────────────────────────────────────────────

    function openModal(subjectIndex) {
        editingIndex = subjectIndex;
        const subject = subjects[subjectIndex];

        document.getElementById('modal-subject-name').textContent = subject.name;

        const list = document.getElementById('modal-grades-list');
        list.innerHTML = '';

        (subject.grades || []).forEach((grade, gIdx) => {
            const item = document.createElement('div');
            item.className = 'modal-grade-item';

            item.innerHTML = `
                <div>
                    <div class="modal-grade-name">${grade.name}</div>
                    <div class="modal-grade-pct">${grade.percentage}% du cours</div>
                </div>
                <select class="modal-type-select" data-grade="${gIdx}">
                    <option value="exam"       ${grade.type === 'exam'       ? 'selected' : ''}>Examen</option>
                    <option value="assignment" ${grade.type === 'assignment' ? 'selected' : ''}>Devoir</option>
                    <option value="quiz"       ${grade.type === 'quiz'       ? 'selected' : ''}>Quiz / Test</option>
                </select>
                <input type="date" class="modal-date-input" data-grade="${gIdx}"
                       value="${grade.dueDate || ''}">
            `;
            list.appendChild(item);
        });

        if (!(subject.grades || []).length) {
            list.innerHTML = '<p style="color:#6c757d;font-size:0.85rem;text-align:center;padding:16px 0">Aucune évaluation dans ce cours.<br>Ajoute des notes dans le Calculateur d\'abord.</p>';
        }

        document.getElementById('date-modal').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('date-modal').style.display = 'none';
        editingIndex = -1;
    }

    function saveModal() {
        if (editingIndex === -1) return;
        const subject = subjects[editingIndex];

        document.querySelectorAll('#modal-grades-list .modal-grade-item').forEach(item => {
            const gIdx     = parseInt(item.querySelector('.modal-type-select').dataset.grade);
            const type     = item.querySelector('.modal-type-select').value;
            const dueDate  = item.querySelector('.modal-date-input').value || null;

            if (subject.grades[gIdx]) {
                subject.grades[gIdx].type    = type;
                subject.grades[gIdx].dueDate = dueDate;
            }
        });

        saveData();
        closeModal();
        render();
    }

    document.getElementById('modal-close')?.addEventListener('click',  closeModal);
    document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
    document.getElementById('modal-save')?.addEventListener('click',   saveModal);

    // Close on backdrop click
    document.getElementById('date-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('date-modal')) closeModal();
    });

    // ── Boot ─────────────────────────────────────────────────────────────
    initData();
});
