/* chinese_proununication.js */

// Update the known prompt.
const KNOWN_PROMPT = "答案是";

// Azure Speech Service credentials – replace with your actual key.
const azureSubscriptionKey = "8Yj0oh8v4Pyg4YFzcpWJgK1SILr4ysJ4I1ACHhl1jUqcIyBI4tgRJQQJ99BDACqBBLyXJ3w3AAAYACOGk2lo";
const azureServiceRegion = "southeastasia"; // Default region

// Helper function: Convert digits (0-9) to Chinese characters.
function convertDigitsToChinese(str) {
  const digitMap = {
    "0": "零", "1": "一", "2": "二", "3": "三", "4": "四",
    "5": "五", "6": "六", "7": "七", "8": "八", "9": "九"
  };
  return str.replace(/\d/g, match => digitMap[match]);
}

// Helper: Clean the transcript by removing punctuation and extra spaces.
function cleanTranscript(str) {
  return str.replace(/[^\w\s\u4e00-\u9fa5]/g, "").replace(/\s+/g, " ").trim();
}

// Global variables.
let words = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;

// Recording and recognition variables.
let isRecording = false;
let mediaRecorder;
let micStream = null;
let audioContext, analyser, dataArray;
let recordedChunks = [];
let latestRecordingBlob = null;
let recordedTranscript = "";

// DOM elements.
const startRecordingBtn = document.getElementById("startRecordingBtn");
const recordingResult = document.getElementById("recordingResult");
const countdownDisplay = document.getElementById("countdownDisplay");
const quizWord = document.getElementById("quizWord");
const hintContainer = document.getElementById("hintContainer");
const quizBox = document.getElementById("quizBox");
const resultBox = document.getElementById("resultBox");
const scoreText = document.getElementById("scoreText");
const controlsContainer = document.getElementById("controlsContainer");
const questionCountElem = document.getElementById("questionCount");

// Unified button grouping.
let buttonGroup = null;
function ensureButtonGroup() {
  if (!buttonGroup) {
    buttonGroup = document.createElement("div");
    buttonGroup.style.display = "flex";
    buttonGroup.style.flexDirection = "column";
    buttonGroup.style.alignItems = "center";
    buttonGroup.style.width = "100%";
    buttonGroup.row1 = document.createElement("div");
    buttonGroup.row1.style.display = "flex";
    buttonGroup.row1.style.justifyContent = "center";
    buttonGroup.row1.style.gap = "0.5rem";
    buttonGroup.row2 = document.createElement("div");
    buttonGroup.row2.style.display = "flex";
    buttonGroup.row2.style.justifyContent = "center";
    buttonGroup.row2.style.gap = "0.5rem";
    buttonGroup.row2.style.marginTop = "0.5rem";
    buttonGroup.appendChild(buttonGroup.row1);
    buttonGroup.appendChild(buttonGroup.row2);
    controlsContainer.appendChild(buttonGroup);
  }
  return buttonGroup;
}

let submitBtn = null;
let nextBtn = null;
let playbackBtn = null;

// IndexedDB settings.
const DB_NAME = "SpellingAppDB";
const STORE_NAME = "words";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "english_chinesepinyinnumeric", autoIncrement: false });
      }
    };
  });
}

// Load quiz words based on stored "wordCount".
async function loadQuizWords() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      let allWords = request.result.filter(word => word.chinese && word.chinese.trim().length > 0);
      let wordCount = parseInt(localStorage.getItem("wordCount"), 10) || 10;
      if (allWords.length < wordCount) wordCount = allWords.length;
      allWords.sort(() => 0.5 - Math.random());
      words = allWords.slice(0, wordCount);
      currentIndex = 0;
      correctCount = 0;
      wrongCount = 0;
      if (words.length === 0) {
        quizBox.innerHTML = "<p>No Chinese words available in the dictionary. Please add words via the dictionary page.</p>";
      } else {
        showWord();
      }
    };
    request.onerror = () => console.error("Error loading dictionary words:", request.error);
  } catch (err) {
    console.error("Error opening DB:", err);
  }
}

/* Update dictionary record: increment attempts and if correct, increment correct count. */
async function updateWordRecord(word, isCorrect) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const key = word.english_chinesepinyinnumeric || (word.english + "_" + word.chinese);
      const getRequest = store.get(key);
      getRequest.onsuccess = () => {
        let record = getRequest.result;
        if (record) {
          record.attempts_chinese = (record.attempts_chinese || 0) + 1;
          if (isCorrect) {
            record.correct_chinese = (record.correct_chinese || 0) + 1;
          }
          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (e) {
    console.error("updateWordRecord error:", e);
  }
}

/* Display the current quiz word, hints, and question counter (centered). */
function showWord() {
  if (questionCountElem) {
    questionCountElem.textContent = `Question ${currentIndex + 1} of ${words.length}`;
  }
  if (currentIndex < words.length) {
    quizWord.textContent = words[currentIndex].chinese;
    quizWord.style.fontSize = "3rem";
    quizWord.style.backgroundColor = "lightyellow";
    quizWord.style.padding = "0.5rem";
    quizWord.style.margin = "0 auto";
    hintContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="display: flex; align-items: center; margin-bottom: 0.3rem;">
          <button id="pinyinHintBtn" class="interactive-btn" style="font-size:0.8rem; padding: 0.2rem 0.5rem;">Pinyin Hint</button>
          <span id="pinyinHint" style="display:none; margin-left:0.5rem;">${words[currentIndex].pinyin}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <button id="englishHintBtn" class="interactive-btn" style="font-size:0.8rem; padding: 0.2rem 0.5rem;">English Hint</button>
          <span id="englishHint" style="display:none; margin-left:0.5rem;">${words[currentIndex].english}</span>
        </div>
      </div>
    `;
    document.getElementById("pinyinHintBtn").addEventListener("click", () => {
      document.getElementById("pinyinHint").style.display = "inline";
    });
    document.getElementById("englishHintBtn").addEventListener("click", () => {
      const englishHintElem = document.getElementById("englishHint");
      if (!englishHintElem.style.display || englishHintElem.style.display === "none") {
        englishHintElem.style.display = "inline";
      } else {
        let utterance = new SpeechSynthesisUtterance(englishHintElem.textContent);
        utterance.lang = "en-US";
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      }
    });
    recordingResult.textContent = "";
    controlsContainer.innerHTML = "";
    buttonGroup = null;
    document.querySelectorAll(".correct-btn").forEach(btn => btn.remove());
  }
}

/* Compute Levenshtein distance for fuzzy matching. */
function levenshteinDistance(a, b) {
  const matrix = [];
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/* --- Azure Speech and Recording Functions --- */
/* This function calls Azure Speech Services to recognize speech.
   It re-requests a fresh microphone stream for live translation.
   The translation is invoked immediately after recording stops.
*/
function azureSpeechRecognize(subscriptionKey = azureSubscriptionKey, serviceRegion = azureServiceRegion, callback) {
  if (typeof SpeechSDK === "undefined") {
    console.error("Azure Speech SDK not found. Please include the SDK script in your HTML.");
    return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(newStream => {
      const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(newStream);
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
      speechConfig.speechRecognitionLanguage = "zh-CN";
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      recognizer.recognizeOnceAsync(
        result => {
          recordedTranscript = result.text;
          console.log("[azure] Recognized text:", recordedTranscript);
          recordingResult.textContent = `🔈 You said: ${recordedTranscript}`;
          if (callback) callback();
          newStream.getTracks().forEach(track => track.stop());
        },
        err => {
          console.error("[azure] Recognition error:", err);
          recordingResult.textContent += "\n[azure] Recognition error.";
          newStream.getTracks().forEach(track => track.stop());
        }
      );
    })
    .catch(err => {
      console.error("Error obtaining new microphone stream for Azure recognition:", err);
      recordingResult.textContent += "\nFailed to get microphone stream for translation.";
    });
}

function setupMediaRecorder(stream) {
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) { recordedChunks.push(event.data); }
  };
  mediaRecorder.onstop = () => {
    latestRecordingBlob = new Blob(recordedChunks, { type: "audio/webm" });
    console.log("MediaRecorder stopped; blob size:", latestRecordingBlob.size);
    updatePlaybackButton(latestRecordingBlob);
    recordedChunks = [];
  };
}

function updatePlaybackButton(blob) {
  const audioUrl = URL.createObjectURL(blob);
  console.log("Created blob URL:", audioUrl);
  if (!playbackBtn) {
    playbackBtn = document.createElement("button");
    playbackBtn.textContent = "Play Recorded Audio";
    playbackBtn.classList.add("interactive-btn");
    playbackBtn.addEventListener("click", () => {
      try {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.error("Playback error:", e));
      } catch (e) {
        console.error("Error in playback button click:", e);
      }
    });
    ensureButtonGroup().row1.appendChild(playbackBtn);
  } else {
    playbackBtn.onclick = () => {
      try {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.error("Playback error:", e));
      } catch (e) {
        console.error("Error in playback button onclick:", e);
      }
    };
  }
}

function setupMicStream(stream) {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function beginRecording() {
  recordedChunks = [];
  latestRecordingBlob = null;
  recordedTranscript = "";
  recordingResult.textContent = "";
  if (submitBtn && submitBtn.parentNode) { submitBtn.parentNode.removeChild(submitBtn); submitBtn = null; }
  if (nextBtn && nextBtn.parentNode) { nextBtn.parentNode.removeChild(nextBtn); nextBtn = null; }
  if (playbackBtn && playbackBtn.parentNode) { playbackBtn.parentNode.removeChild(playbackBtn); playbackBtn = null; }
  controlsContainer.innerHTML = "";
  buttonGroup = null;
  startRecordingBtn.disabled = false;
  startRecordingBtn.style.backgroundColor = "";
  setupMediaRecorder(micStream);
  // Do not wait for additional user action; live translate immediately after recording stops.
  recordingResult.textContent = "🎙️ Speak now...";
  countdownDisplay.textContent = "⏺️ Recording (6 sec)...";
  startRecordingBtn.textContent = "Recording...";
  mediaRecorder.start();
  isRecording = true;
  console.log("[recording] Started");
  setTimeout(() => {
    stopRecording();
    console.log("[recording] Auto-stopped after 6 seconds");
  }, 6000);
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
  isRecording = false;
  startRecordingBtn.textContent = "Retry";
  countdownDisplay.textContent = "";
  console.log("[recording] Stopped");
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
    console.log("Mic tracks stopped.");
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close().then(() => console.log("AudioContext closed"))
      .catch(e => console.error("AudioContext close error:", e));
  }
  // Immediately call Azure Speech Services for live translation.
  setTimeout(() => {
    azureSpeechRecognize(undefined, undefined, () => {
      // Once translation completes, automatically create the Submit button.
      createSubmitButton();
    });
  }, 200);
}

function createSubmitButton() {
  if (!submitBtn) {
    submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.classList.add("interactive-btn");
    submitBtn.addEventListener("click", handleSubmit);
    ensureButtonGroup().row1.appendChild(submitBtn);
  } else {
    submitBtn.disabled = false;
  }
}

async function handleSubmit() {
  console.log("handleSubmit triggered.");
  if (!recordedTranscript) {
    recordingResult.textContent += "\nNo speech detected. Please record again.";
    return;
  }
  if (!recordedTranscript.startsWith(KNOWN_PROMPT)) {
    recordedTranscript = KNOWN_PROMPT + recordedTranscript;
  }
  const expectedText = KNOWN_PROMPT + quizWord.textContent;
  const expectedPinyinFull = window.pinyinPro.pinyin(convertDigitsToChinese(expectedText), { toneType: "symbol", segment: true });
  const recordedPinyinFull = window.pinyinPro.pinyin(convertDigitsToChinese(recordedTranscript), { toneType: "symbol", segment: true });
  const expectedTokens = expectedPinyinFull.split(" ");
  const recordedTokens = recordedPinyinFull.split(" ");
  const expectedPinyin = expectedTokens.length > 3 ? expectedTokens.slice(3).join(" ").trim() : "";
  const recordedPinyin = recordedTokens.length > 3 ? recordedTokens.slice(3).join(" ").trim() : "";
  
  console.log("Expected pinyin (excluding prompt):", expectedPinyin);
  console.log("Recorded pinyin (excluding prompt):", recordedPinyin);
  
  const distance = levenshteinDistance(recordedPinyin, expectedPinyin);
  const threshold = Math.floor(expectedPinyin.length * 0.3);
  let isCorrect = (distance <= threshold);
  if (isCorrect) {
    recordingResult.textContent += "\nResult: ✅ Correct (fuzzy match)";
    correctCount++;
  } else {
    recordingResult.textContent += "\nResult: ❌ Wrong";
    recordingResult.textContent += "\nExpected (pinyin): " + expectedPinyin;
    recordingResult.textContent += "\nGot (pinyin): " + recordedPinyin;
    wrongCount++;
    createCorrectPlaybackButton();
  }
  submitBtn.disabled = true;
  submitBtn.style.backgroundColor = "grey";
  startRecordingBtn.disabled = true;
  startRecordingBtn.style.backgroundColor = "grey";
  await updateWordRecord(words[currentIndex], isCorrect);
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
    console.log("Mic tracks stopped after submit.");
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close().then(() => console.log("AudioContext closed after submit"))
      .catch(e => console.error("AudioContext close error:", e));
  }
  createNextButton();
}

function createCorrectPlaybackButton() {
  if (!document.querySelector(".correct-btn")) {
    let correctBtn = document.createElement("button");
    correctBtn.textContent = "Play Correct Word";
    correctBtn.classList.add("interactive-btn", "correct-btn");
    correctBtn.style.marginLeft = "auto";
    correctBtn.style.display = "block";
    recordingResult.parentNode.insertBefore(correctBtn, recordingResult.nextSibling);
    correctBtn.addEventListener("click", () => {
      window.speechSynthesis.resume();
      let utterance = new SpeechSynthesisUtterance(quizWord.textContent);
      utterance.lang = "zh-CN";
      window.speechSynthesis.speak(utterance).catch(e => console.error("Speech synthesis error:", e));
    });
  }
}

function createNextButton() {
  const existingNext = document.querySelector("#controlsContainer button.next-btn");
  if (existingNext) { existingNext.remove(); }
  nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.classList.add("interactive-btn", "next-btn");
  ensureButtonGroup().row2.appendChild(nextBtn);
  nextBtn.addEventListener("click", nextWord);
}

function nextWord() {
  document.querySelectorAll(".correct-btn").forEach(btn => btn.remove());
  currentIndex++;
  if (submitBtn && submitBtn.parentNode) { submitBtn.parentNode.removeChild(submitBtn); submitBtn = null; }
  if (nextBtn && nextBtn.parentNode) { nextBtn.parentNode.removeChild(nextBtn); nextBtn = null; }
  recordedTranscript = "";
  recordingResult.textContent = "";
  startRecordingBtn.textContent = "Start Recording";
  startRecordingBtn.disabled = false;
  startRecordingBtn.style.backgroundColor = "";
  controlsContainer.innerHTML = "";
  buttonGroup = null;
  playbackBtn = null;
  
  if (currentIndex < words.length) {
    showWord();
  } else {
    testCompleted();
  }
}

function testCompleted() {
  saveQuizResult();
  quizBox.style.display = "none";
  resultBox.style.display = "block";
  const percentage = Math.round((correctCount / words.length) * 100);
  scoreText.textContent = `You got ${correctCount}/${words.length} correct (${percentage}%)`;
  scoreText.style.fontSize = "3rem";
  scoreText.style.backgroundColor = "lightyellow";
  scoreText.style.padding = "0.5rem";
  scoreText.style.textAlign = "center";
  scoreText.style.margin = "0 auto";
  controlsContainer.innerHTML = "";
  let testAgainBtn = document.createElement("button");
  testAgainBtn.textContent = "Test Again";
  testAgainBtn.classList.add("interactive-btn");
  testAgainBtn.style.marginTop = "0.5rem";
  testAgainBtn.addEventListener("click", () => {
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    resultBox.style.display = "none";
    quizBox.style.display = "block";
    startRecordingBtn.disabled = false;
    startRecordingBtn.style.backgroundColor = "";
    showWord();
  });
  controlsContainer.appendChild(testAgainBtn);
}

function saveQuizResult() {
  const logs = JSON.parse(localStorage.getItem("quizResults") || "[]");
  logs.push({
    mode: "chinese",
    date: new Date().toISOString(),
    total: words.length,
    correct: correctCount,
    wrong: wrongCount
  });
  localStorage.setItem("quizResults", JSON.stringify(logs));
  console.log("Quiz results saved:", localStorage.getItem("quizResults"));
}

/* Initialize quiz: request mic access and load words. */
document.addEventListener("DOMContentLoaded", () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      micStream = stream;
      setupMicStream(stream);
    })
    .catch(err => {
      console.error("Microphone access denied:", err);
      recordingResult.textContent = "⚠️ Microphone access denied";
    });
  loadQuizWords();
});

/* Start Recording button event: Always request a fresh mic stream. */
startRecordingBtn.addEventListener("click", () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      micStream = stream;
      setupMicStream(stream);
      beginRecording();
    })
    .catch(err => {
      console.warn("[mic] Permission denied or unavailable", err);
      recordingResult.textContent = "⚠️ Microphone access denied";
    });
});
