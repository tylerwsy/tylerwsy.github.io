/* english_plural.js - Fully enhanced with singular word display and results page update */

// Paste your manually provided JSON data here.
const quizData = [
  {
    "noun": "cat",
    "options": ["cats", "cates", "caties", "catys"],
    "answer": "cats",
    "explanation": "We add an 's' at the end to show more than one cat."
  },
  {
    "noun": "dog",
    "options": ["dogs", "doges", "dogies", "dogys"],
    "answer": "dogs",
    "explanation": "Just put an 's' on the end to show there are many dogs."
  },
  // ... (Other questions continue)
];

// Fetch user-selected number of questions
const selectedNumber = parseInt(localStorage.getItem("wordCount"), 10) || quizData.length;
const shuffledQuizData = quizData.sort(() => 0.5 - Math.random()).slice(0, selectedNumber);

// Global variables
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
const totalQuestions = shuffledQuizData.length;

// DOM elements
const questionCountElem = document.getElementById("questionCount");
const questionElem = document.getElementById("question");
const optionsContainer = document.getElementById("optionsContainer");
const quizBox = document.getElementById("quizBox");
const resultBox = document.getElementById("resultBox");
const scoreText = document.getElementById("scoreText");

// Helper to create a speaker icon button that speaks the given word when clicked.
function createSpeakerIcon(word) {
  const speakerBtn = document.createElement("button");
  speakerBtn.innerHTML = "🔈";
  speakerBtn.setAttribute("aria-label", "Speak word");
  speakerBtn.classList.add("interactive-btn");
  speakerBtn.style.marginLeft = "0.5rem";
  speakerBtn.style.fontSize = "1.2rem";
  speakerBtn.onclick = () => {
    let utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };
  return speakerBtn;
}

// Shuffle options array
function shuffleArray(array) {
  const newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Display current question
function showQuestion() {
  const currentQuestion = shuffledQuizData[currentIndex];
  // Display question number out of total
  questionCountElem.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;
  
  // Set and display the quiz word
  questionElem.textContent = currentQuestion.noun.charAt(0).toUpperCase() + currentQuestion.noun.slice(1);
  
  // Append the speaker icon next to the quiz word.
  const speakerIcon = createSpeakerIcon(currentQuestion.noun);
  questionElem.appendChild(speakerIcon);
  
  // Automatically speak the quiz word when loaded.
  let utterance = new SpeechSynthesisUtterance(currentQuestion.noun);
  utterance.lang = "en-US";
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
  
  optionsContainer.innerHTML = "";
  const randomizedOptions = shuffleArray(currentQuestion.options);
  randomizedOptions.forEach(option => {
    const btn = document.createElement("button");
    btn.classList.add("interactive-btn");
    btn.textContent = option.charAt(0).toUpperCase() + option.slice(1);
    btn.onclick = () => checkAnswer(btn, currentQuestion.answer, currentQuestion.explanation);
    optionsContainer.appendChild(btn);
  });
  
}

// Check user's answer and provide explanation
function checkAnswer(selectedBtn, correctAnswer, explanation) {
  const allButtons = optionsContainer.querySelectorAll("button");
  allButtons.forEach(btn => btn.disabled = true);
  
  const feedbackElem = document.createElement("p");
  feedbackElem.style.fontWeight = "bold";
  feedbackElem.style.fontSize = "2rem";
  feedbackElem.style.padding = "0.5rem";
  feedbackElem.style.margin = "0.5rem auto";
  feedbackElem.style.textAlign = "center";
  
  if (selectedBtn.textContent.toLowerCase() === correctAnswer.toLowerCase()) {
    selectedBtn.classList.add("correct");
    correctCount++;
    feedbackElem.textContent = "Correct!";
    feedbackElem.style.backgroundColor = "#d4edda";
    feedbackElem.style.color = "green";
  } else {
    selectedBtn.classList.add("incorrect");
    allButtons.forEach(btn => {
      if (btn.textContent.toLowerCase() === correctAnswer.toLowerCase()) {
        btn.classList.add("correct");
      }
    });
    feedbackElem.textContent = "Wrong :(";
    feedbackElem.style.backgroundColor = "#f8d7da";
    feedbackElem.style.color = "red";
    wrongCount++;
  }
  
  const explanationElem = document.createElement("p");
  explanationElem.classList.add("explanation-text");
  explanationElem.textContent = `Explanation: ${explanation}`;
  
  optionsContainer.parentNode.appendChild(feedbackElem);
  optionsContainer.parentNode.appendChild(explanationElem);
  
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.classList.add("interactive-btn");
  nextBtn.onclick = () => nextQuestion();
  optionsContainer.parentNode.appendChild(nextBtn);
}

// Clear feedback from previous question
function clearFeedback() {
  document.querySelectorAll(".explanation-text, .interactive-btn:not(.back-btn), p[style]").forEach(elem => {
    // Skip the quiz word paragraph and the question count element.
    if (elem.id === "questionCount" || elem === questionElem || elem.parentNode === optionsContainer) {
      return;
    }
    elem.remove();
  });
}

// Proceed to the next question
function nextQuestion() {
  currentIndex++;
  loadQuestion();
}

// Load the current question or show result if finished
function loadQuestion() {
  clearFeedback();
  if (currentIndex < totalQuestions) {
    showQuestion();
  } else {
    showResult();
  }
}

// Show the final results
function showResult() {
  quizBox.style.display = "none";
  resultBox.style.display = "block";
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  scoreText.textContent = `You got ${correctCount}/${totalQuestions} correct (${percentage}%)`;
  
  const finalMessage = document.createElement("p");
  finalMessage.style.fontSize = "2rem";
  finalMessage.style.backgroundColor = "lightyellow";
  finalMessage.style.padding = "0.5rem";
  finalMessage.style.textAlign = "center";
  finalMessage.style.margin = "0.5rem auto";
  finalMessage.textContent = `You got ${correctCount}/${totalQuestions} correct (${percentage}%)`;
  
  const tryAgainBtn = document.createElement("button");
  tryAgainBtn.textContent = "Try Again";
  tryAgainBtn.classList.add("interactive-btn");
  tryAgainBtn.onclick = () => window.location.reload();
  
  const backBtn = document.createElement("button");
  backBtn.textContent = "Back";
  backBtn.classList.add("interactive-btn");
  backBtn.onclick = () => window.location.href = "select.html";
  
  resultBox.innerHTML = "";
  resultBox.appendChild(finalMessage);
  resultBox.appendChild(tryAgainBtn);
  resultBox.appendChild(backBtn);
  
  saveQuizResult("english_plural");
}

// Save results to local storage
function saveQuizResult(mode) {
  const logs = JSON.parse(localStorage.getItem("quizResults") || "[]");
  logs.push({
    mode,
    date: new Date().toISOString(),
    total: totalQuestions,
    correct: correctCount,
    wrong: wrongCount
  });
  localStorage.setItem("quizResults", JSON.stringify(logs));
}

// Initialize quiz
window.addEventListener("DOMContentLoaded", loadQuestion);
