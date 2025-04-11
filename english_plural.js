/* english_plural.js */

// A static list of common nouns in their singular forms.
const nounList = [
  "cat", "dog", "baby", "box", "church", "dish", "key", "knife",
  "boy", "toy", "berry", "watch", "bench", "hero", "potato", "tomato",
  "man", "woman", "child", "goose", "foot", "tooth", "mouse", "leaf"
];

// Global variables for the test.
let words = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;

// DOM elements.
const questionCountElem = document.getElementById("questionCount");
const questionElem = document.getElementById("question");
const optionsContainer = document.getElementById("optionsContainer");
const quizBox = document.getElementById("quizBox");
const resultBox = document.getElementById("resultBox");
const scoreText = document.getElementById("scoreText");

// Helper: Convert a singular noun to its plural form.
function singularToPlural(word) {
  // If the word ends with "ch", "sh", "s", "x", or "z", add "es"
  if (/(ch|sh|[sxz])$/i.test(word)) {
    return word + "es";
  }
  // If the word ends with a consonant followed by "y", replace "y" with "ies"
  if (/[b-df-hj-np-tv-z]y$/i.test(word)) {
    return word.slice(0, -1) + "ies";
  }
  // Otherwise, add "s"
  return word + "s";
}

// Helper: Generate four unique options (one correct and three distractors) for the plural.
function generatePluralOptions(singular) {
  const correct = singularToPlural(singular);
  let optionsSet = new Set();
  optionsSet.add(correct);
  // Distractor 1: singular + "s"
  optionsSet.add(singular + "s");
  // Distractor 2: If the word ends with "y", add replacement as "ys"
  if (singular.endsWith("y")) {
    optionsSet.add(singular.slice(0, -1) + "ys");
  }
  // Distractor 3: singular + "es"
  optionsSet.add(singular + "es");
  
  // Convert the set to an array and ensure there are exactly 4 unique options.
  let options = Array.from(optionsSet);
  while (options.length < 4) {
    // Fallback option if needed.
    options.push(correct + "X");
    options = Array.from(new Set(options));
  }
  
  // Shuffle the options array.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

// Load words from the static noun list.
function loadWords() {
  // Get the desired word count from localStorage.
  let wordCount = parseInt(localStorage.getItem("wordCount"), 10) || 10;
  // Filter out nouns that do not have a distinct plural form.
  let validNouns = nounList.filter(word => singularToPlural(word) !== word);
  console.log("Valid nouns available:", validNouns.length);
  if (validNouns.length < wordCount) {
    wordCount = validNouns.length;
  }
  // Shuffle valid nouns.
  validNouns.sort(() => Math.random() - 0.5);
  words = validNouns.slice(0, wordCount);
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  console.log("Selected words:", words);
  if (words.length === 0) {
    quizBox.innerHTML = "<p>No valid nouns available. Please update the noun list.</p>";
  } else {
    showQuestion();
  }
}

// Display the current question.
function showQuestion() {
  questionCountElem.textContent = `Question ${currentIndex + 1} of ${words.length}`;
  const singular = words[currentIndex].trim();
  const correctPlural = singularToPlural(singular);
  questionElem.textContent = `What is the plural of "${singular}"?`;
  
  // Generate 4 unique options.
  const options = generatePluralOptions(singular);
  optionsContainer.innerHTML = "";
  options.forEach(option => {
    const btn = document.createElement("button");
    btn.classList.add("interactive-btn");
    btn.textContent = option;
    btn.onclick = () => checkAnswer(btn, correctPlural);
    optionsContainer.appendChild(btn);
  });
}

// Check the answer when an option is clicked.
function checkAnswer(selectedBtn, correctAnswer) {
  const allButtons = optionsContainer.querySelectorAll("button");
  // Disable all options.
  allButtons.forEach(btn => btn.disabled = true);
  
  if (selectedBtn.textContent === correctAnswer) {
    selectedBtn.classList.add("correct");
    correctCount++;
    questionElem.textContent += " - Correct!";
  } else {
    selectedBtn.classList.add("incorrect");
    // Highlight the correct answer.
    allButtons.forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct");
      }
    });
    questionElem.textContent += ` - Wrong. Correct answer is "${correctAnswer}".`;
    wrongCount++;
  }
  setTimeout(nextQuestion, 1000);
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < words.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizBox.style.display = "none";
  resultBox.style.display = "block";
  const percentage = Math.round((correctCount / words.length) * 100);
  scoreText.textContent = `You got ${correctCount}/${words.length} correct (${percentage}%)`;
  saveQuizResult("english_plural");
}

// Save the quiz result (mode "english_plural") for the chart.
function saveQuizResult(mode) {
  const logs = JSON.parse(localStorage.getItem("quizResults") || "[]");
  logs.push({
    mode: mode,
    date: new Date().toISOString(),
    total: words.length,
    correct: correctCount,
    wrong: wrongCount
  });
  localStorage.setItem("quizResults", JSON.stringify(logs));
  console.log("Quiz results saved:", localStorage.getItem("quizResults"));
}

// Initialize test when document is ready.
document.addEventListener("DOMContentLoaded", () => {
  loadWords();
});
