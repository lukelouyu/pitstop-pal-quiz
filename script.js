let currentQuestion = -1;
let answerHistory = [];
let scores = createEmptyScores();
let lastResultKey = null;

const app = document.getElementById("app");

function createEmptyScores() {
  return {
    perry: 0,
    ping: 0,
    ola: 0,
    ty: 0,
    sky: 0,
    tobi: 0,
    iggy: 0
  };
}

function render(html) {
  app.innerHTML = html;
}

function showStart() {
  render(`
    <div class="screen">
      <div class="top-row">
        <div class="tag">🌼 NUS PSS Wellness Quiz</div>
      </div>

      <div class="hero-card">
        <img src="${START_IMAGE}" alt="PitStop Pal event poster start screen">
      </div>

      <div class="intro-copy">
        <h1>Which PitStop Pal Are You?</h1>
        <p>
          Answer a few quick questions and discover the PitStop Pal
          that matches your natural wellness style.
        </p>

        <div class="start-btn-wrap">
          <button class="start-btn-below" onclick="startQuiz()">Start Quiz</button>
        </div>

        <div class="info-strip">
          <div class="chip">⏱ Around 2–3 minutes</div>
          <div class="chip">🎯 14 questions</div>
          <div class="chip">💛 Find your wellness match</div>
        </div>

        <div class="floating-mascots">
          <div class="mini-mascot"><img src="perry.png" alt="Perry"></div>
          <div class="mini-mascot"><img src="ola.png" alt="Ola"></div>
          <div class="mini-mascot"><img src="iggy.png" alt="Iggy"></div>
        </div>
      </div>
    </div>
  `);
}

function startQuiz() {
  currentQuestion = 0;
  scores = createEmptyScores();
  answerHistory = [];
  showQuestion();
}

function showQuestion() {
  if (currentQuestion >= questions.length) {
    showResult();
    return;
  }

  const item = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  render(`
    <div class="screen">
      <div class="top-row">
        <div class="tag">🚏 Campus Cruise</div>
        <button class="ghost-btn" onclick="showStart()">Back to start</button>
      </div>

      <div class="progress-wrap">
        <div class="progress-label">
          <span>Question ${currentQuestion + 1} of ${questions.length}</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>

      <div class="question-card">
        <h2>${item.q}</h2>
        <p class="question-sub">${item.sub}</p>

        <div class="options">
          ${item.a.map((opt, index) => {
            const pal = pals[opt.pal];
            return `
              <button
                class="option-btn"
                style="--accent:${pal.color}; --accent-soft:${pal.soft};"
                onclick="chooseAnswer(${index})"
              >
                <div class="option-top">
                  <div class="option-avatar">
                    <img src="${pal.image}" alt="${pal.short}">
                  </div>
                  <div>
                    <div class="option-title">${pal.short}</div>
                    <div class="option-label">${pal.badge}</div>
                  </div>
                </div>
                <p class="option-desc">${opt.text}</p>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `);
}

function chooseAnswer(optionIndex) {
  const selected = questions[currentQuestion].a[optionIndex];
  scores[selected.pal] += selected.points;
  answerHistory.push(selected.pal);
  currentQuestion += 1;
  showQuestion();
}

function getTopPal() {
  const maxScore = Math.max(...Object.values(scores));
  const tied = Object.keys(scores).filter((key) => scores[key] === maxScore);

  if (tied.length === 1) {
    return tied[0];
  }

  for (let i = answerHistory.length - 1; i >= 0; i--) {
    if (tied.includes(answerHistory[i])) {
      return answerHistory[i];
    }
  }

  return tied[0];
}

function renderFinalScores() {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return sorted.map(([key, value]) => {
    const pal = pals[key];
    return `
      <div class="score-row">
        <strong>${pal.short}</strong>
        <span>${value}</span>
      </div>
    `;
  }).join("");
}

function showResult() {
  const topPal = getTopPal();
  lastResultKey = topPal;
  const result = pals[topPal];

  render(`
    <div class="screen">
      <div class="top-row">
        <div class="tag">✨ Your PitStop Pal</div>
        <button class="ghost-btn" onclick="showStart()">Home</button>
      </div>

      <div class="result-card">
        <div class="result-main">
          <div class="result-figure">
            <img src="${result.image}" alt="${result.short}">
          </div>

          <div>
            <h1>${result.name}</h1>
            <p>${result.desc}</p>
            <div class="pill">${result.badge}</div>
          </div>
        </div>

        <div class="tip-box">
          <strong>Try this today:</strong> ${result.tip}
        </div>

        <div class="score-box">
          <h3>Final Score</h3>
          <div class="final-score-list">
            ${renderFinalScores()}
          </div>
        </div>

        <div class="result-actions">
          <button class="secondary-btn" onclick="resetQuiz()">Try Again</button>
          <button class="primary-btn" onclick="showAllPals()">Meet All the Pals</button>
        </div>
      </div>
    </div>
  `);
}

function showAllPals() {
  render(`
    <div class="screen">
      <div class="top-row">
        <div class="tag">🌟 Meet the Pals</div>
        <button class="ghost-btn" onclick="${lastResultKey ? "showResult()" : "showStart()"}">
          ${lastResultKey ? "Back to result" : "Back"}
        </button>
      </div>

      <div class="all-pals-card">
        <h2 style="margin-top:0;">All PitStop Pals</h2>
        <p class="question-sub" style="margin-bottom:18px;">
          Each Pal represents a different way of caring for your well-being.
        </p>

        <div class="all-pals-grid">
          ${Object.keys(pals).map((key) => {
            const pal = pals[key];
            return `
              <div class="pal-mini-card">
                <img src="${pal.image}" alt="${pal.short}">
                <div>
                  <strong>${pal.name}</strong>
                  <span>${pal.badge}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `);
}

function resetQuiz() {
  currentQuestion = -1;
  answerHistory = [];
  scores = createEmptyScores();
  lastResultKey = null;
  showStart();
}

showStart();
