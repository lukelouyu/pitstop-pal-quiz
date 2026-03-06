const palProfiles = {
  Perry: {
    tagline: "The Grounded Planner",
    description:
      "You steady yourself by pausing, prioritising, and taking manageable next steps. Your strength is calm clarity under pressure.",
    actionTip:
      "Pick one task today, break it into 3 smaller steps, and begin with only the first one."
  },
  Iggy: {
    tagline: "The Supportive Connector",
    description:
      "You recharge through people, belonging, and warm encouragement. Your strength is finding support and helping others feel included too.",
    actionTip:
      "Message one trusted friend today and check in with them."
  },
  Tobi: {
    tagline: "The Quiet Recharger",
    description:
      "You recover best through reflection, stillness, and intentional pauses. Your strength is knowing when slowing down is the healthiest next move.",
    actionTip:
      "Give yourself a 10-minute quiet break today with no rushing and no notifications."
  },
  Ty: {
    tagline: "The Nourishing Stabiliser",
    description:
      "You care for yourself by meeting your basic needs first. Your strength is remembering that fuel, hydration, and steadiness matter.",
    actionTip:
      "Drink water and prepare one proper meal or snack before your next busy block."
  },
  Sky: {
    tagline: "The Rest Protector",
    description:
      "You know rest is not laziness. Your strength is protecting sleep, recovery, and tomorrow’s energy.",
    actionTip:
      "Set a realistic sleep cut-off time tonight and honour it."
  },
  Ola: {
    tagline: "The Movement Energiser",
    description:
      "You steady yourself by moving your body and releasing stress physically. Your strength is turning tension into motion.",
    actionTip:
      "Take a short walk or stretch for 5 minutes the next time stress builds."
  },
  Ping: {
    tagline: "The Purpose Seeker",
    description:
      "You cope by reconnecting to meaning, perspective, and the bigger picture. Your strength is remembering why your journey matters.",
    actionTip:
      "Write down one reason your current journey matters beyond grades."
  }
};

const questions = [
  {
    theme: "Departure Day – The Semester Begins",
    title: "Q1 – CourseReg Storm",
    prompt:
      "Your timetable explodes into chaos. Everything is messy, there are modules with clashing time slots and full of uncertainty. What do you do first?",
    options: [
      {
        text: "A) Pause. Breathe. Sort modules by priority and what you can realistically manage.",
        pal: "Perry",
        points: 2
      },
      {
        text: "B) Step back and ask which modules truly align with where you want to go in life.",
        pal: "Ping",
        points: 1
      }
    ]
  },
  {
    theme: "CCA Festival at Town Green",
    title: "Q2 – CCA Festival at Town Green",
    prompt:
      "You start to explore the cruise, and you step into a vibrant hall filled with music, buzzing booths, and enthusiastic seniors inviting you to join. What naturally draws your attention?",
    options: [
      {
        text: "A) A CCA with strong community, mentorship, and connection.",
        pal: "Iggy",
        points: 2
      },
      {
        text: "B) Something active that keeps you physically energised.",
        pal: "Ola",
        points: 1
      }
    ]
  },
  {
    theme: "Unexpected Deadline",
    title: "Q3 – Unexpected Deadline",
    prompt:
      "All of a sudden, an assignment deadline catches you off guard. You return to your room, staring at your screen as tension builds.",
    options: [
      {
        text: "A) You deliberately take a short time-out before doing anything.",
        pal: "Tobi",
        points: 2
      },
      {
        text: "B) You realise your sleep has been messy, so you fix that first.",
        pal: "Sky",
        points: 1
      }
    ]
  },
  {
    theme: "Snacker",
    title: "Q4 – Snacker",
    prompt:
      "As you work through your assignment, brain fog sets in. What do you do?",
    options: [
      {
        text: "A) Water. Balanced snack. Stabilise first.",
        pal: "Ty",
        points: 2
      },
      {
        text: "B) Quick brisk walk outside to clear your head.",
        pal: "Ola",
        points: 1
      }
    ]
  },
  {
    theme: "Guarding the Night",
    title: "Q5 – Guarding the Night",
    prompt:
      "It’s late. You’re not finished. The temptation of an all-nighter lingers. You decide:",
    options: [
      {
        text: "A) Nothing is worth wrecking your sleep rhythm.",
        pal: "Sky",
        points: 2
      },
      {
        text: "B) You’ll prep nourishing meals to keep energy stable.",
        pal: "Ty",
        points: 1
      }
    ]
  },
  {
    theme: "Feelings of Jitters",
    title: "Q6 – Feelings of Jitters",
    prompt:
      "After a few days, you receive an email. Your result for that assignment has been released. Your heart races. How do you steady yourself?",
    options: [
      {
        text: "A) You move, stretch, walk, and release tension physically.",
        pal: "Ola",
        points: 2
      },
      {
        text: "B) You take five slow breaths and tell yourself that you can do it.",
        pal: "Perry",
        points: 1
      }
    ]
  },
  {
    theme: "After Receiving the Results",
    title: "Q7 – After receiving the results",
    prompt:
      "The results you received were not up to your expectations. Now what?",
    options: [
      {
        text: "A) You reflect on why this journey matters beyond one paper.",
        pal: "Ping",
        points: 2
      },
      {
        text: "B) You call or text someone who understands.",
        pal: "Iggy",
        points: 1
      }
    ]
  },
  {
    theme: "Group Project Tension",
    title: "Q8 – Group Project Tension",
    prompt:
      "A message pops up. Two group mates are in disagreement about workload and responsibility. How will you react?",
    options: [
      {
        text: "A) Calmly clarify roles, expectations, and priorities.",
        pal: "Perry",
        points: 1
      },
      {
        text: "B) Make space so everyone feels heard first.",
        pal: "Iggy",
        points: 1
      }
    ]
  },
  {
    theme: "Late Night Scroll Spiral",
    title: "Q9 – Late Night Scroll Spiral",
    prompt:
      "The semester starts to clear up, and you start to have more free time for yourself. It’s past midnight, and you think about whether you should continue scrolling.",
    options: [
      {
        text: "A) Phone down. Protect tomorrow by sleeping now.",
        pal: "Sky",
        points: 1
      },
      {
        text: "B) Search for a few more encouraging quotes before sleeping.",
        pal: "Iggy",
        points: 1
      }
    ]
  },
  {
    theme: "Chill Afternoon",
    title: "Q10 – Chill Afternoon",
    prompt:
      "You finally have free time. How will you use this time to recharge?",
    options: [
      {
        text: "A) Enjoy a quiet solo hobby.",
        pal: "Tobi",
        points: 1
      },
      {
        text: "B) Explore a new walking path on campus.",
        pal: "Ola",
        points: 1
      }
    ]
  },
  {
    theme: "Motivation Wavers",
    title: "Q11 – Motivation Wavers",
    prompt:
      "You begin to feel slightly disconnected from why you started this journey. What do you do?",
    options: [
      {
        text: "A) Reconnect to your bigger purpose.",
        pal: "Ping",
        points: 1
      },
      {
        text: "B) Set one tiny achievable goal and start.",
        pal: "Perry",
        points: 1
      }
    ]
  },
  {
    theme: "Homesick Evening",
    title: "Q12 – Homesick Evening",
    prompt:
      "The journey has been a long one. You start to feel a little alone and lonely for one night.",
    options: [
      {
        text: "A) Reach out and talk about life or have a deep conversation with your friends.",
        pal: "Ping",
        points: 1
      },
      {
        text: "B) Journal privately and sit with your thoughts.",
        pal: "Tobi",
        points: 1
      }
    ]
  },
  {
    theme: "Final Destination",
    title: "Q13 – Final Destination",
    prompt:
      "The Campus Cruise is approaching its final harbour. You have weathered storms, handled setbacks, and grown stronger. Before docking, you choose one final act of self-care.",
    options: [
      {
        text: "A) Scheduling small breaks intentionally.",
        pal: "Tobi",
        points: 1
      },
      {
        text: "B) Planning balanced meals and water intake.",
        pal: "Ty",
        points: 1
      }
    ]
  },
  {
    theme: "Final Stretch",
    title: "Q14 – Final Stretch",
    prompt:
      "This is the final night you have on the cruise. You want to celebrate the night. What do you choose?",
    options: [
      {
        text: "A) Give yourself a good rest as your reward.",
        pal: "Sky",
        points: 1
      },
      {
        text: "B) Treat yourself to a luxurious meal.",
        pal: "Ty",
        points: 1
      }
    ]
  }
];
