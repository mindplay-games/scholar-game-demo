// ===============================
// MindPlay Python Adventure - game.js (FULL)
// Supports: dialogue / mcq / code (one line) / drag
// Chapters via ?chapter=1,2,...
// ===============================

// --- chapter param ---
const params = new URLSearchParams(window.location.search);
const chapterNum = Number(params.get("chapter") || 1);

// --- Chapters data ---
// For each level:
// type: "dialogue" | "mcq" | "code" | "drag"
// optional: icon, hint, character, avatar, text, bg, etc.
const chapters = {
  1: [
    {
      type: "dialogue",
      icon: "🏰",
      character: "פרופסור פיקסל",
      // avatar: "assets/prof.png", // אפשר להוסיף כשתעלי איורים
      text: "ברוך הבא לאקדמיה! כדי לפתוח את השער נלמד היום את כישוף ההדפסה: print."
    },

    {
      type: "mcq",
      story: "פרק 1 – שלב 1: שער הכניסה נעול.",
      icon: "🚪",
      hint: "בפייתון מדפיסים עם print",
      question: "איזה קוד מדפיס 'Hello'?",
      answers: [
        { text: "print('Hello')", correct: true },
        { text: "echo('Hello')", correct: false },
        { text: "console.log('Hello')", correct: false },
        { text: "printf('Hello')", correct: false }
      ]
    },

    {
      type: "dialogue",
      icon: "😈",
      character: "באגון",
      text: "חחח! אני טרפתי לכם את הקוד. נראה אם תצליחו להדפיס נכון!"
    },

    {
      type: "code",
      story: "פרק 1 – שלב 2: כתיבת קוד אמיתי!",
      icon: "✨",
      prompt: "הקלד/י שורה אחת שמדפיסה: Magic",
      hint: "שורה אחת. אל תשכח/י גרשיים.",
      validator: {
        mode: "exact",
        patterns: ["print('Magic')", 'print("Magic")']
      }
    },

    {
      type: "drag",
      story: "פרק 1 – שלב 3: סידור כישוף",
      icon: "🧩",
      prompt: "גרור/י את החלקים לסדר נכון כדי ליצור: print('Hi')",
      items: ["'Hi'", "print(", ")"],
      targetOrder: ["print(", "'Hi'", ")"]
    },

    {
      type: "mcq",
      story: "פרק 1 – שלב 4: הדפסה של מספר",
      icon: "🔦",
      question: "מה ידפיס הקוד הבא?\n\nprint(7)",
      answers: [
        { text: "7", correct: true },
        { text: "'7'", correct: false },
        { text: "print(7)", correct: false },
        { text: "Error", correct: false }
      ]
    }
  ]
};

let levels = chapters[chapterNum] || chapters[1];

// --- state ---
let levelIndex = 0;
let locked = false;

// --- DOM ---
const storyEl = document.getElementById("story");
const storyIconEl = document.getElementById("storyIcon");

const characterRow = document.getElementById("characterRow");
const characterAvatar = document.getElementById("characterAvatar");
const characterName = document.getElementById("characterName");
const characterText = document.getElementById("characterText");

const mcqBox = document.getElementById("mcqBox");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const hintBtn = document.getElementById("hintBtn");
const nextBtn = document.getElementById("nextBtn");

const codeBox = document.getElementById("codeBox");
const codePromptEl = document.getElementById("codePrompt");
const codeInputEl = document.getElementById("codeInput");
const runCodeBtn = document.getElementById("runCodeBtn");
const nextFromCodeBtn = document.getElementById("nextFromCodeBtn");

const dragBox = document.getElementById("dragBox");
const dragPromptEl = document.getElementById("dragPrompt");
const dragItemsEl = document.getElementById("dragItems");
const dragTargetEl = document.getElementById("dragTarget");
const checkDragBtn = document.getElementById("checkDragBtn");
const nextFromDragBtn = document.getElementById("nextFromDragBtn");

const feedbackEl = document.getElementById("feedback");
const chapterTitleEl = document.getElementById("chapterTitle");
const levelCounterEl = document.getElementById("levelCounter");
const progressBarEl = document.getElementById("progressBar");

// --- sounds ---
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function ensureAudio(){ if(!audioCtx) audioCtx = new AudioCtx(); }
function beep(freq=440, duration=0.12){
  try{
    ensureAudio();
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value=freq; o.type="sine"; g.gain.value=0.05;
    o.start(); o.stop(audioCtx.currentTime+duration);
  }catch(e){}
}

// --- helpers ---
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

function resetFeedback(){
  feedbackEl.textContent="";
  feedbackEl.className="";
}

function hideAllBoxes(){
  mcqBox.classList.add("hidden");
  codeBox.classList.add("hidden");
  dragBox.classList.add("hidden");
  nextBtn.classList.add("hidden");
  nextFromCodeBtn.classList.add("hidden");
  nextFromDragBtn.classList.add("hidden");
}

function showCharacter(lvl){
  if(lvl.character || lvl.text){
    characterRow.classList.remove("hidden");
    characterName.textContent = lvl.character || "";
    characterText.textContent = lvl.text || "";
    if(lvl.avatar){
      characterAvatar.src = lvl.avatar;
      characterAvatar.classList.remove("hidden");
      characterAvatar.alt = lvl.character || "דמות";
    }else{
      characterAvatar.classList.add("hidden");
    }
  }else{
    characterRow.classList.add("hidden");
  }
}

function normalize(s){
  return (s||"")
    .replace(/\s+/g,"")
    .replace(/“|”/g,'"')
    .replace(/‘|’/g,"'")
    .toLowerCase();
}

function validateCode(userInput, validator){
  const user = normalize(userInput);

  if(!validator) return false;

  if(validator.mode==="exact"){
    return validator.patterns.some(p => user === normalize(p));
  }
  if(validator.mode==="contains"){
    return validator.patterns.every(p => user.includes(normalize(p)));
  }
  if(validator.mode==="regex"){
    return new RegExp(validator.pattern).test(userInput);
  }
  return false;
}

// --- renderers ---
function renderDialogue(lvl){
  hideAllBoxes();
  storyEl.textContent = lvl.text || lvl.story || "";
  showCharacter(lvl);
  nextBtn.classList.remove("hidden");
}

function renderMCQ(lvl){
  hideAllBoxes();
  mcqBox.classList.remove("hidden");
  showCharacter({}); // hide character row
  storyEl.textContent = lvl.story || "";
  questionEl.textContent = lvl.question || "";
  answersEl.innerHTML = "";

  lvl.answers.forEach((a) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = a.text;
    btn.onclick = () => chooseMCQ(a.correct, btn);
    answersEl.appendChild(btn);
  });

  // hint
  hintBtn.onclick = () => {
    if (lvl.hint) {
      feedbackEl.textContent = "💡 רמז: " + lvl.hint;
      feedbackEl.className="";
    } else {
      feedbackEl.textContent = "אין רמז בשלב הזה 🙂";
      feedbackEl.className="";
    }
  };
}

function chooseMCQ(isCorrect, btnEl){
  if(locked) return;
  if(isCorrect){
    locked=true;
    beep(880,0.12);
    btnEl.classList.add("correct");
    feedbackEl.textContent="✅ נכון! השער נפתח!";
    feedbackEl.classList.add("correct");
    nextBtn.classList.remove("hidden");
  }else{
    beep(220,0.15);
    btnEl.classList.add("wrong");
    feedbackEl.textContent="❌ לא נכון, נסו שוב.";
    feedbackEl.classList.add("wrong");
    setTimeout(()=>btnEl.classList.remove("wrong"),450);
  }
}

function renderCode(lvl){
  hideAllBoxes();
  codeBox.classList.remove("hidden");
  showCharacter({}); // hide character row
  storyEl.textContent = lvl.story || "";
  codePromptEl.textContent = lvl.prompt || "כתוב/י קוד:";
  codeInputEl.value = "";
  codeInputEl.focus();

  runCodeBtn.onclick = () => {
    const ok = validateCode(codeInputEl.value, lvl.validator);
    if(ok){
      beep(880,0.12);
      feedbackEl.textContent="✅ מעולה! זה קוד נכון.";
      feedbackEl.className="correct";
      nextFromCodeBtn.classList.remove("hidden");
    }else{
      beep(220,0.15);
      feedbackEl.textContent="❌ כמעט… נסו שוב.";
      feedbackEl.className="wrong";
    }
  };
}

function renderDrag(lvl){
  hideAllBoxes();
  dragBox.classList.remove("hidden");
  showCharacter({}); // hide character row
  storyEl.textContent = lvl.story || "";
  dragPromptEl.textContent = lvl.prompt || "גרור/י לסדר נכון:";
  dragItemsEl.innerHTML="";
  dragTargetEl.innerHTML="";

  // create chips
  lvl.items.forEach(text=>{
    const chip = document.createElement("div");
    chip.className="drag-chip";
    chip.draggable=true;
    chip.textContent=text;

    chip.addEventListener("dragstart", e=>{
      chip.classList.add("dragging");
      e.dataTransfer.setData("text/plain", text);
      e.dataTransfer.setData("from", "items");
    });
    chip.addEventListener("dragend", ()=> chip.classList.remove("dragging"));

    dragItemsEl.appendChild(chip);
  });

  // drop zones
  [dragItemsEl, dragTargetEl].forEach(zone=>{
    zone.addEventListener("dragover", e=> e.preventDefault());
    zone.addEventListener("drop", e=>{
      e.preventDefault();
      const text = e.dataTransfer.getData("text/plain");
      // create new chip in drop zone
      const chip = document.createElement("div");
      chip.className="drag-chip";
      chip.draggable=true;
      chip.textContent=text;

      chip.addEventListener("dragstart", ev=>{
        chip.classList.add("dragging");
        ev.dataTransfer.setData("text/plain", text);
      });
      chip.addEventListener("dragend", ()=> chip.classList.remove("dragging"));

      zone.appendChild(chip);
    });
  });

  checkDragBtn.onclick = () => {
    const current = [...dragTargetEl.querySelectorAll(".drag-chip")].map(c=>c.textContent);
    const ok = JSON.stringify(current) === JSON.stringify(lvl.targetOrder);
    if(ok){
      beep(880,0.12);
      feedbackEl.textContent="✅ סדר מושלם!";
      feedbackEl.className="correct";
      nextFromDragBtn.classList.remove("hidden");
    }else{
      beep(220,0.15);
      feedbackEl.textContent="❌ הסדר עדיין לא נכון. נסו שוב.";
      feedbackEl.className="wrong";
    }
  };
}

// --- main render ---
function renderLevel(){
  locked=false;
  resetFeedback();
  setTopUI();

  const lvl = levels[levelIndex];
  storyIconEl.textContent = lvl.icon || "✨";

  if(lvl.type==="dialogue") return renderDialogue(lvl);
  if(lvl.type==="code") return renderCode(lvl);
  if(lvl.type==="drag") return renderDrag(lvl);
  return renderMCQ(lvl); // default
}

// next buttons
nextBtn.onclick = goNext;
nextFromCodeBtn.onclick = goNext;
nextFromDragBtn.onclick = goNext;

function goNext(){
  levelIndex++;
  if(levelIndex>=levels.length) levelIndex=0;
  renderLevel();
}

renderLevel();
