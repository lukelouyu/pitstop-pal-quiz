const pals = {
  perry: {
    short: "Perry",
    name: "Perry — Personal Skills",
    badge: "Small steps, steady mind",
    image: "perry.png",
    color: "#f39a2b",
    soft: "#fff1df",
    desc: "You stay grounded by organising the chaos. Clear next steps help you feel calmer and more in control.",
    tip: "Write down your top 3 priorities for tomorrow."
  },
  ping: {
    short: "Ping",
    name: "Ping — Purpose",
    badge: "Reconnect to meaning",
    image: "ping.png",
    color: "#4f9ff8",
    soft: "#eaf4ff",
    desc: "You recharge when you remember why something matters. Purpose helps you keep going even on difficult days.",
    tip: "Ask yourself what matters most to you this week."
  },
  ola: {
    short: "Ola",
    name: "Ola — On The Move",
    badge: "Move to reset",
    image: "ola.png",
    color: "#1b7fd0",
    soft: "#e6f4ff",
    desc: "Movement helps you breathe again. Walking, stretching, or getting outside gives you a healthier reset.",
    tip: "Take a 10-minute walk between study blocks."
  },
  ty: {
    short: "Ty",
    name: "Ty — Thoughtful Eating",
    badge: "Fuel matters too",
    image: "ty.png",
    color: "#f1c232",
    soft: "#fff7d9",
    desc: "You care for yourself through nourishment and simple routines. Your energy improves when your body is looked after.",
    tip: "Keep water and a simple snack nearby during long work sessions."
  },
  sky: {
    short: "Sky",
    name: "Sky — Sleep",
    badge: "Rest is productive",
    image: "sky.png",
    color: "#84b8ef",
    soft: "#eef7ff",
    desc: "You know rest is not laziness. Good sleep helps you recover, think better, and feel more like yourself.",
    tip: "Aim to sleep a little earlier tonight."
  },
  tobi: {
    short: "Tobi",
    name: "Tobi — Timeout",
    badge: "Pause with intention",
    image: "tobi.png",
    color: "#f1a7c1",
    soft: "#fff0f6",
    desc: "Pausing helps you return with a clearer mind. You value space, hobbies, and moments of real recovery.",
    tip: "Take one proper 5-minute no-phone break today."
  },
  iggy: {
    short: "Iggy",
    name: "Iggy — Interaction",
    badge: "Connection gives strength",
    image: "iggy.png",
    color: "#35c178",
    soft: "#e9fff2",
    desc: "You feel better through connection. Talking, sharing, and being around people you trust helps you feel supported.",
    tip: "Check in with one friend today."
  }
};

const questions = [
   {
    q: "Q1 – CourseReg Storm",
    sub: "Your timetable explodes into chaos. Everything is messy, there are modules with clashing time slots and full of uncertainty. What do you do first?",
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
  },
  {
    q: "Q2 – CCA Festival at Town Green",
    sub: "You step into a vibrant hall filled with music, buzzing booths, and enthusiastic seniors inviting you to join. What naturally draws your attention?",
    a: [
      {
        text: "A CCA with strong community, mentorship, and connection.",
        pal: "iggy",
        points: 2,
        extra: [{ pal: "ola", points: -1 }]
      },
      {
        text: "Something active that keeps you physically energised.",
        pal: "ola",
        points: 1
      }
    ]
  },
  {
    q: "Q3 – Unexpected Deadline",
    sub: "An assignment deadline catches you off guard. You return to your room, staring at your screen as tension builds.",
    a: [
      {
        text: "You deliberately take a short time-out before doing anything.",
        pal: "tobi",
        points: 2,
        extra: [{ pal: "sky", points: -1 }]
      },
      {
        text: "You realise your sleep has been messy, so you fix that first.",
        pal: "sky",
        points: 1
      }
    ]
  },
  {
    q: "Q4 – Snacker",
    sub: "As you work through your assignment, brain fog sets in. What do you do?",
    a: [
      {
        text: "Water. Balanced snack. Stabilise first.",
        pal: "ty",
        points: 2,
        extra: [{ pal: "ola", points: -1 }]
      },
      {
        text: "Quick brisk walk outside to clear your head.",
        pal: "ola",
        points: 1
      }
    ]
  },
  {
    q: "Q5 – Guarding the Night",
    sub: "It’s late. You’re not finished. The temptation of an all-nighter lingers. You decide:",
    a: [
      {
        text: "Nothing is worth wrecking your sleep rhythm.",
        pal: "sky",
        points: 2,
        extra: [{ pal: "ty", points: -1 }]
      },
      {
        text: "You’ll prep nourishing meals to keep energy stable.",
        pal: "ty",
        points: 1
      }
    ]
  },
  {
    q: "Q6 – Feelings of Jitters",
    sub: "After a few days, you receive an email. Your result has been released. Your heart races. How do you steady yourself?",
    a: [
      {
        text: "You move, stretch, walk, and release tension physically.",
        pal: "ola",
        points: 2,
        extra: [{ pal: "perry", points: -1 }]
      },
      {
        text: "You take five slow breaths and tell yourself that you can do it.",
        pal: "perry",
        points: 1
      }
    ]
  },
  {
    q: "Q7 – After Receiving the Results",
    sub: "The results you received were not up to your expectations. Now what?",
    a: [
      {
        text: "You reflect on why this journey matters beyond one paper.",
        pal: "ping",
        points: 2,
        extra: [{ pal: "iggy", points: -1 }]
      },
      {
        text: "You call or text someone who understands.",
        pal: "iggy",
        points: 1
      }
    ]
  },
  {
    q: "Q8 – Group Project Tension",
    sub: "A message pops up. Two group mates are in disagreement about workload and responsibility. How will you react?",
    a: [
      { text: "Calmly clarify roles, expectations, and priorities.", pal: "perry", points: 1 },
      { text: "Make space so everyone feels heard first.", pal: "iggy", points: 1 }
    ]
  },
  {
    q: "Q9 – Late Night Scroll Spiral",
    sub: "The semester starts to clear up and you have more free time. It’s past midnight, and you wonder whether to keep scrolling.",
    a: [
      { text: "Phone down. Protect tomorrow by sleeping now.", pal: "sky", points: 1 },
      { text: "Search for a few more encouraging quotes before sleeping.", pal: "iggy", points: 1 }
    ]
  },
  {
    q: "Q10 – Chill Afternoon",
    sub: "You finally have free time. How will you use this time to recharge?",
    a: [
      { text: "Enjoy a quiet solo hobby.", pal: "tobi", points: 1 },
      { text: "Explore a new walking path on campus.", pal: "ola", points: 1 }
    ]
  },
  {
    q: "Q11 – Motivation Wavers",
    sub: "You begin to feel slightly disconnected from why you started this journey. What do you do?",
    a: [
      { text: "Reconnect to your bigger purpose.", pal: "ping", points: 1 },
      { text: "Set one tiny achievable goal and start.", pal: "perry", points: 1 }
    ]
  },
  {
    q: "Q12 – Homesick Evening",
    sub: "The journey has been a long one. You start to feel a little alone for one night.",
    a: [
      { text: "Reach out and talk about life or have a deep conversation with your friends.", pal: "ping", points: 1 },
      { text: "Journal privately and sit with your thoughts.", pal: "tobi", points: 1 }
    ]
  },
  {
    q: "Q13 – Final Destination",
    sub: "The Campus Cruise is approaching its final harbour. You have weathered storms, handled setbacks, and grown stronger. Before docking, you choose one final act of self-care.",
    a: [
      { text: "Scheduling small breaks intentionally.", pal: "tobi", points: 1 },
      { text: "Planning balanced meals and water intake.", pal: "ty", points: 1 }
    ]
  },
  {
    q: "Q14 – Final Stretch",
    sub: "This is the final night you have on the cruise. You want to celebrate the night. What do you choose?",
    a: [
      { text: "Give yourself a good rest as your reward.", pal: "sky", points: 1 },
      { text: "Treat yourself to a luxurious meal.", pal: "ty", points: 1 }
    ]
  }
];
