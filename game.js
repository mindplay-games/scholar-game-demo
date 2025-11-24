// ===============================
// MindPlay Python Adventure - game.js (FULL)
// Chapters via ?chapter=1,2,...
// UI: progress bar, chapter title, level counter, hint button, icons, sounds
// ===============================

// 1) קוראים איזה פרק לפתוח מה-URL
const params = new URLSearchParams(window.location.search);
const chapterNum = Number(params.get("chapter") || 1);

// 2) מגדירים פרקים
// אפשר להוסיף לכל שלב:
// icon: "🧙‍♂️"   (אופציונלי)
// hint: "רמז קצר..." (אופציונלי)
const chapters = {
  1: [
    {
      story:
        "פרק 1 – שלב 1: הגעת לשער הכניסה לאקדמיה. הוא נעול, ורק מי שיודע כישוף הדפסה יכול לפתוח אותו.",
      icon: "🏰",
      hint: "רמז: בפייתון מדפיסים עם print",
      question: "איזה קוד מדפיס 'Hello'? ",
      answers: [
        { text: "print('Hello')", correct: true },
        { text: "echo('Hello')", correct: false },
        { text: "console.log('Hello')", correct: false },
        { text: "printf('Hello')", correct: false }
      ]
    },

    {
      story:
        "פרק 1 – שלב 2: פרופסור פיקסל מופיע ואומר: 'כדי להדליק את הפנס הקסום עלייך להדפיס את המילה Magic'.",
      icon: "🧪",
      hint: "רמז: אם זה טקסט, חייבים גרשיים.",
      question: "איזה קוד ידפיס את המילה Magic?",
      answers: [
        { text: "print('Magic')", correct: true },
        { text: "print(Magic)", correct: false },
        { text: "echo('Magic')", correct: false },
        { text: "print('magic')", correct: false }
      ]
    },

    {
      story:
        "פרק 1 – שלב 3: הפנס נדלק! עכשיו צריך להאיר נתיב אפל. כדי לעשות זאת צריך להדפיס מספר.",
      icon: "🔦",
      hint: "רמז: מספרים לא צריכים גרשיים.",
      question: "מה ידפיס הקוד הבא?\n\nprint(7)",
      answers: [
        { text: "7", correct: true },
        { text: "'7'", correct: false },
        { text: "print(7)", correct: false },
        { text: "Error", correct: false }
      ]
    },

    {
      story:
        "פרק 1 – שלב 4: יש באג קסום! קוד מסוים לא עובד. עלייך למצוא את השורה התקינה.",
      icon: "🐞",
      hint: "רמז: print חייב אותיות קטנות וגרשיים סגורים.",
      question: "איזה קוד תקין להדפסת הטקסט: Hello Wizard?",
      answers: [
        { text: "print('Hello Wizard')", correct: true },
        { text: "print(Hello Wizard)", correct: false },
        { text: "print(\"Hello Wizard)", correct: false },
        { text: "Print('Hello Wizard')", correct: false }
      ]
    },

    {
      story:
        "פרק 1 – שלב 5: רגע… באגון הופיע ובלבל את הקוד. הוא שם שני משפטים בקוד אחד.",
      icon: "😈",
      hint: "רמז: שתי פקודות print יודפסו בשתי שורות.",
      question: "מה ידפיס הקוד?\n\nprint('Hi')\nprint('There')",
      answers: [
        { text: "Hi\nThere", correct: true },
        { text: "Hi There", correct: false },
        { text: "Error", correct: false },
        { text: "Hithere", correct: false }
      ]
    },

    {
      story:
        "פרק 1 – שלב 6: הגענו לשער הסופי של הפרק! כדי לפתוח אותו צריך להדפיס את המשפט: I love Python",
      icon: "✨",
      hint: "רמז: כל המשפט בתוך גרשיים.",
      question: "איזה קוד נכון?",
      answers: [
        { text: "print('I love Python')", correct: true },
        { text: "print('I love' Python)", correct: false },
        { text: "print(I love Python)", correct: false },
        { text: "print('I' + ' love Python')", correct: false }
      ]
    }
  ],

  2: [
    {
      story: "פרק 2 – שלב 1: היער דורש תנאי.",
      icon: "🌲",
      hint: "רמז: 3 לא גדול מ-5.",
      question:
        "מה הפלט?\n\nx=3\nif x>5:\n  print('A')\nelse:\n  print('B')",
      answers: [
        { text: "A", correct: false },
        { text: "B", correct: true },
        { text: "לא יודפס כלום", correct: false },
        { text: "Error", correct: false }
      ]
    },
    {
      story: "פרק 2 – שלב 2: עוד תנאי קטן.",
      icon: "🚪",
      hint: "רמז: סימן שווה-שווה.",
      question: "איזה סימן זה 'שווה ל' בפייתון?",
      answers: [
        { text: "==", correct: true },
        { text: "=", correct: false },
        { text: "!=", correct: false },
        { text: "=>", correct: false }
      ]
    }
  ]
};

// 3) בוחרים את levels לפי הפרק
let levels = chapters[chapterNum] || chapters[1];

// 4) מנוע המשחק
let levelIndex = 0;
let locked = false;

// ---- DOM ----
const storyEl = document.getElementById("story");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");

// UI תוספות (אם קיימות ב-index.html המעודכן)
const chapterTitleEl = document.getElementById("chapterTitle");
const levelCounterEl = document.getElementById("levelCounter");
const progressBarEl = document.getElementById("progressBar");
const storyIconEl = document.getElementById("storyIcon");
const hintBtn = document.getElementById("hintBtn");

// ---- צלילים קטנים (ללא קבצים) ----
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

// beep פשוט
function beep(freq = 440, duration = 0.12) {
  try {
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);
    o.frequency.value = freq;
    o.type = "sine";
    g.gain.value = 0.05;
    o.start();
    o.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // אם דפדפן חוסם אודיו עד קליק – פשוט מתעלמים
  }
}

// ---- UI helpers ----
function setTopUI() {
  if (chapterTitleEl) chapterTitleEl.textContent = `פרק ${chapterNum}`;
  if (levelCounterEl)
    levelCounterEl.textContent = `שלב ${levelIndex + 1}/${levels.length}`;

  if (progressBarEl) {
    const denom = levels.length - 1 || 1;
    const pct = (levelIndex / denom) * 100;
    progressBarEl.style.width = `${pct}%`;
  }
}

function renderLevel() {
  locked = false;

  feedbackEl.textContent = "";
  feedbackEl.className = "";

  if (nextBtn) nextBtn.classList.add("hidden");

  const lvl = levels[levelIndex];

  storyEl.textContent = lvl.story;
  questionEl.textContent = lvl.question;

  if (storyIconEl) storyIconEl.textContent = lvl.icon || "✨";

  answersEl.innerHTML = "";
  setTopUI();

  lvl.answers.forEach((a) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = a.text;
    btn.onclick = () => chooseAnswer(a.correct, btn);
    answersEl.appendChild(btn);
  });
}

function chooseAnswer(isCorrect, btnEl) {
  if (locked) return;

  if (isCorrect) {
    locked = true;
    beep(880, 0.12);

    btnEl.classList.add("correct");
    feedbackEl.textContent = "✅ נכון! השער נפתח!";
    feedbackEl.classList.add("correct");

    if (nextBtn) nextBtn.classList.remove("hidden");
  } else {
    beep(220, 0.15);

    btnEl.classList.add("wrong");
    feedbackEl.textContent = "❌ לא נכון, נסו שוב.";
    feedbackEl.classList.add("wrong");

    // מאפשר ניסיון נוסף
    setTimeout(() => btnEl.classList.remove("wrong"), 450);
  }
}

// מעבר לשלב הבא
if (nextBtn) {
  nextBtn.onclick = () => {
    levelIndex++;
    if (levelIndex >= levels.length) levelIndex = 0;
    renderLevel();
  };
}

// רמז
if (hintBtn) {
  hintBtn.onclick = () => {
    const lvl = levels[levelIndex];
    if (lvl.hint) {
      feedbackEl.textContent = "💡 רמז: " + lvl.hint;
      feedbackEl.className = "";
    } else {
      feedbackEl.textContent = "אין רמז בשלב הזה 🙂";
      feedbackEl.className = "";
    }
  };
}

// Start
renderLevel();
