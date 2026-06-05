document.addEventListener('DOMContentLoaded', () => {

    // ── Constants ────────────────────────────────────────────────────────
    const GUEST_KEY = 'etudlyGuestSubjects';

    // ── State ────────────────────────────────────────────────────────────
    let subjects     = [];
    let quizData     = null;   // { questions, subjectName }
    let currentQIdx  = 0;
    let answers      = [];     // index of chosen option per question (-1 = unanswered)
    let selectedCount = 5;
    let answered     = false;  // whether current question has been answered

    // ── Data ─────────────────────────────────────────────────────────────

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
        renderTopicsTab();
        populateQuizSubjectSelect();

        const tryFirebase = () => {
            if (window.auth) {
                window.auth.onAuthStateChanged(user => {
                    updateSidebarForUser(user);
                    if (user && window.db) {
                        window.db.collection('users').doc(user.uid).get()
                            .then(doc => {
                                if (doc.exists && doc.data().subjects) {
                                    subjects = doc.data().subjects;
                                    renderTopicsTab();
                                    populateQuizSubjectSelect();
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

    // ── Sidebar auth ──────────────────────────────────────────────────────

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

    // ── Tabs ──────────────────────────────────────────────────────────────

    document.querySelectorAll('.sp-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sp-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.sp-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('sp-' + tab.dataset.tab).classList.add('active');
        });
    });

    // ── Topic Manager ─────────────────────────────────────────────────────

    function renderTopicsTab() {
        const grid  = document.getElementById('sp-subjects-grid');
        const empty = document.getElementById('topics-empty');

        if (!subjects.length) {
            empty.style.display = 'flex';
            grid.style.display  = 'none';
            return;
        }

        empty.style.display = 'none';
        grid.style.display  = 'grid';
        grid.innerHTML = '';

        subjects.forEach((subject, idx) => {
            const topics = subject.topics || [];
            const card = document.createElement('div');
            card.className = 'subject-topics-card';

            card.innerHTML = `
                <div class="stc-header">
                    <span class="stc-dot" style="background:${subject.color || '#4a90d9'}"></span>
                    <span class="stc-name" title="${subject.name}">${subject.name}</span>
                    <span class="stc-count">${topics.length} thème${topics.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="topics-chips" id="chips-${idx}">
                    ${topics.length
                        ? topics.map((t, ti) => topicChipHTML(idx, ti, t)).join('')
                        : '<span class="topics-empty">Aucun thème — ajoutez-en ci-dessous</span>'
                    }
                </div>
                <div class="topic-add-row">
                    <input type="text" class="topic-add-input" placeholder="Ex: Intégrales, WWII, Marketing…"
                           id="topic-input-${idx}" maxlength="60">
                    <button class="topic-add-btn" data-idx="${idx}">+ Ajouter</button>
                </div>
            `;

            // Add topic on button click
            card.querySelector('.topic-add-btn').addEventListener('click', () => addTopic(idx));

            // Add topic on Enter
            card.querySelector(`#topic-input-${idx}`).addEventListener('keydown', e => {
                if (e.key === 'Enter') { e.preventDefault(); addTopic(idx); }
            });

            grid.appendChild(card);
        });

        // Delegate remove chip clicks
        grid.querySelectorAll('.topic-chip-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                removeTopic(parseInt(btn.dataset.si), parseInt(btn.dataset.ti));
            });
        });
    }

    function topicChipHTML(si, ti, text) {
        return `<span class="topic-chip">
            <span>${escHtml(text)}</span>
            <button class="topic-chip-remove" data-si="${si}" data-ti="${ti}" title="Supprimer">×</button>
        </span>`;
    }

    function escHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function addTopic(subjectIdx) {
        const input = document.getElementById(`topic-input-${subjectIdx}`);
        const value = (input.value || '').trim();
        if (!value) return;

        if (!subjects[subjectIdx].topics) subjects[subjectIdx].topics = [];

        // Avoid duplicates (case-insensitive)
        const existing = subjects[subjectIdx].topics.map(t => t.toLowerCase());
        if (existing.includes(value.toLowerCase())) {
            input.value = '';
            return;
        }

        subjects[subjectIdx].topics.push(value);
        input.value = '';
        saveData();
        renderTopicsTab();
        populateQuizSubjectSelect();

        // Re-focus same input after re-render
        document.getElementById(`topic-input-${subjectIdx}`)?.focus();
    }

    function removeTopic(subjectIdx, topicIdx) {
        subjects[subjectIdx].topics.splice(topicIdx, 1);
        saveData();
        renderTopicsTab();
        populateQuizSubjectSelect();

        // Refresh quiz topics list if this subject is selected
        const sel = document.getElementById('quiz-subject-select');
        if (sel && parseInt(sel.value) === subjectIdx) {
            renderQuizTopics(subjectIdx);
        }
    }

    // ── Quiz Setup ─────────────────────────────────────────────────────────

    function populateQuizSubjectSelect() {
        const sel = document.getElementById('quiz-subject-select');
        const current = sel.value;
        sel.innerHTML = '<option value="">Sélectionner une matière</option>';

        subjects.forEach((s, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = s.name;
            sel.appendChild(opt);
        });

        if (current !== '' && subjects[parseInt(current)]) {
            sel.value = current;
        }
    }

    document.getElementById('quiz-subject-select').addEventListener('change', function() {
        const idx = parseInt(this.value);
        if (isNaN(idx)) {
            document.getElementById('quiz-topics-list').innerHTML = '<span class="quiz-no-topics">Sélectionnez une matière</span>';
            document.getElementById('quiz-generate-btn').disabled = true;
            return;
        }
        renderQuizTopics(idx);
    });

    function renderQuizTopics(subjectIdx) {
        const list   = document.getElementById('quiz-topics-list');
        const topics = subjects[subjectIdx]?.topics || [];

        if (!topics.length) {
            list.innerHTML = '<span class="quiz-no-topics">Aucun thème — ajoutez-en dans l\'onglet "Mes Thèmes"</span>';
            document.getElementById('quiz-generate-btn').disabled = true;
            return;
        }

        list.innerHTML = topics.map((t, i) => `
            <label class="quiz-topic-check">
                <input type="checkbox" value="${i}" checked>
                <span>${escHtml(t)}</span>
            </label>
        `).join('');

        updateGenerateBtn();

        list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', updateGenerateBtn);
        });
    }

    function updateGenerateBtn() {
        const anyChecked = document.querySelectorAll('#quiz-topics-list input:checked').length > 0;
        const hasSubject = document.getElementById('quiz-subject-select').value !== '';
        document.getElementById('quiz-generate-btn').disabled = !(anyChecked && hasSubject);
    }

    // Question count pills
    document.querySelectorAll('.quiz-count-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.quiz-count-pill').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            selectedCount = parseInt(pill.dataset.count);
        });
    });

    // ── Quiz Generation ───────────────────────────────────────────────────

    document.getElementById('quiz-generate-btn').addEventListener('click', generateQuiz);

    async function generateQuiz() {
        const subjectIdx = parseInt(document.getElementById('quiz-subject-select').value);
        const subject    = subjects[subjectIdx];
        if (!subject) return;

        const checkedBoxes = document.querySelectorAll('#quiz-topics-list input:checked');
        const topics = Array.from(checkedBoxes).map(cb => {
            const idx = parseInt(cb.value);
            return subject.topics[idx];
        }).filter(Boolean);

        if (!topics.length) return;

        hideQuizError();
        showQuizState('quiz-loading');

        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: subject.name,
                    topics,
                    numQuestions: selectedCount
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Erreur ${response.status}`);
            }

            if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
                throw new Error('Réponse invalide — réessayez.');
            }

            quizData = {
                questions:   data.questions,
                subjectName: subject.name
            };
            startQuiz();

        } catch (err) {
            console.error('Quiz generation error:', err);
            showQuizError(err.message || 'Erreur lors de la génération. Vérifiez la clé API Gemini.');
            showQuizState('quiz-welcome');
        }
    }

    // ── Quiz Gameplay ─────────────────────────────────────────────────────

    function startQuiz() {
        currentQIdx = 0;
        answers = new Array(quizData.questions.length).fill(-1);
        showQuizState('quiz-question');
        renderQuestion(0);
    }

    function renderQuestion(idx) {
        const q = quizData.questions[idx];
        answered = false;

        document.getElementById('q-counter').textContent =
            `Question ${idx + 1} / ${quizData.questions.length}`;
        document.getElementById('q-subject-badge').textContent = quizData.subjectName;

        const pct = ((idx) / quizData.questions.length) * 100;
        document.getElementById('q-progress-fill').style.width = pct + '%';

        document.getElementById('q-text').textContent = q.question;

        const optContainer = document.getElementById('q-options');
        optContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];

        (q.options || []).forEach((opt, oi) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.innerHTML = `<span class="option-letter">${letters[oi]}</span>${escHtml(opt)}`;
            btn.addEventListener('click', () => selectAnswer(oi));
            optContainer.appendChild(btn);
        });

        const expl = document.getElementById('q-explanation');
        expl.textContent = '';
        expl.classList.remove('visible');

        const nextBtn = document.getElementById('q-next-btn');
        nextBtn.disabled = true;
        nextBtn.textContent = (idx === quizData.questions.length - 1) ? 'Voir les résultats' : 'Suivant →';
    }

    function selectAnswer(optionIdx) {
        if (answered) return;
        answered = true;

        const q       = quizData.questions[currentQIdx];
        const correct = q.correct;
        answers[currentQIdx] = optionIdx;

        const btns = document.querySelectorAll('#q-options .quiz-option-btn');
        btns.forEach((btn, i) => {
            btn.disabled = true;
            if (i === correct)    btn.classList.add('correct');
            if (i === optionIdx && optionIdx !== correct) btn.classList.add('wrong');
        });

        if (q.explanation) {
            const expl = document.getElementById('q-explanation');
            expl.textContent = q.explanation;
            expl.classList.add('visible');
        }

        document.getElementById('q-next-btn').disabled = false;
    }

    document.getElementById('q-next-btn').addEventListener('click', () => {
        if (!answered) return;
        currentQIdx++;
        if (currentQIdx < quizData.questions.length) {
            renderQuestion(currentQIdx);
        } else {
            showResults();
        }
    });

    // ── Results ────────────────────────────────────────────────────────────

    function showResults() {
        const total   = quizData.questions.length;
        const correct = answers.filter((a, i) => a === quizData.questions[i].correct).length;
        const pct     = Math.round((correct / total) * 100);

        // Score circle
        const circle = document.getElementById('score-circle');
        circle.className = 'score-circle';
        if (pct >= 80)      circle.classList.add('excellent');
        else if (pct >= 60) circle.classList.add('good');
        else if (pct >= 40) circle.classList.add('ok');
        else                circle.classList.add('fail');

        document.getElementById('score-number').textContent = pct + '%';
        document.getElementById('score-text').textContent = `${correct} bonne${correct > 1 ? 's' : ''} réponse${correct > 1 ? 's' : ''} sur ${total}`;

        const verdicts = {
            excellent: 'Excellent ! Vous maîtrisez ce sujet.',
            good:      'Bien ! Encore quelques révisions et ce sera parfait.',
            ok:        'Pas mal, mais il faut retravailler certains thèmes.',
            fail:      'Il faut réviser davantage ces thèmes.'
        };
        const level = pct >= 80 ? 'excellent' : pct >= 60 ? 'good' : pct >= 40 ? 'ok' : 'fail';
        document.getElementById('score-verdict').textContent = verdicts[level];

        // Progress bar to 100%
        document.getElementById('q-progress-fill').style.width = '100%';

        // Review list
        const reviewList = document.getElementById('quiz-review-list');
        reviewList.innerHTML = '';
        quizData.questions.forEach((q, i) => {
            const isCorrect = answers[i] === q.correct;
            const item = document.createElement('div');
            item.className = `review-item ${isCorrect ? 'correct-item' : 'wrong-item'}`;

            const letters = ['A', 'B', 'C', 'D'];
            const yourAns = answers[i] >= 0 ? `${letters[answers[i]]}. ${q.options[answers[i]]}` : '—';
            const corrAns = `${letters[q.correct]}. ${q.options[q.correct]}`;

            item.innerHTML = `
                <div class="review-q">${isCorrect ? '✓' : '✗'} ${escHtml(q.question)}</div>
                <div class="review-ans">
                    ${isCorrect
                        ? `<span class="correct-ans">${escHtml(corrAns)}</span>`
                        : `Votre réponse: <span class="wrong-ans">${escHtml(yourAns)}</span> —
                           Bonne réponse: <span class="correct-ans">${escHtml(corrAns)}</span>`
                    }
                </div>
            `;
            reviewList.appendChild(item);
        });

        showQuizState('quiz-results');
    }

    document.getElementById('btn-retry').addEventListener('click', () => {
        startQuiz();
    });

    document.getElementById('btn-new-quiz').addEventListener('click', () => {
        quizData = null;
        showQuizState('quiz-welcome');
    });

    // ── Quiz state helpers ─────────────────────────────────────────────────

    function showQuizState(stateId) {
        ['quiz-welcome', 'quiz-loading', 'quiz-question', 'quiz-results'].forEach(id => {
            document.getElementById(id).classList.remove('active');
        });
        document.getElementById(stateId).classList.add('active');
    }

    function showQuizError(msg) {
        const el = document.getElementById('quiz-error');
        el.textContent = msg;
        el.classList.add('visible');
    }

    function hideQuizError() {
        const el = document.getElementById('quiz-error');
        el.textContent = '';
        el.classList.remove('visible');
    }

    // ── Boot ───────────────────────────────────────────────────────────────
    initData();
});
