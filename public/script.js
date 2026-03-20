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

  // Core branch = the pals that compete in Q5
  const CORE_PALS = ["ping", "perry", "iggy", "tobi"];

  // Special branch = the pals that compete with Ola in Q4
  const SPECIAL_PALS = ["sky", "ty"];

  // Keep only candidates that belong to a specific pool.
  function filterPool(candidates, pool) {
    return uniqueTruthy(candidates).filter((palKey) => pool.includes(palKey));
  }

  // Pick a single valid pal for a question.
  // It tries the preferred list first, then fallback list.
  function pickOneCandidate(questionId, preferred = [], fallback = []) {
    return getValidCandidates(questionId, [...preferred, ...fallback])[0] || null;
  }

  function buildAdaptiveQuestions() {
    // We expect 3 adaptive templates: q4, q5, q6
    if (!Array.isArray(adaptiveTemplates) || adaptiveTemplates.length < 3) {
      return [];
    }

    // Seeds are the winners from the first 3 fixed questions.
    const seeds = getSeedWinners();

    // Do not build adaptive questions until all fixed questions are answered.
    if (seeds.length < fixedQuestions.length) {
      return [];
    }

    const q4Template = adaptiveTemplates[0];
    const q5Template = adaptiveTemplates[1];
    const q6Template = adaptiveTemplates[2];

    // Split the fixed-question winners into two branches:
    // - core pals go to Q5
    // - special pals fight Ola in Q4
    const coreSeeds = filterPool(seeds, CORE_PALS);
    const specialSeeds = filterPool(seeds, SPECIAL_PALS);

    // -------------------------
    // Q4: Ola must always appear
    // -------------------------
    // Choose the best opponent for Ola from sky/ty side.
    const q4Opponent = pickOneCandidate(
      q4Template.id,
      specialSeeds,
      SPECIAL_PALS
    );

    // Force Ola into Q4.
    const q4Pair = chooseTwoCandidates(
      q4Template.id,
      ["ola", q4Opponent],
      ["ola", ...SPECIAL_PALS]
    );

    const q4Winner = userAnswers[3]?.pal || q4Pair[0] || null;
    const q4Loser = getOtherPal(q4Pair, q4Winner);

    // -------------------------
    // Q5: core pals only
    // -------------------------
    const q5Pair = chooseTwoCandidates(
      q5Template.id,
      coreSeeds,
      CORE_PALS
    );

    const q5Winner = userAnswers[4]?.pal || q5Pair[0] || null;
    const q5Loser = getOtherPal(q5Pair, q5Winner);

    // -------------------------
    // Q6: final = winner(Q4) vs winner(Q5)
    // -------------------------
    // Left side should come from the Q4 branch.
    const q6Left = pickOneCandidate(
      q6Template.id,
      [q4Winner],
      [q4Loser, "ola", ...SPECIAL_PALS]
    );

    // Right side should come from the Q5 branch.
    const q6Right = pickOneCandidate(
      q6Template.id,
      [q5Winner],
      [q5Loser, ...CORE_PALS]
    );

    let q6Pair = null;

    // Best case: we found one valid pal from each branch.
    if (q6Left && q6Right && q6Left !== q6Right) {
      q6Pair = [q6Left, q6Right];
    } else {
      // Fallback: still try to preserve the "winner vs winner" idea first,
      // then use the rest of the pool if some adaptive text is missing.
      q6Pair = chooseTwoCandidates(
        q6Template.id,
        [q4Winner, q5Winner],
        [q4Loser, q5Loser, "ola", ...SPECIAL_PALS, ...CORE_PALS]
      );
    }

    // Build the actual question objects shown on screen.
    const q4 = makeHeadToHeadQuestion(q4Template, q4Pair[0], q4Pair[1]);
    const q5 = makeHeadToHeadQuestion(q5Template, q5Pair[0], q5Pair[1]);
    const q6 = makeHeadToHeadQuestion(q6Template, q6Pair[0], q6Pair[1]);

    // Optional debug log so you can trace how the branches were formed.
    console.log({
      seeds,
      coreSeeds,
      specialSeeds,
      q4Pair,
      q4Winner,
      q5Pair,
      q5Winner,
      q6Pair
    });

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