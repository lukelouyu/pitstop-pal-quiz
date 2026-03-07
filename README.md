

# PitStop Pal Quiz for NUS PSS Welfare Pack AY25/26 Sem 2

A mobile-friendly web quiz created for **NUS PSS** to help users discover which **PitStop Pal** best matches their natural wellness style.

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
6. Optionally:
   - retry the quiz
   - go back to the home page
   - view all PitStop Pals

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
