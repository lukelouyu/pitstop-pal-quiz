document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");
  const allPalsScreen = document.getElementById("all-pals-screen");

  const startBtn = document.getElementById("start-btn");
  const backStartBtn = document.getElementById("back-start-btn");
  const backPrevBtn = document.getElementById("back-prev-btn");
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
  let userAnswers = [];
  let isSubmittingResult = false;

  let currentQuestions = [];
  let rankedPals = [];

  const currentScript = document.querySelector('script[src$="script.js"]');
  const assetBase = currentScript
    ? new URL(".", currentScript.src).href
    : window.location.href;

  function getAssetUrl(fileName) {
    return new URL(fileName, assetBase).href;
  }

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

  function getRankedPals() {
    return [...Object.keys(scores)].sort((a, b) => {
      const byScore = scores[b] - scores[a];
      if (byScore !== 0) return byScore;

      const lastA = answerHistory.lastIndexOf(a);
      const lastB = answerHistory.lastIndexOf(b);
      return lastB - lastA;
    });
  }

  function getAdaptiveCandidatesForQuestion(questionId) {
    return getRankedPals().filter((palKey) => {
      return Boolean(adaptiveOptionBank?.[palKey]?.[questionId]);
    });
  }

  function buildAdaptiveQuestions() {
    const ranking = getRankedPals();
    rankedPals = ranking;

    return adaptiveTemplates.map((template, index) => {
      const optionCount = index < 3 ? 2 : 4;

      const selectedPals = getAdaptiveCandidatesForQuestion(template.id).slice(
        0,
        optionCount
      );

      return {
        id: template.id,
        q: template.q,
        sub: template.sub,
        a: selectedPals.map((palKey) => ({
          text: adaptiveOptionBank[palKey][template.id],
          pal: palKey,
          points: 1
        }))
      };
    });
  }

  function cloneAnswer(opt) {
    return {
      pal: opt.pal,
      points: opt.points || 0,
      extra: Array.isArray(opt.extra)
        ? opt.extra.map((change) => ({
            pal: change.pal,
            points: change.points || 0
          }))
        : []
    };
  }

  function recalculateStateFromAnswers() {
    scores = createEmptyScores();
    answerHistory = [];

    userAnswers.forEach((answer) => {
      if (!answer) return;

      if (scores[answer.pal] !== undefined) {
        scores[answer.pal] += answer.points || 0;
      }

      if (Array.isArray(answer.extra)) {
        answer.extra.forEach((change) => {
          if (scores[change.pal] !== undefined) {
            scores[change.pal] += change.points || 0;
          }
        });
      }

      answerHistory.push(answer.pal);
    });
  }

  function hasCompletedFixedQuestions() {
    return fixedQuestions.every((_, index) => Boolean(userAnswers[index]));
  }

  function updateQuestionSet() {
    if (hasCompletedFixedQuestions()) {
      currentQuestions = [...fixedQuestions, ...buildAdaptiveQuestions()];
    } else {
      currentQuestions = [...fixedQuestions];
    }
  }

  function getTotalQuestionCount() {
    return fixedQuestions.length + adaptiveTemplates.length;
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

    if (backPrevBtn) backPrevBtn.classList.add("hidden");
  }

  function startQuiz() {
    currentQuestionIndex = 0;
    lastResultKey = null;
    scores = createEmptyScores();
    answerHistory = [];
    userAnswers = [];
    rankedPals = [];
    updateQuestionSet();
    showScreen(quizScreen);
    renderQuestion();
  }

  function getVisibleOptions(item) {
    if (!item || !Array.isArray(item.a)) {
      return [];
    }
    return [...item.a];
  }

  function renderQuestion() {
    if (!Array.isArray(currentQuestions) || currentQuestions.length === 0) {
      showDataError("currentQuestions is empty. Please check quiz generation logic.");
      return;
    }

    if (typeof pals === "undefined") {
      showDataError("pals is missing. Please check data.js for errors.");
      return;
    }

    if (
      currentQuestionIndex === fixedQuestions.length &&
      currentQuestions.length === fixedQuestions.length &&
      hasCompletedFixedQuestions()
    ) {
      updateQuestionSet();
    }

    const item = currentQuestions[currentQuestionIndex];

    if (!item) {
      showDataError("Question data is invalid or missing.");
      return;
    }

    const visibleOptions = getVisibleOptions(item);

    if (!Array.isArray(visibleOptions) || visibleOptions.length === 0) {
      showDataError(`No valid options found for ${item.id || "this question"}.`);
      return;
    }

    if (backPrevBtn) {
      backPrevBtn.classList.toggle("hidden", currentQuestionIndex === 0);
    }

    const totalQuestionCount = getTotalQuestionCount();
    const progress = ((currentQuestionIndex + 1) / totalQuestionCount) * 100;

    if (progressText) {
      progressText.textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestionCount}`;
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

    visibleOptions.forEach((opt) => {
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

        userAnswers[currentQuestionIndex] = cloneAnswer(opt);

        recalculateStateFromAnswers();
        updateQuestionSet();

        currentQuestionIndex += 1;

        if (currentQuestionIndex < currentQuestions.length) {
          renderQuestion();
        } else {
          await showResult();
        }
      });

      optionsContainer.appendChild(button);
    });
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
      resultImage.src = getAssetUrl(result.image);
      resultImage.alt = result.short;

      resultImage.onerror = () => {
        console.error("Failed to load result image:", resultImage.src);
      };
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

    recalculateStateFromAnswers();

    const ranked = getRankedPals();
    const preferredPal = ranked[0];

    console.log("[FRONTEND] preferredPal =", preferredPal);
    console.log("[FRONTEND] rankedPals =", JSON.stringify(ranked));
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
          preferredPal,
          rankedPals: ranked,
          scores,
          answerHistory,
          quizVersion: "adaptive-6"
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
        <img src="${getAssetUrl(pal.image)}" alt="${pal.short}">
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
    userAnswers = [];
    currentQuestions = [...fixedQuestions];
    rankedPals = [];
    showScreen(startScreen);
  }

  if (startBtn) {
    startBtn.addEventListener("click", startQuiz);
  }

  if (backStartBtn) {
    backStartBtn.addEventListener("click", resetToStart);
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

  if (backPrevBtn) {
    backPrevBtn.addEventListener("click", () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex -= 1;
        userAnswers = userAnswers.slice(0, currentQuestionIndex);
        recalculateStateFromAnswers();
        updateQuestionSet();
        renderQuestion();
      }
    });
  }

  currentQuestions = [...fixedQuestions];
  showScreen(startScreen);
});