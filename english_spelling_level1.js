/* english_spelling_level1.js */

// 1. Your embedded word list
const quizData = [
  { word: "Happy" },
  { word: "Family" },
  { word: "Toy" },
  { word: "School" },
  { word: "Friend" },
  { word: "Play" },
  { word: "Game" },
  { word: "Book" },
  { word: "Dog" },
  { word: "Cat" },
  { word: "House" },
  { word: "Love" },
  { word: "Day" },
  { word: "Night" },
  { word: "Sun" },
  { word: "Moon" },
  { word: "Car" },
  { word: "Bike" },
  { word: "Tree" },
  { word: "Flower" },
  { word: "Rain" },
  { word: "Snow" },
  { word: "Look" },
  { word: "Where" },
  { word: "Away" },
  { word: "Help" },
  { word: "Make" },
  { word: "All" },
  { word: "Get" },
  { word: "Will" },
  { word: "Want" },
  { word: "Come" },
  { word: "Came" },
  { word: "Saw" },
  { word: "See" },
  { word: "Well" },
  { word: "New" },
  { word: "Our" },
  { word: "Let" },
  { word: "May" },
  { word: "Ask" },
  { word: "Just" },
  { word: "Has" },
  { word: "Have" },
  { word: "Had" },
  { word: "Them" },
  { word: "Any" },
  { word: "How" },
  { word: "Put" },
  { word: "Who" },
  { word: "What" },
  { word: "Why" },
  { word: "When" },
  { word: "Bird" },
  { word: "Fish" },
  { word: "Jump" },
  { word: "Run" },
  { word: "Walk" },
  { word: "Laugh" },
  { word: "Sing" },
  { word: "Dance" },
  { word: "Smile" },
  { word: "Help" },
  { word: "Share" },
  { word: "Kind" },
  { word: "Good" },
  { word: "Bad" },
  { word: "Big" },
  { word: "Small" },
  { word: "Long" },
  { word: "Short" },
  { word: "Fast" },
  { word: "Slow" },
  { word: "Up" },
  { word: "Down" },
  { word: "In" },
  { word: "Out" },
  { word: "On" },
  { word: "Off" },
  { word: "Over" },
  { word: "Under" },
  { word: "Red" },
  { word: "Blue" },
  { word: "Green" },
  { word: "Yellow" },
  { word: "Black" },
  { word: "White" },
  { word: "Brown" },
  { word: "Orange" },
  { word: "Purple" },
  { word: "Pink" },
  { word: "Gold" },
  { word: "Silver" },
  { word: "Sad" },
  { word: "Angry" },
  { word: "Afraid" },
  { word: "Tired" },
  { word: "Hungry" },
  { word: "Thirsty" },
  { word: "Hot" },
  { word: "Cold" },
  { word: "Morning" },
  { word: "Afternoon" },
  { word: "Evening" },
  { word: "Start" },
  { word: "Finish" },
  { word: "Stop" },
  { word: "Go" },
  { word: "Yes" },
  { word: "No" },
  { word: "Please" },
  { word: "Thank" },
  { word: "Sorry" },
  { word: "Hello" },
  { word: "Goodbye" },
  { word: "Schoolbag" },
  { word: "Teacher" },
  { word: "Pencil" },
  { word: "Desk" },
  { word: "Chair" },
  { word: "Paper" },
  { word: "Picture" },
  { word: "Animal" },
  { word: "Birthday" },
  { word: "Candy" },
  { word: "Water" },
  { word: "Cookie" }
];

// 2. Determine how many questions
let selectedNumber = parseInt(localStorage.getItem("wordCount"), 10) || quizData.length;
if (selectedNumber > quizData.length) selectedNumber = quizData.length;

// 3. Randomize & slice
const shuffledData = quizData.sort(() => 0.5 - Math.random()).slice(0, selectedNumber);

let currentIndex = 0, correctCount = 0;
const totalQuestions = shuffledData.length;

// DOM refs
const questionCountElem = document.getElementById("questionCount");
const questionElem      = document.getElementById("question");
const optionsContainer  = document.getElementById("optionsContainer");
const quizBox           = document.getElementById("quizBox");
const resultBox         = document.getElementById("resultBox");
const scoreText         = document.getElementById("scoreText");

// Kick things off
window.addEventListener("DOMContentLoaded", showQuestion);

/** Creates a 🔈 button that will speak `word` on demand */
function createSpeakerIcon(word) {
  const btn = document.createElement("button");
  btn.innerHTML = "🔈";
  btn.setAttribute("aria-label", "Speak word");
  btn.classList.add("interactive-btn");
  btn.style.marginLeft = "0.5rem";
  btn.style.fontSize = "1.2rem";
  btn.addEventListener("click", () => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en‑US";
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(u);
  });
  return btn;
}

function showQuestion() {
  // Remove any old feedback/next buttons
  clearFeedback();

  // Update counter
  questionCountElem.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;

  // Pick word & a random missing-letter index
  const { word } = shuffledData[currentIndex];
  const idx = Math.floor(Math.random() * word.length);
  const missingLetter = word[idx];

  // Mask it
  questionElem.textContent = word
    .split("")
    .map((l, i) => (i === idx ? "_" : l))
    .join("");
  // Append speaker icon for repeat pronunciation
  questionElem.appendChild(createSpeakerIcon(word));

  // Also speak automatically once
  let autoSpeak = new SpeechSynthesisUtterance(word);
  autoSpeak.lang = "en‑US";
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(autoSpeak);

  // Clear old options
  optionsContainer.innerHTML = "";

  // Build 4 unique choices
  const options = generateOptions(missingLetter);
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.classList.add("interactive-btn");
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(btn, missingLetter, word, idx);
    optionsContainer.appendChild(btn);
  });
}

function generateOptions(correct) {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const l = alpha[Math.floor(Math.random() * alpha.length)];
    if (l.toLowerCase() !== correct.toLowerCase()) wrongs.add(l);
  }
  return [correct.toUpperCase(), ...wrongs].sort(() => 0.5 - Math.random());
}

function checkAnswer(btn, correctLetter, word, idx) {
  // disable all
  Array.from(optionsContainer.children).forEach(b => b.disabled = true);

  // feedback bubble
  const fb = document.createElement("p");
  fb.classList.add("feedback");
  fb.style.cssText = `
    font-weight:bold; font-size:2rem;
    padding:0.5rem; text-align:center; margin:0.5rem auto;
  `;
  if (btn.textContent.toLowerCase() === correctLetter.toLowerCase()) {
    btn.classList.add("correct");
    correctCount++;
    fb.textContent = "Correct!";
    fb.style.backgroundColor = "#d4edda"; fb.style.color = "green";
  } else {
    btn.classList.add("incorrect");
    fb.textContent = "Wrong :(";
    fb.style.backgroundColor = "#f8d7da"; fb.style.color = "red";
    // highlight the correct one
    Array.from(optionsContainer.children).forEach(b => {
      if (b.textContent.toLowerCase() === correctLetter.toLowerCase()) {
        b.classList.add("correct");
      }
    });
  }
  optionsContainer.parentNode.appendChild(fb);

  // Show full word with underline
  questionElem.innerHTML = "";
  const span = document.createElement("span");
  span.innerHTML = word
    .split("")
    .map((l, i) => (i === idx ? `<u>${l}</u>` : l))
    .join("");
  questionElem.appendChild(span);
  questionElem.appendChild(createSpeakerIcon(word));

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.classList.add("interactive-btn", "next-btn");
  nextBtn.onclick = () => nextQuestion();
  optionsContainer.parentNode.appendChild(nextBtn);
}

function clearFeedback() {
  // ONLY remove our feedback <p> and .next-btn
  document.querySelectorAll(".feedback, .next-btn").forEach(e => e.remove());
}

function nextQuestion() {
  currentIndex++;
  optionsContainer.innerHTML = "";
  clearFeedback();
  if (currentIndex < totalQuestions) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizBox.style.display   = "none";
  resultBox.style.display = "block";
  const pct = Math.round((correctCount / totalQuestions) * 100);
  scoreText.textContent   = `You got ${correctCount}/${totalQuestions} correct (${pct}%)`;
  scoreText.style.fontSize = "3rem";

  const logs = JSON.parse(localStorage.getItem("quizResults") || "[]");
  logs.push({
    mode:    "english_spelling_level1",
    date:    new Date().toISOString(),
    total:   totalQuestions,
    correct: correctCount,
    wrong:   totalQuestions - correctCount
  });
  localStorage.setItem("quizResults", JSON.stringify(logs));
}
