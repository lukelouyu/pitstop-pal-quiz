const pals = {
  perry: {
    name: "Perry",
    short: "Perry",
    badge: "Your organised reset buddy",
    desc: "You handle chaos by slowing down, sorting things out, and building a manageable plan.",
    tip: "Take things one small step at a time.",
    image: "images/perry.png",
    color: "#7bb6ff",
    soft: "#eaf4ff"
  },
  ping: {
    name: "Ping",
    short: "Ping",
    badge: "Your reflective guide",
    desc: "You like to reconnect with meaning, purpose, and the bigger picture before moving forward.",
    tip: "When stressed, return to your why.",
    image: "images/ping.png",
    color: "#b39ddb",
    soft: "#f2ecfb"
  },
  ola: {
    name: "Ola",
    short: "Ola",
    badge: "Your movement motivator",
    desc: "You recharge best through motion, fresh air, and physical reset.",
    tip: "A short walk can change your whole mood.",
    image: "images/ola.png",
    color: "#7fd6a3",
    soft: "#eafaf1"
  },
  ty: {
    name: "Ty",
    short: "Ty",
    badge: "Your comfort fuel pal",
    desc: "You regain energy through food, warmth, and simple physical care.",
    tip: "Don’t forget to nourish yourself properly.",
    image: "images/ty.png",
    color: "#ffb870",
    soft: "#fff2e4"
  },
  sky: {
    name: "Sky",
    short: "Sky",
    badge: "Your rest-first companion",
    desc: "You know that sometimes the best answer is to pause, sleep, and recover.",
    tip: "Rest is productive too.",
    image: "images/sky.png",
    color: "#8ecae6",
    soft: "#edf8fd"
  },
  tobi: {
    name: "Tobi",
    short: "Tobi",
    badge: "Your quiet reset buddy",
    desc: "You prefer calm, hobbies, and a little personal space to reset your mind.",
    tip: "A small enjoyable break can help you restart.",
    image: "images/tobi.png",
    color: "#f4a261",
    soft: "#fff1e7"
  },
  iggy: {
    name: "Iggy",
    short: "Iggy",
    badge: "Your social support pal",
    desc: "You draw strength from connection, conversation, and being around people you trust.",
    tip: "You don’t have to handle everything alone.",
    image: "images/iggy.png",
    color: "#f28482",
    soft: "#fff0f0"
  }
};

const PAL_KEYS = ["perry", "ping", "ola", "ty", "sky", "tobi", "iggy"];

const fixedQuestions = [
  {
    id: "q1",
    q: "Q1 – CourseReg Storm",
    sub: "Your timetable explodes into chaos. What do you do first?",
    a: [
      { text: "Pause. Breathe. Sort modules by priority.", pal: "perry", points: 1 },
      { text: "Step back and ask what aligns with your goals.", pal: "ping", points: 1 }
    ]
  },
  {
    id: "q2",
    q: "Q2 – CCA Fair at Town Green",
    sub: "How do you tackle this CCA fair?",
    a: [
      { text: "Explore around with friends.", pal: "iggy", points: 1 },
      { text: "Go straight to the CCA that matches your interests.", pal: "tobi", points: 1 }
    ]
  },
  {
    id: "q3",
    q: "Q3 – Unexpected Deadline",
    sub: "Brain fog sets in. What do you do?",
    a: [
      { text: "Sleep first and continue later.", pal: "sky", points: 1 },
      { text: "Grab a quick snack to power through.", pal: "ty", points: 1 }
    ]
  }
];

const adaptiveTemplates = [
  {
    id: "q4",
    q: "Q4 – Adaptive Reset",
    sub: "A stressful moment hits. Which response feels most natural?"
  },
  {
    id: "q5",
    q: "Q5 – Adaptive Motivation",
    sub: "You feel yourself wavering. What helps you restart?"
  },
  {
    id: "q6",
    q: "Q6 – Adaptive Celebration",
    sub: "The week is over. How would you recharge?"
  }
];

const adaptiveOptionBank = {
  perry: {
    q4: "Pause, sort the mess, and make a simple plan.",
    q5: "Set one tiny achievable goal and begin there.",
    q6: "Write down tomorrow’s priorities before resting."
  },
  ping: {
    q4: "Reconnect with why this challenge matters to you.",
    q5: "Reflect on your bigger purpose and values.",
    q6: "Look back on what felt meaningful this semester."
  },
  ola: {
    q4: "Move, stretch, or walk to release tension.",
    q5: "Reset physically with fresh air and motion.",
    q6: "Go for a walk and enjoy the outdoors."
  },
  ty: {
    q4: "Stabilise with water and a simple snack first.",
    q5: "Nourish yourself so your energy can return.",
    q6: "Treat yourself to food that feels comforting."
  },
  sky: {
    q4: "Step away and prioritise rest before reacting.",
    q5: "Protect your sleep and recover properly.",
    q6: "Catch up on proper rest and sleep early."
  },
  tobi: {
    q4: "Take a short timeout before deciding anything.",
    q5: "Do something you enjoy to reset your mind.",
    q6: "Switch off and spend quiet time with your hobbies."
  },
  iggy: {
    q4: "Reach out to someone and talk it through.",
    q5: "Reconnect with someone who understands.",
    q6: "Celebrate by catching up with friends."
  }
};