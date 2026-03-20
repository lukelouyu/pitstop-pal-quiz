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

  const allPalsGrid = document.getElementById("all-pals-grid");

  let currentQuestionIndex = 0;
  let lastResultKey = null;
  let scores = createEmptyScores();
  let answerHistory = [];
  let isSubmittingResult = false;

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
      if (section) {
        section.classList.add("hidden");
      }
    });

    if (screen) {
      screen.classList.remove("hidden");
    }
  }

  function showDataError(message) {
    showScreen(quizScreen);

    if (questionTitle) questionTitle.textContent = "Quiz data not loaded";
    if (questionSub) questionSub.textContent = message;
    if (optionsContainer) optionsContainer.innerHTML = "";
    if (progressText) progressText.textContent = "Question 0 of 0";
    if (progressPercent) progressPercent.textContent = "0%";
    if (progressFill) progressFill.style.width = "0%";
  }

  function startQuiz() {
    currentQuestionIndex = 0;
    lastResultKey = null;
    scores = createEmptyScores();
    answerHistory = [];
    showScreen(quizScreen);
    renderQuestion();
  }

  function renderQuestion() {
    if (typeof questions === "undefined") {
      showDataError("questions is missing. Please check that data.js is uploaded and linked correctly.");
      return;
    }

    if (typeof pals === "undefined") {
      showDataError("pals is missing. Please check data.js for errors.");
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      showDataError("No quiz questions found in data.js.");
      return;
    }

    const item = questions[currentQuestionIndex];

    if (!item) {
      showDataError("Question data is invalid or missing.");
      return;
    }

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    if (progressText) {
      progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    }

    if (progressPercent) {
      progressPercent.textContent = `${Math.round(progress)}%`;
    }

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }

    if (questionTitle) {
      questionTitle.textContent = item.q || "";
    }

    if (questionSub) {
      questionSub.textContent = item.sub || "";
    }

    if (!optionsContainer) return;
    optionsContainer.innerHTML = "";

    item.a.forEach((opt) => {
      const pal = pals[opt.pal];

      if (!pal) return;

      const button = document.createElement("button");
      button.className = "option-btn";
      button.style.setProperty("--accent", pal.color || "#999");
      button.style.setProperty("--accent-soft", pal.soft || "#eee");

      button.innerHTML = `
        <p class="option-desc">${opt.text}</p>
      `;

      button.addEventListener("click", async () => {
        console.log("Option clicked:", opt.text, "| pal =", opt.pal, "| qIndex =", currentQuestionIndex);

        if (scores[opt.pal] !== undefined) {
          scores[opt.pal] += opt.points || 0;
        }

        if (Array.isArray(opt.extra)) {
          opt.extra.forEach((change) => {
            if (scores[change.pal] !== undefined) {
              scores[change.pal] += change.points || 0;
            }
          });
        }

        answerHistory.push(opt.pal);
        currentQuestionIndex += 1;

        console.log("After click, currentQuestionIndex =", currentQuestionIndex, "questions.length =", questions.length);

        if (currentQuestionIndex < questions.length) {
          renderQuestion();
        } else {
          console.log("Reached final question. Calling showResult()...");
          await showResult();
        }

      });

      optionsContainer.appendChild(button);
    });
  }

  function getTopPal() {
    const maxScore = Math.max(...Object.values(scores));
    const tied = Object.keys(scores).filter((key) => scores[key] === maxScore);

    if (tied.length === 1) {
      console.log("[FRONTEND] getTopPal unique =", tied[0]);
      return tied[0];
    }

    for (let i = answerHistory.length - 1; i >= 0; i -= 1) {
      if (tied.includes(answerHistory[i])) {
        console.log("[FRONTEND] getTopPal tie-broken =", answerHistory[i]);
        return answerHistory[i];
      }
    }

    console.log("[FRONTEND] getTopPal fallback =", tied[0]);
    return tied[0];
  }

  function renderAssignedPal(palKey) {
    console.log("[FRONTEND] rendering pal =", palKey);

    if (typeof pals === "undefined") {
      showDataError("pals is missing. Please check data.js for errors.");
      return;
    }

    const result = pals[palKey];

    if (!result) {
      console.error("[FRONTEND] result not found for pal =", palKey);
      showDataError("Result data is missing.");
      return;
    }

    lastResultKey = palKey;

    if (resultImage) {
      resultImage.src = result.image;
      resultImage.alt = result.short;
    }

    if (resultName) {
      resultName.textContent = result.name;
    }

    if (resultDesc) {
      resultDesc.textContent = result.desc;
    }

    if (resultBadge) {
      resultBadge.textContent = result.badge;
    }

    if (resultTip) {
      resultTip.textContent = result.tip;
    }

    showScreen(resultScreen);
  }

  async function showResult() {
    if (isSubmittingResult) return;
    isSubmittingResult = true;

    const localPreferredPal = getTopPal();
    console.log("[FRONTEND] local preferredPal =", localPreferredPal);
    console.log("[FRONTEND] scores =", JSON.stringify(scores));
    console.log("[FRONTEND] answerHistory =", JSON.stringify(answerHistory));

    if (questionTitle) {
      questionTitle.textContent = "Assigning your PitStop Pal...";
    }

    if (questionSub) {
      questionSub.textContent = "Please wait a moment.";
    }

    if (optionsContainer) {
      optionsContainer.innerHTML = "";
    }

    try {
      const response = await fetch("/api/quiz/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scores,
          answerHistory
        })
      });

      const data = await response.json();

      console.log("[FRONTEND] API response =", data);
      console.log("[FRONTEND] requestCount =", data.requestCount);

      if (!response.ok) {
        throw new Error(data.error || "Unable to assign a pal.");
      }

      console.log("[FRONTEND] assignedPal from backend =", data.assignedPal);
      console.log("[FRONTEND] preferredPal from backend =", data.preferredPal);

      renderAssignedPal(data.assignedPal);
    } catch (error) {
      console.error("[FRONTEND] showResult error =", error);
      showDataError(error.message || "Something went wrong while assigning the result.");
    } finally {
      isSubmittingResult = false;
    }
  }


  function renderAllPals() {
    if (!allPalsGrid || typeof pals === "undefined") return;

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
    lastResultKey = null;
    scores = createEmptyScores();
    answerHistory = [];
    showScreen(startScreen);
  }

  if (startBtn) {
    startBtn.addEventListener("click", startQuiz);
  }

  if (backHomeBtn) {
    backHomeBtn.addEventListener("click", resetToStart);
  }

  if (resultHomeBtn) {
    resultHomeBtn.addEventListener("click", resetToStart);
  }

  if (retryBtn) {
    retryBtn.addEventListener("click", startQuiz);
  }

  if (meetPalsBtn) {
    meetPalsBtn.addEventListener("click", () => {
      renderAllPals();
      showScreen(allPalsScreen);
    });
  }

  if (backResultBtn) {
    backResultBtn.addEventListener("click", () => {
      if (lastResultKey) {
        showScreen(resultScreen);
      } else {
        showScreen(startScreen);
      }
    });
  }

  showScreen(startScreen);
});
