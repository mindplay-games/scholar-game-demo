const levels = [
  {
    story: "שלב 1: את/ה רואה שער נעול. איזה קוד מדפיס 'Hello'?",
    question: "מה הקוד הנכון?",
    answers: [
      { text: "print('Hello')", correct: true },
      { text: "echo('Hello')", correct: false },
      { text: "printf('Hello')", correct: false },
      { text: "console.log('Hello')", correct: false },
    ]
  },
  {
    story: "שלב 2: גשר קסום מופיע רק אם תנאי נכון.",
    question: "מה יצא מהקוד?\n\nx=3\nif x>5:\n  print('A')\nelse:\n  print('B')",
    answers: [
      { text: "A", correct: false },
      { text: "B", correct: true },
      { text: "לא יודפס כלום", correct: false },
      { text: "Error", correct: false },
    ]
  },
  {
    story: "שלב 3: הגעת לאוצר 🎉",
    question: "כל הכבוד! סיימת דמו.",
    answers: [
      { text: "לשחק שוב", correct: true }
    ]
  }
];

let levelIndex = 0;
let locked = false;

const storyEl = document.getElementById("story");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");

function renderLevel() {
  locked = false;
  feedbackEl.textContent = "";
  feedbackEl.className = "";
  nextBtn.classList.add("hidden");

  const lvl = levels[levelIndex];
  storyEl.textContent = lvl.story;
  questionEl.textContent = lvl.question;
  answersEl.innerHTML = "";

  lvl.answers.forEach((a) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = a.text;
    btn.onclick = () => chooseAnswer(a.correct);
    answersEl.appendChild(btn);
  });
}

function chooseAnswer(isCorrect) {
  if (locked) return;
  locked = true;

  if (isCorrect) {
    feedbackEl.textContent = "✅ נכון! אפשר להמשיך.";
    feedbackEl.classList.add("correct");
    nextBtn.classList.remove("hidden");
  } else {
    feedbackEl.textContent = "❌ לא נכון, נסו שוב.";
    feedbackEl.classList.add("wrong");
    locked = false; // מאפשר להמשיך לבחור
  }
}

nextBtn.onclick = () => {
  levelIndex++;
  if (levelIndex >= levels.length) levelIndex = 0;
  renderLevel();
};

renderLevel();
