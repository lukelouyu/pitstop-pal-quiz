

**PitStop Pal Quiz** 
##**for NUS PSS Welfare Pack AY25/26 Sem 2**


A mobile-friendly web quiz created for **NUS PSS Welfare Pack AY25/26 Sem 2** to help users discover which **PitStop Pal** best matches their natural wellness style.

The quiz presents 14 questions and assigns points based on the user’s choices. At the end, the user receives a matched PitStop Pal result, together with a short description and wellness tip.

---

## Overview

The quiz is designed around 7 wellness-themed PitStop Pals:

- **Perry** — Personal Skills
- **Ping** — Purpose
- **Ola** — On The Move
- **Ty** — Thoughtful Eating
- **Sky** — Sleep
- **Tobi** — Timeout
- **Iggy** — Interaction

Users answer a set of questions based on everyday student-life situations. Their responses are scored, and the pal with the highest score becomes their final match.

---

## Features

- Mobile-friendly interface
- Start screen with quiz introduction
- 14-question quiz flow
- Progress bar and percentage tracker
- Dynamic result page
- “Meet All Pals” section
- Retry and return-home buttons
- Weighted scoring for core questions
- Tie-break logic based on most recent answer

---

## How to Use

1. Open the website in your browser.
2. Press **Start Quiz**.
3. Read each question and choose one answer.
4. Continue until all 14 questions are completed.
5. View your matched PitStop Pal.

---

## Project Files

This project is made up of the following main files:

### `index.html`
Contains the main structure of the webpage, including:

- start screen
- quiz screen
- result screen
- all pals screen

### `styles.css`
Controls the appearance of the site, including:

- layout
- colours
- buttons
- cards
- responsive design
- typography and spacing

### `data.js`
Stores all the quiz content and configuration, including:

- PitStop Pal profile information
- question text
- answer options
- point values
- core-question scoring rules

### `script.js`
Contains the program logic, including:

- starting the quiz
- rendering each question
- updating scores
- showing the result
- handling retry/navigation buttons
- tie-breaking logic

### Image files
PNG files are used for:

- PitStop Pal character images
- opening visual / poster image

---

## How the Quiz Works

The quiz contains **14 questions** in total:

- **Q1 to Q7** are **core questions**
- **Q8 to Q14** are **non-core questions**

---

## Scoring Logic

### Core Questions (Q1–Q7)

These questions are weighted more strongly.

For each core question:

- if the **core answer** is chosen:
  - selected pal gets **+2**
  - paired opposite pal gets **-1**

- if the **non-core answer** is chosen:
  - selected pal gets **+1**
  - the other pal gets **0**

### Example

For a core question paired between **Perry** and **Ping**:

- choosing **Perry** gives:
  - `Perry +2`
  - `Ping -1`

- choosing **Ping** gives:
  - `Ping +1`
  - `Perry +0`

This makes the first 7 questions more decisive in shaping the final result.

---

### Non-Core Questions (Q8–Q14)

These questions follow normal scoring.

For each non-core question:

- selected pal gets **+1**
- no other pal loses points

---

## Result Logic

At the end of the quiz:

1. The program checks all 7 pal scores.
2. The pal with the **highest score** becomes the result.
3. If there is a tie:
   - the program checks the user’s answer history from the most recent answer backwards
   - the tied pal chosen most recently wins the tie-break

This helps produce a more natural final result.

---

## Program Flow

### 1. Page Load
When the page loads, the start screen is shown.

### 2. Start Quiz
When the user clicks **Start Quiz**:

- question index resets to 0
- all pal scores reset to 0
- answer history resets to empty
- quiz screen appears
- first question is rendered

### 3. Question Rendering
For each question:

- question title is displayed
- scenario/subtext is displayed
- answer buttons are generated dynamically
- progress text and progress bar are updated

### 4. Answer Selection
When the user clicks an answer:

- the selected pal receives points
- any extra score changes are applied
- answer is stored in history
- next question is shown

### 5. Final Result
After the last question:

- top pal is calculated
- result page is displayed
- matched pal image, badge, description, and tip are shown
- score summary may also be shown if enabled

---
## Main Functions in `script.js`

### `createEmptyScores()`
Creates the score object for all 7 pals:

```javascript
{
  perry: 0,
  ping: 0,
  ola: 0,
  ty: 0,
  sky: 0,
  tobi: 0,
  iggy: 0
}
```

### `showScreen(screen)`
Hides all screens and shows only the selected screen.

### `showDataError(message)`
Displays an error message if quiz data is missing or broken.

### `startQuiz()`
Resets quiz data and starts from Question 1.

### `renderQuestion()`
Displays the current question and creates the answer buttons.

### `getTopPal()`
Finds the highest-scoring pal and resolves ties.

### `renderFinalScores()`
Displays all final scores in sorted order, if the score list section exists.

### `showResult()`
Displays the final matched pal and related content.

### `renderAllPals()`
Shows all PitStop Pals in a grid layout.

### `resetToStart()`
Returns the user to the start screen and resets quiz state.

---

## Data Structure

## Pal Data

Each pal in `data.js` contains information such as:

- short name
- full name
- badge
- image path
- main colour
- soft background colour
- description
- wellness tip

Example structure:

```javascript
perry: {
  short: "Perry",
  name: "Perry the Personal Skills Pal",
  badge: "Personal Skills",
  image: "perry.png",
  color: "#F57C22",
  soft: "#FDE7D8",
  desc: "You tend to steady yourself through structure, calm thinking, and realistic planning.",
  tip: "Break large tasks into smaller steps and focus on one manageable action at a time."
}
```

---

## Question Data

Each question object contains:

- `q` → question title
- `sub` → scenario/subtext
- `a` → answer options

Each answer option contains:

- `text` → displayed answer text
- `pal` → pal key
- `points` → score added to selected pal
- optional `extra` → additional score changes for core questions

Example:

```javascript
{
  q: "Q1 – CourseReg Storm",
  sub: "Your timetable explodes into chaos. What do you do first?",
  a: [
    {
      text: "Pause. Breathe. Sort modules by priority and what you can realistically manage.",
      pal: "perry",
      points: 2,
      extra: [{ pal: "ping", points: -1 }]
    },
    {
      text: "Step back and ask which modules truly align with where you want to go in life.",
      pal: "ping",
      points: 1
    }
  ]
}
```

---

## How to Run the Project

### Option 1: Run Locally
1. Download or unzip the project folder.
2. Keep all files in the same folder.
3. Open `index.html` in a web browser.

### Option 2: Run with GitHub Pages
1. Upload the project files to a GitHub repository.
2. Go to repository **Settings**.
3. Open **Pages**.
4. Set the source branch (usually `main`).
5. Save the settings.
6. Open the published GitHub Pages link.

---

## How to Edit the Quiz

### To change the quiz questions
Edit the `questions` array in `data.js`.

### To change the scoring
Edit the `points` and `extra` values inside each answer object in `data.js`.

### To change the pal descriptions
Edit the `pals` object in `data.js`.

### To change colours or layout
Edit `styles.css`.

### To change button behavior or quiz logic
Edit `script.js`.

---

## Customisation Notes

You can customise this project in several ways:

- change the opening poster image
- change PitStop Pal images
- change the button text
- add animations
- add sound effects
- add result sharing
- generate a QR code for event use
- remove or keep the final score list
- add more questions or categories

---

## Troubleshooting

### Start button does not respond
Possible causes:

- JavaScript syntax error in `script.js`
- `start-btn` element ID does not match HTML
- `script.js` is not linked properly
- browser is still using an old cached file

Try:
- checking browser console
- saving and re-uploading the latest files
- hard refreshing with `Ctrl + Shift + R`

---

### Questions do not appear
Possible causes:

- `questions` is missing in `data.js`
- `data.js` has a syntax error
- `data.js` is loaded after `script.js`
- `renderQuestion()` is broken

---

### Images do not show
Possible causes:

- wrong file names in `data.js`
- image files not uploaded
- incorrect file path
- uppercase/lowercase filename mismatch

---

### Result page does not show
Possible causes:

- missing result container in `index.html`
- missing IDs such as:
  - `result-image`
  - `result-name`
  - `result-desc`
  - `result-badge`
  - `result-tip`
- JavaScript error before `showResult()` runs

---

### Website not updating after changes
GitHub Pages may still be serving an older cached version.

Try:
- waiting 1–2 minutes
- hard refresh with `Ctrl + Shift + R`
- checking that your latest files were pushed to GitHub

---

## Suggested Folder Structure

```text
pitstop-pal-quiz/
│
├── index.html
├── styles.css
├── data.js
├── script.js
├── README.md
├── Event Tele Post.png
├── perry.png
├── ping.png
├── ola.png
├── ty.png
├── sky.png
├── tobi.png
└── iggy.png
```

---

## Intended Audience

This quiz is designed for:

- NUS students
- NUS PSS welfare/event participants
- users engaging with the PitStop Pal campaign
- event visitors accessing the quiz by QR code

---

## Educational / Campaign Purpose

This project is intended as an interactive engagement tool to help users reflect on their wellness style in a light and accessible format.

It is not a psychological diagnostic tool.  
Its purpose is awareness, engagement, and reflection.

---

## Credits

Created for **NUS Peer Student Supporters (PSS)**.

PitStop Pal concept, character framing, and wellness theme are based on the campaign materials used for student engagement.

---

## Future Improvements

Possible future upgrades include:

- smoother screen transitions
- animated answer selection
- QR code landing page optimisation
- result sharing to social media
- storing anonymous quiz statistics
- more detailed pal descriptions
- sound feedback
- accessibility improvements
- multiple quiz modes

---

## License

This project is intended for educational and student engagement use.
