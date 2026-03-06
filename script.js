document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");
  const allPalsScreen = document.getElementById("all-pals-screen");

  const startBtn = document.getElementById("start-btn");
  const backHomeBtn = document.getElementById("back-home-btn");
  const resultHomeBtn = document.getElementById("result-home-btn");
  const retryBtn = document.getElementById("retry-btn");
  const meetPalsBtn = document.getElementById("meet-pals-btn");
  const backResultBtn = document.getElementById("back-result-btn");

  const progressText = document.getElementById("progress-text");
  const progressPercent = document.getElementById("progress-percent");
  const progressFill = document.getElementById("progress-fill");

  const questionTitle = document.getElementById("question-title");
  const questionSub = document.getElementById("question-sub");
  const optionsContainer = document.getElementById("options-container");

  const resultImage = document.getElementById("result-image");
  const resultName = document.getElementById("result-name");
  const resultDesc = document.getElementById("result-desc");
  const resultBadge = document.getElementById("result-badge");
  const resultTip = document.getElementById("result-tip");
  const finalScoreList = document.getElementById("final-score-list");
  const allPalsGrid = document.getElementById("all-pals-grid");

  let currentQuestionIndex = 0;
  let lastResultKey = null;
  let scores = createEmptyScores();
  let answerHistory = [];

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

  function showScreen(screen) {
    [startScreen, quizScreen, resultScreen, allPalsScreen].forEach((section) => {
      section.classList.add("hidden");
    });
    screen.classList.remove("hidden");
  }

function startQuiz() {
  currentQuestionIndex = 0;
  scores = createEmptyScores();
  answerHistory = [];
  showScreen(quizScreen);
  renderQuestion();
}

 function renderQuestion() {
  if (!Array.isArray(questions) || questions.length === 0) {
    questionTitle.textContent = "Quiz data not loaded";
    questionSub.textContent = "Please check data.js filename, path, or syntax.";
    optionsContainer.innerHTML = "";
    return;
  }

  const item = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  progressPercent.textContent = `${Math.round(progress)}%`;
  progressFill.style.width = `${progress}%`;

  questionTitle.textContent = item.q;
  questionSub.textContent = item.sub;
  optionsContainer.innerHTML = "";

  item.a.forEach((opt) => {
    const pal = pals[opt.pal];

    const button = document.createElement("button");
    button.className = "option-btn";
    button.style.setProperty("--accent", pal.color);
    button.style.setProperty("--accent-soft", pal.soft);

    button.innerHTML = `
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
    `;

    button.addEventListener("click", () => {
      scores[opt.pal] += opt.points;
      answerHistory.push(opt.pal);
      currentQuestionIndex += 1;

      if (currentQuestionIndex < questions.length) {
        renderQuestion();
      } else {
        showResult();
      }
    });

    optionsContainer.appendChild(button);
  });
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
    finalScoreList.innerHTML = "";

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([key, value]) => {
      const row = document.createElement("div");
      row.className = "score-row";
      row.innerHTML = `<strong>${pals[key].short}</strong><span>${value}</span>`;
      finalScoreList.appendChild(row);
    });
  }

  function showResult() {
    const topPal = getTopPal();
    const result = pals[topPal];
    lastResultKey = topPal;

    resultImage.src = result.image;
    resultImage.alt = result.short;
    resultName.textContent = result.name;
    resultDesc.textContent = result.desc;
    resultBadge.textContent = result.badge;
    resultTip.textContent = result.tip;

    renderFinalScores();
    showScreen(resultScreen);
  }

  function renderAllPals() {
    allPalsGrid.innerHTML = "";

    Object.keys(pals).forEach((key) => {
      const pal = pals[key];

      const card = document.createElement("div");
      card.className = "pal-mini-card";
      card.innerHTML = `
        <img src="${pal.image}" alt="${pal.short}">
        <div>
          <strong>${pal.name}</strong>
          <span>${pal.badge}</span>
        </div>
      `;
      allPalsGrid.appendChild(card);
    });
  }

  function resetToStart() {
    currentQuestionIndex = 0;
    scores = createEmptyScores();
    answerHistory = [];
    showScreen(startScreen);
  }

  startBtn.addEventListener("click", startQuiz);
  backHomeBtn.addEventListener("click", resetToStart);
  resultHomeBtn.addEventListener("click", resetToStart);
  retryBtn.addEventListener("click", startQuiz);
  meetPalsBtn.addEventListener("click", () => {
    renderAllPals();
    showScreen(allPalsScreen);
  });
  backResultBtn.addEventListener("click", () => {
    if (lastResultKey) {
      showScreen(resultScreen);
    } else {
      showScreen(startScreen);
    }
  });

  showScreen(startScreen);
});
