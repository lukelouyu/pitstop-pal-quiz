const scores = {
  Perry: 0,
  Iggy: 0,
  Tobi: 0,
  Ty: 0,
  Sky: 0,
  Ola: 0,
  Ping: 0
};

let currentQuestionIndex = 0;

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const progressText = document.getElementById("progress-text");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");

const questionTheme = document.getElementById("question-theme");
const questionTitle = document.getElementById("question-title");
const questionPrompt = document.getElementById("question-prompt");
const optionsContainer = document.getElementById("options-container");

const resultPalName = document.getElementById("result-pal-name");
const resultPalTagline = document.getElementById("result-pal-tagline");
const resultPalDescription = document.getElementById("result-pal-description");
const resultActionTip = document.getElementById("result-action-tip");
const finalScoreList = document.getElementById("final-score-list");

/**
 * Reset all score counters to 0.
 */
function resetScores() {
  Object.keys(scores).forEach((pal) => {
    scores[pal] = 0;
  });
}

/**
 * Show one screen and hide the others.
 */
function showScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.classList.add("hidden");
  });

  screenToShow.classList.remove("hidden");
}

/**
 * Start the quiz.
 */
function startQuiz() {
  currentQuestionIndex = 0;
  resetScores();
  showScreen(quizScreen);
  renderQuestion();
}

/**
 * Render the current question and answer buttons.
 */
function renderQuestion() {
  const question = questions[currentQuestionIndex];
  const currentNumber = currentQuestionIndex + 1;
  const percentage = Math.round((currentNumber / questions.length) * 100);

  progressText.textContent = `Question ${currentNumber} of ${questions.length}`;
  progressPercent.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;

  questionTheme.textContent = question.theme;
  questionTitle.textContent = question.title;
  questionPrompt.textContent = question.prompt;

  optionsContainer.innerHTML = "";

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.textContent = option.text;

    button.addEventListener("click", () => {
      handleAnswer(option);
    });

    optionsContainer.appendChild(button);
  });
}

/**
 * Handle answer selection.
 */
function handleAnswer(option) {
  scores[option.pal] += option.points;
  currentQuestionIndex += 1;

  if (currentQuestionIndex < questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

/**
 * Return the winning pal.
 * Tie-break rule: fixed order.
 */
function getWinningPal() {
  const palOrder = ["Perry", "Iggy", "Tobi", "Ty", "Sky", "Ola", "Ping"];
  let winner = palOrder[0];

  palOrder.forEach((pal) => {
    if (scores[pal] > scores[winner]) {
      winner = pal;
    }
  });

  return winner;
}

/**
 * Render all final scores, highest first.
 */
function renderFinalScores() {
  finalScoreList.innerHTML = "";

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  sortedScores.forEach(([pal, score]) => {
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerHTML = `<strong>${pal}</strong><span>${score}</span>`;
    finalScoreList.appendChild(row);
  });
}

/**
 * Show result screen.
 */
function showResult() {
  const winner = getWinningPal();
  const profile = palProfiles[winner];

  resultPalName.textContent = winner;
  resultPalTagline.textContent = profile.tagline;
  resultPalDescription.textContent = profile.description;
  resultActionTip.textContent = profile.actionTip;

  renderFinalScores();
  showScreen(resultScreen);
}

/**
 * Restart back to intro screen.
 */
function restartQuiz() {
  currentQuestionIndex = 0;
  resetScores();
  showScreen(startScreen);
}

startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", restartQuiz);
