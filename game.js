// 1) קוראים איזה פרק לפתוח מה-URL
const params = new URLSearchParams(window.location.search);
const chapterNum = Number(params.get("chapter") || 1);

// 2) מגדירים פרקים (שונים!)
const chapters = {
  1: [
    {
      story: "פרק 1 – שלב 1: שער הכניסה נעול.",
      question: "איזה קוד מדפיס Hello?",
      answers: [
        { text: "print('Hello')", correct: true },
        { text: "echo('Hello')", correct: false },
        { text: "printf('Hello')", correct: false },
        { text: "console.log('Hello')", correct: false },
      ]
    },
    {
      story: "פרק 1 – שלב 2: צריך משתנה כדי להדליק לפיד.",
      question: "מה הפלט?\nx = 5\nprint(x)",
      answers: [
        { text: "5", correct: true },
        { text: "x", correct: false },
        { text: "print(x)", correct: false },
        { text: "Error", correct: false },
      ]
    }
  ],

  2: [
    {
      story: "פרק 2 – שלב 1: היער דורש תנאי.",
      question: "מה הפלט?\nx=3\nif x>5:\n print('A')\nelse:\n print('B')",
      answers: [
        { text: "A", correct: false },
        { text: "B", correct: true },
        { text: "לא יודפס כלום", correct: false },
        { text: "Error", correct: false },
      ]
    },
    {
      story: "פרק 2 – שלב 2: עוד תנאי קטן.",
      question: "איזה סימן זה 'שווה ל' בפייתון?",
      answers: [
        { text: "==", correct: true },
        { text: "=", correct: false },
        { text: "!=", correct: false },
        { text: "=>", correct: false },
      ]
    }
  ]
};

// 3) בוחרים את levels לפי הפרק
let levels = chapters[chapterNum] || chapters[1];

// 4) מנוע המשחק (כמו שהיה)
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
    locked = false;
  }
}

nextBtn.onclick = () => {
  levelIndex++;
  if (levelIndex >= levels.length) levelIndex = 0;
  renderLevel();
};

renderLevel();
