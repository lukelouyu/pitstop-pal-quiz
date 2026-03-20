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
  let userAnswers = [];
  let isSubmittingResult = false;
  let currentQuestions = [];

  const currentScript = document.querySelector('script[src$="script.js"]');
  const assetBase = currentScript
    ? new URL(".", currentScript.src).href
    : window.location.href;

  function getAssetUrl(fileName) {
    return new URL(fileName, assetBase).href;
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

  function cloneAnswer(opt) {
    return {
      pal: opt.pal,
      text: opt.text || ""
    };
  }

  function uniqueTruthy(items) {
    return [...new Set((items || []).filter(Boolean))];
  }

  function hasCompletedFixedQuestions() {
    return fixedQuestions.every((_, index) => Boolean(userAnswers[index]?.pal));
  }

  function getSeedWinners() {
    return userAnswers
      .slice(0, fixedQuestions.length)
      .map((answer) => answer?.pal)
      .filter(Boolean);
  }

  function getAdaptiveText(palKey, questionId) {
    return adaptiveOptionBank?.[palKey]?.[questionId] || null;
  }

  function getValidCandidates(questionId, candidates) {
    return uniqueTruthy(candidates).filter((palKey) => {
      return Boolean(getAdaptiveText(palKey, questionId));
    });
  }

  function chooseTwoCandidates(questionId, primary = [], secondary = []) {
    let selected = getValidCandidates(questionId, primary).slice(0, 2);

    if (selected.length < 2) {
      const backup = getValidCandidates(questionId, secondary).filter((palKey) => {
        return !selected.includes(palKey);
      });
      selected = [...selected, ...backup.slice(0, 2 - selected.length)];
    }

    if (selected.length < 2) {
      const emergency = getValidCandidates(questionId, PAL_KEYS).filter((palKey) => {
        return !selected.includes(palKey);
      });
      selected = [...selected, ...emergency.slice(0, 2 - selected.length)];
    }

    return selected.slice(0, 2);
  }

  function makeHeadToHeadQuestion(template, palA, palB) {
    if (!template || !palA || !palB) {
      return null;
    }

    const textA = getAdaptiveText(palA, template.id);
    const textB = getAdaptiveText(palB, template.id);

    if (!textA || !textB) {
      return null;
    }

    return {
      id: template.id,
      q: template.q,
      sub: template.sub,
      a: [
        {
          text: textA,
          pal: palA
        },
        {
          text: textB,
          pal: palB
        }
      ]
    };
  }

  function getOtherPal(pair, chosenPal) {
    return (pair || []).find((palKey) => palKey && palKey !== chosenPal) || null;
  }

  function buildAdaptiveQuestions() {
    if (!Array.isArray(adaptiveTemplates) || adaptiveTemplates.length < 3) {
      return [];
    }

    const seeds = getSeedWinners();

    if (seeds.length < fixedQuestions.length) {
      return [];
    }

    const [seed1, seed2, seed3] = seeds;

    const q4Pair = chooseTwoCandidates(
      adaptiveTemplates[0].id,
      [seed1, seed2],
      [seed3]
    );
    const q4Winner = userAnswers[3]?.pal || q4Pair[0] || null;
    const q4Loser = getOtherPal(q4Pair, q4Winner);

    const q5Pair = chooseTwoCandidates(
      adaptiveTemplates[1].id,
      [q4Winner, seed3],
      [q4Loser, seed1, seed2]
    );
    const q5Winner = userAnswers[4]?.pal || q5Pair[0] || null;
    const q5Loser = getOtherPal(q5Pair, q5Winner);

    const q6Pair = chooseTwoCandidates(
      adaptiveTemplates[2].id,
      [q5Winner, q5Loser],
      [q4Winner, q4Loser, seed1, seed2, seed3]
    );

    const q4 = makeHeadToHeadQuestion(adaptiveTemplates[0], q4Pair[0], q4Pair[1]);
    const q5 = makeHeadToHeadQuestion(adaptiveTemplates[1], q5Pair[0], q5Pair[1]);
    const q6 = makeHeadToHeadQuestion(adaptiveTemplates[2], q6Pair[0], q6Pair[1]);

    return [q4, q5, q6].filter(Boolean);
  }

  function updateQuestionSet() {
    if (hasCompletedFixedQuestions()) {
      currentQuestions = [...fixedQuestions, ...buildAdaptiveQuestions()];
    } else {
      currentQuestions = [...fixedQuestions];
    }
  }

  function getVisibleOptions(item) {
    if (!item || !Array.isArray(item.a)) {
      return [];
    }

    return item.a.slice(0, 2);
  }

  function startQuiz() {
    currentQuestionIndex = 0;
    lastResultKey = null;
    userAnswers = [];
    currentQuestions = [...fixedQuestions];
    updateQuestionSet();
    showScreen(quizScreen);
    renderQuestion();
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

    if (!Array.isArray(visibleOptions) || visibleOptions.length !== 2) {
      showDataError(`Expected exactly 2 valid options for ${item.id || "this question"}.`);
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
        userAnswers[currentQuestionIndex] = cloneAnswer(opt);
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

  function getFrontendWinner() {
    for (let i = userAnswers.length - 1; i >= 0; i -= 1) {
      if (userAnswers[i]?.pal) {
        return userAnswers[i].pal;
      }
    }
    return null;
  }

  function renderAssignedPal(palKey) {
    if (typeof pals === "undefined") {
      showDataError("pals is missing. Please check data.js for errors.");
      return;
    }

    const result = pals[palKey];

    if (!result) {
      showDataError("Result data is missing.");
      return;
    }

    lastResultKey = palKey;

    if (resultImage) {
      resultImage.src = getAssetUrl(result.image);
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

    const preferredPal = getFrontendWinner();

    if (!preferredPal) {
      showDataError("Could not determine final winner.");
      isSubmittingResult = false;
      return;
    }

    try {
      const response = await fetch("/api/quiz/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          preferredPal,
          seedWinners: getSeedWinners(),
          answerHistory: userAnswers.map((answer) => answer?.pal).filter(Boolean),
          quizVersion: "elimination-6"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to assign a pal.");
      }

      renderAssignedPal(data.assignedPal);
    } catch (error) {
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
    userAnswers = [];
    currentQuestions = [...fixedQuestions];
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
        updateQuestionSet();
        renderQuestion();
      }
    });
  }

  currentQuestions = [...fixedQuestions];
  showScreen(startScreen);
});