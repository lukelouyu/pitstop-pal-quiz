# NUS PSS Personality Quiz README

## Project name
**NUS PSS Personality Quiz / PitStop Pal Quiz**

This project is a web-based personality quiz used to engage students during the **NUS Peer Student Supporters (PSS)** welfare pack activity at **PitStop@UTown**. It helps each participant receive a matching **PitStop Pal** based on a short guided quiz, while also allowing organisers to manage the physical stock of the welfare packs tied to each pal.

This README is written for two groups:

1. **PSS members and Student Wellness Managers without coding background** who need to run and maintain the quiz during the event.
2. **PSS members with coding background** who may need to edit, test, deploy, or hand over the project later.

---

## Credits

- **Storyline narrators:** Andrew Koh Wen Teik, Illiyina Qistina Ruimei Nizam
- **Algorithm designer:** Liew Ting Yu
- **Developer:** Luke Lou Yu

---

## What the app does

A participant opens the quiz, answers **6 questions**, and gets assigned one final **PitStop Pal**.

The seven pals are:

- **Perry**
- **Ping**
- **Ola**
- **Ty**
- **Sky**
- **Tobi**
- **Iggy**

The quiz is not just for fun. It is linked to the actual welfare pack distribution flow:

- the frontend determines the participant's **preferred pal** based on the quiz bracket
- the backend checks whether that pal still has stock
- if stock is unavailable, the backend tries a fallback
- if both are unavailable, the backend assigns any remaining available pal

This allows the event team to continue engaging students smoothly without manually calculating results.

---

# Part A — Guide for PSS members and Student Wellness Managers without coding background

## 1. How to use the quiz during the event

### For participants
1. Scan the QR code or open the quiz link.
2. Press **Start Quiz**.
3. Answer all **6 questions**.
4. Read the final result shown on screen.
5. Collect the welfare pack for the assigned PitStop Pal.

### For event facilitators
1. Prepare one public quiz link for participants.
2. Keep one separate browser tab open for the **admin page**.
3. Periodically refresh the admin page to monitor remaining stock.
4. If a pal runs low or runs out, update the stock in the admin page.

---

## 2. What the current quiz flow looks like

The current live code uses a **6-question bracket system**, not the old 14-question scoring version.

The bracket is:

- **Q1:** Perry vs Ping
- **Q2:** Iggy vs Tobi
- **Q3:** Sky vs Ty
- **Q4:** Ola vs winner of Q3
- **Q5:** winner of Q1 vs winner of Q2
- **Q6:** winner of Q4 vs winner of Q5

So the final result is built step by step like a mini tournament.

### Simple example
If a participant chooses:

- Q1 -> Perry
- Q2 -> Iggy
- Q3 -> Sky
- Q4 -> Ola
- Q5 -> Iggy
- Q6 -> Iggy

Then:
- final preferred pal = **Iggy**
- backend will try to assign **Iggy** first

If Iggy is out of stock, the backend will try the fallback from **Q5**.
If that fallback is also out of stock, the backend will assign another pal that still has stock.

---

## 3. What the stock management system does

The project includes an **admin stock management page**.

This page lets organisers:

- view current stock for each pal
- switch between **test mode** and **actual mode**
- manually edit stock numbers
- see how many packs have already been assigned
- see how many packs remain overall

### Why this matters
Without the admin page, the quiz could continue showing a pal whose welfare packs are already finished. The admin page keeps the quiz aligned with real event inventory.

---

## 4. How to use the admin page

Open the admin page in the browser.
In most deployments, it will be:

- `https://pitstop-pal-quiz.lukelousg.workers.dev/admin/`
- or `https://pitstop-pal-quiz.lukelousg.workers.dev/admin/index.html`

### What you need
You need the **admin key**.
This is a secret used to protect stock controls from the public.
Admin Key: nuspss121111

### Basic admin steps
1. Open the admin page.
2. Enter the admin key.
3. Press **Connect**.
4. Review the current stock and summary.
5. Press **Refresh** whenever you want the latest numbers.
6. Edit stock values if needed.
7. Press **Save Stock** to apply the changes.

### Test mode vs actual mode
- **Test mode** loads the smaller testing stock preset.
- **Actual mode** loads the real event stock preset.

Use **Test mode** before the event when checking whether the app works.
Use **Actual mode** before the event starts for the real run.

---

## 5. Recommended event-day workflow

### Before the event
1. Open the public quiz link and confirm the quiz loads.
2. Open the admin page and connect with the admin key.
3. Apply the **Actual** preset.
4. Confirm the stock numbers match the physical packs on site.
5. Do 1 or 2 trial runs.
6. Keep the admin key private.

### During the event
1. Let participants use only the public quiz page.
2. Keep one organiser on the admin page.
3. Refresh the stock page from time to time.
4. If one pal has no packs left, update its stock to `0` and save.
5. Continue distribution based on the assigned result shown by the app.

### After the event
1. Refresh the admin page one last time.
2. Record remaining stock and total assigned.
3. Keep the updated codebase and this README for handover.

---

## 6. What to do if something goes wrong

### The quiz opens but no result appears
Possible causes:
- the backend is not running
- the deployed worker is unavailable
- the participant completed a path that was not loaded correctly

What to do:
- refresh the page
- try again on another device
- ask a coding member to check the deployment and browser console

### The quiz result appears but the wrong pack is being given out
Possible causes:
- stock numbers in admin page are outdated
- organisers are reading the result manually without checking the latest stock logic

What to do:
- refresh admin page
- confirm stock values
- follow the actual assigned result shown on the quiz screen

### A pal is physically out of stock
What to do:
- update that pal's stock to `0` in admin page
- save stock
- the backend will stop assigning that pal unless stock is added back later

---

## 7. Things non-coding members should not change on event day

Please avoid editing:

- `script.js`
- `data.js`
- `worker.js`
- deployment settings

For event-day operations, only use:

- the public quiz page
- the admin page
- stock number updates

---

# Part B — Guide for PSS members with coding background

## 8. Important handover note

The repository contains **legacy logic** from an older version of the quiz.

### Current reality of the codebase
- The **current frontend** uses a **6-question bracket flow**.
- The **existing old README** may still describe a **14-question weighted scoring quiz**.
- There is a **Cloudflare Worker backend** in `src/worker.js`.
- There is also an older **Express backend prototype** in `backend/`.

For future handover, treat the **6-question bracket + Cloudflare Worker path** as the main production flow unless the team explicitly decides otherwise.

---

## 9. High-level architecture

### Frontend
Stored mainly in `public/`.

Responsibilities:
- render quiz screens
- render 2 options per question
- compute bracket winners from Q1 to Q6
- call backend endpoint `/api/quiz/assign`
- display final assigned pal

### Backend
Stored mainly in `src/worker.js` for production deployment.

Responsibilities:
- maintain persistent stock state
- receive preferred and fallback pal from frontend
- assign based on availability
- expose admin endpoints for state, presets, and stock updates

### Deployment
Configured by:
- `wrangler.toml`
- `src/worker.js`
- `src/constants.js`

---

## 10. Main file structure

```text
pitstop-pal-quiz-main/
├─ public/
│  ├─ index.html
│  ├─ styles.css
│  ├─ script.js
│  ├─ data.js
│  ├─ admin/
│  │  ├─ index.html
│  │  ├─ admin.css
│  │  └─ admin.js
│  └─ *.png / event poster assets
├─ src/
│  ├─ constants.js
│  └─ worker.js
├─ backend/
│  ├─ server.js
│  ├─ routes/quizRoutes.js
│  ├─ services/distributionService.js
│  └─ tests/distribution.test.js
├─ bracket-tests.js
├─ package.json
├─ package-lock.json
├─ wrangler.toml
└─ README.md
```

---

## 11. Frontend logic details

## `public/data.js`
This file stores the content layer.

Main items:
- `pals` -> metadata for each pal
- `PAL_KEYS` -> list of pal IDs
- `fixedQuestions` -> Q1 to Q3
- `adaptiveTemplates` -> Q4 to Q6 shell questions
- `adaptiveOptionBank` -> option text injected into adaptive questions

### Current bracket model
- Q1 is fixed: Perry vs Ping
- Q2 is fixed: Iggy vs Tobi
- Q3 is fixed: Sky vs Ty
- Q4 is built from `ola` vs winner(Q3)
- Q5 is built from winner(Q1) vs winner(Q2)
- Q6 is built from winner(Q4) vs winner(Q5)

## `public/script.js`
This file controls the frontend state and quiz flow.

Key concepts:
- `userAnswers` stores the chosen pal for each question index
- `currentQuestions` stores the currently visible question list
- only **2 options** are rendered for each question
- adaptive questions are rebuilt dynamically after Q1 to Q3 are known

### Key functions worth knowing
- `startQuiz()`
  - resets quiz state
  - loads Q1 first

- `updateQuestionSet()`
  - switches from fixed-only mode to fixed + adaptive mode

- `buildAdaptiveQuestions()`
  - creates Q4, Q5, Q6 from the current bracket winners

- `getBracketSnapshot()`
  - returns the full bracket state including:
    - q4 pair
    - q5 pair
    - q6 pair
    - `preferredPal`
    - `fallbackPal`

- `getFrontendWinner()`
  - returns winner of Q6

- `getFallbackWinner()`
  - returns winner of Q5

- `showResult()`
  - submits result to backend using `fetch("/api/quiz/assign")`
  - renders the final assigned pal returned by backend

### Frontend-backend contract
The frontend now sends:
- `preferredPal` = winner of Q6
- `fallbackPal` = winner of Q5
- plus `scores` and `answerHistory` for compatibility

In practice, the current production flow relies mainly on `preferredPal` and `fallbackPal`.

---

## 12. Backend logic details

## `src/constants.js`
Defines shared stock presets:
- `TEST_STOCK`
- `ACTUAL_STOCK`
- `PAL_KEYS`

## `src/worker.js`
This is the production backend used by Cloudflare Worker + Durable Object storage.

### Main production endpoint
- `POST /api/quiz/assign`

Request body may include:
- `scores`
- `answerHistory`
- `preferredPal`
- `fallbackPal`

### Current production assignment logic
The current assignment path is intentionally simple:

1. Try `preferredPal` first
2. If unavailable, try `fallbackPal`
3. If unavailable, assign the first pal with stock remaining
4. Decrement stock
5. Increment distributed count
6. Save persistent state

This is the logic actually wired into `handleAssign()` through `chooseAssignedPal()`.

### Admin endpoints
- `GET /api/admin/state`
- `POST /api/admin/preset`
- `POST /api/admin/stocks`
- `POST /api/admin/random-k`

### Auth model
Admin routes are protected by the `x-admin-key` header.
The admin page reads the admin key from the organiser's input box and sends it in requests.

---

## 13. Important note about unused or experimental backend helpers

There are helper functions in `src/worker.js` such as:
- `isAboveThreshold()`
- `chooseLeastDistributedAvailable()`
- threshold/original-stock helpers

These suggest earlier or planned work on fairness balancing and threshold-based allocation.

However, in the current production `handleAssign()` flow, the active assignment is still the simpler:
- preferred -> fallback -> any available

So if future maintainers want a more advanced fairness allocator, they should first confirm whether to:
- keep the strict bracket experience as-is
- add distribution balancing back in
- or combine both in a controlled way

Do not assume those helper functions are already active just because they exist in the file.

---

## 14. Legacy Express backend

The `backend/` folder contains an older Express-based version.

Relevant files:
- `backend/server.js`
- `backend/routes/quizRoutes.js`
- `backend/services/distributionService.js`
- `backend/tests/distribution.test.js`

This older backend includes a different distribution approach with:
- recent history checks
- cooldowns
- least-distributed sorting
- candidate pool selection
- random selection inside a shortlist

That is useful as reference, but it is not the clearest description of the current Cloudflare production behavior.

For handover, label this folder as:
- **legacy/local prototype backend**
- not the main source of truth for production logic unless the team explicitly revives it

---

## 15. Admin page code details

## `public/admin/admin.js`
This file powers the organiser dashboard.

Main functions:
- `loadState()` -> fetch current backend state
- `applyPreset(mode)` -> switch between `test` and `actual`
- `saveStock()` -> push edited stock values
- `renderSummary(data)` -> show summary block and stock inputs
- `renderStockInputs(stock)` -> populate editable stock boxes

This page is intended for organisers, not participants.

---

## 16. Testing and validation

## Bracket tests
The repository includes:
- `bracket-tests.js`

This verifies:
- bracket pair generation
- preferred and fallback winner correctness
- stock fallback behavior
- exhaustive valid bracket combinations

### Run bracket tests
From the project root:

```bash
node bracket-tests.js
```

## Legacy backend tests
There is also:
- `backend/tests/distribution.test.js`

This covers the older Express distribution service.
Because the backend folder in this snapshot does not clearly include a full local package setup, future maintainers should treat these tests as reference unless they intentionally restore the Express environment.

---

## 17. Local development and deployment

## Production-oriented path: Cloudflare Worker
Root `package.json` currently supports:

```bash
npm install
npm run dev
npm run deploy
```

Meaning:
- `npm run dev` -> local Worker development preview
- `npm run deploy` -> deploy to Cloudflare

## Environment / secret notes
This project expects at least:
- `ADMIN_KEY` as a Cloudflare secret
- optional variable `RANDOM_K` from `wrangler.toml`

For admin key setup, a maintainer would typically use:

```bash
wrangler secret put ADMIN_KEY
```

Do not hard-code the admin key in frontend files.

---

## 18. Recommended handover practice

When handing over this project to the next organising team:

1. Keep one README that matches the **actual live code**.
2. State clearly whether production uses:
   - Cloudflare Worker, or
   - local Express backend
3. Store the deployment link and admin page link in the handover notes.
4. Store the admin key securely through the official secret manager, not in source code.
5. Keep one sample event stock preset documented.
6. Test both:
   - public quiz flow
   - admin stock updates
7. Run `node bracket-tests.js` before major event-day changes.

---

## 19. Suggested quick handover summary

If you only have one minute to explain the project to the next team, say this:

> This is a 6-question PitStop Pal quiz for the NUS PSS welfare pack event. The frontend computes a bracket winner, the backend checks stock, and the admin page allows organisers to update inventory live. The current production path is mainly the Cloudflare Worker in `src/worker.js`, while `backend/` is an older prototype.

---

## 20. Ownership and usage statement

This project belongs to **NUS Peer Student Supporters (NUS PSS)** and is used for the **welfare pack event at PitStop@UTown on April 10**.

It is intended strictly for:
- student engagement
- student wellbeing programming
- event facilitation and educational purposes within the NUS PSS context

It must **not** be used for:
- illegal activity
- unauthorised access
- impersonation
- harmful, misleading, or exploitative purposes
- misuse of participant data

Any future reuse should remain aligned with the values of student welfare, safety, and responsible event management.

---

## 21. Final acknowledgement

Thank you to everyone who contributed to the stories, algorithm design, implementation, and welfare event planning that made this project possible.


