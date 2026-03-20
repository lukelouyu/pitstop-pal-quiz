const pals = {
  perry: {
    name: "Perry",
    short: "Perry",
    badge: "Your organised reset buddy",
    desc: "You handle chaos by slowing down, sorting things out, and building a manageable plan.",
    tip: "Take things one small step at a time.",
    image: "perry.png",
    color: "#7bb6ff",
    soft: "#eaf4ff"
  },
  ping: {
    name: "Ping",
    short: "Ping",
    badge: "Your reflective guide",
    desc: "You like to reconnect with meaning, purpose, and the bigger picture before moving forward.",
    tip: "When stressed, return to your why.",
    image: "ping.png",
    color: "#b39ddb",
    soft: "#f2ecfb"
  },
  ola: {
    name: "Ola",
    short: "Ola",
    badge: "Your movement motivator",
    desc: "You recharge best through motion, fresh air, and physical reset.",
    tip: "A short walk can change your whole mood.",
    image: "ola.png",
    color: "#7fd6a3",
    soft: "#eafaf1"
  },
  ty: {
    name: "Ty",
    short: "Ty",
    badge: "Your comfort fuel pal",
    desc: "You regain energy through food, warmth, and simple physical care.",
    tip: "Don’t forget to nourish yourself properly.",
    image: "ty.png",
    color: "#ffb870",
    soft: "#fff2e4"
  },
  sky: {
    name: "Sky",
    short: "Sky",
    badge: "Your rest-first companion",
    desc: "You know that sometimes the best answer is to pause, sleep, and recover.",
    tip: "Rest is productive too.",
    image: "sky.png",
    color: "#8ecae6",
    soft: "#edf8fd"
  },
  tobi: {
    name: "Tobi",
    short: "Tobi",
    badge: "Your quiet reset buddy",
    desc: "You prefer calm, hobbies, and a little personal space to reset your mind.",
    tip: "A small enjoyable break can help you restart.",
    image: "tobi.png",
    color: "#f4a261",
    soft: "#fff1e7"
  },
  iggy: {
    name: "Iggy",
    short: "Iggy",
    badge: "Your social support pal",
    desc: "You draw strength from connection, conversation, and being around people you trust.",
    tip: "You don’t have to handle everything alone.",
    image: "iggy.png",
    color: "#f28482",
    soft: "#fff0f0"
  }
};

const PAL_KEYS = ["perry", "ping", "ola", "ty", "sky", "tobi", "iggy"];

const fixedQuestions = [
  {
    id: "q1",
    q: "Q1 – CourseReg Storm",
    sub: "Your timetable explodes into chaos. Everything is messy, there are modules with clashing time slots and full of uncertainty.",
    a: [
      { text: "Pause. Breathe. Sort modules by priority and what you can realistically manage.", pal: "perry", points: 1 },
      { text: "Step back and ask which modules truly align with where you want to go in life.", pal: "ping", points: 1 }
    ]
  },
  {
    id: "q2",
    q: "Q2 – CCA Fair at Town Green",
    sub: "You step into a vibrant hall filled with music, buzzing booths, and enthusiastic seniors inviting you to join. How do you tackle this CCA fair? ",
    a: [
      { text: "You follow your friends around the fair to explore", pal: "iggy", points: 1 },
      { text: "You spot a CCA that aligns with your hobbies and interests, GO STRAIGHT THERE!!!", pal: "tobi", points: 1 }
    ]
  },
  {
    id: "q3",
    q: "Q3 – Unexpected Deadline",
    sub: "It's time to get locked in. But as you work through your assignment, brain fog set in",
    a: [
      { text: "Sleep first and tackle the assignment when you are feeling refreshed ", pal: "sky", points: 1 },
      { text: "Have a quick, yummy snack to power you through the next few hours of work", pal: "ty", points: 1 }
    ]
  }
];

const adaptiveTemplates = [
  {
    id: "q4",
    q: "Q4 – Feelings of Jitters",
    sub: "After a few days, you receive an email. Your result for that assignment has been released. Your heart races"
  },
  {
    id: "q5",
    q: "Q5 – Motivative Wavers",
    sub: "You begin to feel slightly disconnected from why you started this journey"
  },
  {
    id: "q6",
    q: "Q6 – Celebration!",
    sub: "Phew, the semester is finally over! How do you celebrate? "
  }
];

const adaptiveOptionBank = {
  perry: {
    q5: "Set one tiny achievable goal and begin there.",
    q6: "Write a to-do-list of the future things to do, the world doesn't stop for anybody!"
  },
  ping: {
    
    q5: "Journal to reconnect to your bigger purpose",
    q6: "Reflect on the past semester and how it aligns with what is meaningful to you!"
  },
  ola: {
    q4: "Move, stretch, or walk to release tension.",
    q6: "Go for a walk in the nature and touch grass! The weather is so beautiful today!"
  },
  ty: {
    q4: "Eat a sweet treat to cheer yourself on!",
    q6: "Buy some yummy food to satisfy all your cravings!."
  },
  sky: {
    q4: "Sleep; You want to avoid seeing your grades for now",
    q6: "Straight to bed! You spent too many nights stressing about school, time to catch up on some ZZs."
  },
  tobi: {
    q5: "Take some time to do something you love and remind yourself of your passion",
    q6: "Switch off your phone and catch up on your hobbies- nothing can disturb you for the next few hours! "
  },
  iggy: {
    
    q5: "Talk to someone who understands.",
    q6: "Catch up with friends- you did not get to spend much time with them during the exam period."
  }
};