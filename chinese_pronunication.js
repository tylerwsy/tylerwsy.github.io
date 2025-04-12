/* chinese_proununication.js */

// Helper function: Convert digits (0-9) to Chinese characters.
function convertDigitsToChinese(str) {
  const digitMap = {
    "0": "零", "1": "一", "2": "二", "3": "三", "4": "四",
    "5": "五", "6": "六", "7": "七", "8": "八", "9": "九"
  };
  return str.replace(/\d/g, match => digitMap[match]);
}

/**
 * Remove trailing punctuation from a string.
 * Returns an empty string if input is falsy.
 * @param {string} str - The string to process.
 * @returns {string} - The processed string.
 */
function removeTrailingPunctuation(str) {
  if (!str) return "";
  str = str.trim();
  if (str.length > 0 && "。！？".includes(str.slice(-1))) {
    return str.slice(0, -1);
  }
  return str;
}

// Global variables.
let words = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;

// This global will store the final transcript.
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

// Unified button grouping for dynamic controls.
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

// =====================
// Secure Azure Token Functions using Render Backend
// =====================
function fetchAzureToken(callback) {
  fetch("https://azure-backend-7n4i.onrender.com/api/token", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (callback) callback(null, data);
    })
    .catch(err => {
      console.error("[azure] Failed to fetch token:", err);
      if (callback) callback(err);
    });
}

// =====================
// Continuous Azure Speech Recognition & Text-to-Speech Functions
// =====================

/**
 * Uses Azure Speech SDK to perform continuous speech-to-text recognition.
 * Listens for a fixed period (4 seconds) then stops.
 * Uses a secure token fetched from Render.
 * @param {function} callback - Called with the final transcript.
 */
function azureSpeechRecognizeContinuous(callback) {
  if (typeof SpeechSDK === "undefined") {
    console.error("Azure Speech SDK not found. Please include the SDK script in your HTML.");
    return;
  }
  
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(newStream => {
      fetchAzureToken((err, data) => {
        if (err) {
          recordingResult.textContent += "\nFailed to get speech token.";
          newStream.getTracks().forEach(track => track.stop());
          return;
        }
        const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(newStream);
        const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(data.token, data.region);
        speechConfig.speechRecognitionLanguage = "zh-CN";
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
        
        let interimTranscript = "";
        
        // Capture interim results.
        recognizer.recognizing = (s, e) => {
          interimTranscript = removeTrailingPunctuation(e.result.text);
          console.log("[azure] Recognizing (interim):", interimTranscript);
        };
        
        // Capture the final recognized text.
        recognizer.recognized = (s, e) => {
          if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            interimTranscript = removeTrailingPunctuation(e.result.text);
            console.log("[azure] Recognized (final):", interimTranscript);
          }
        };
        
        recognizer.canceled = (s, e) => {
          console.error("[azure] Recognition canceled:", e.errorDetails);
        };
        
        recognizer.sessionStopped = (s, e) => {
          console.log("[azure] Session stopped");
          newStream.getTracks().forEach(track => track.stop());
          if (callback) callback(interimTranscript);
        };
        
        recognizer.startContinuousRecognitionAsync();
        
        // Stop recognition after 4 seconds.
        setTimeout(() => {
          recognizer.stopContinuousRecognitionAsync(() => {
            console.log("[azure] Stopped continuous recognition. Final transcript:", interimTranscript);
            if (callback) callback(interimTranscript);
          });
        }, 4000);
      });
    })
    .catch(err => {
      console.error("Error obtaining microphone stream:", err);
      recordingResult.textContent += "\nFailed to get microphone stream.";
    });
}

/**
 * Uses Azure Speech SDK to perform text-to-speech synthesis.
 * Uses a secure token fetched from Render.
 * @param {string} text - The text to synthesize.
 * @param {function} [callback] - Optional callback.
 */
function azureTextToSpeech(text, callback) {
  if (typeof SpeechSDK === "undefined") {
    console.error("Azure Speech SDK not found.");
    return;
  }
  console.log("Starting Azure TTS for text:", text);
  fetchAzureToken((err, data) => {
    if (err) {
      if (callback) callback(err);
      return;
    }
    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(data.token, data.region);
    speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoxiaoNeural";
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.synthesisStarted = (s, e) => { console.log("Azure TTS synthesis started."); };
    synthesizer.synthesisCompleted = (s, e) => { console.log("Azure TTS synthesis completed."); };
    synthesizer.synthesisCanceled = (s, e) => { console.warn("Azure TTS synthesis canceled:", e.errorDetails); };

    synthesizer.speakTextAsync(text,
      result => {
        console.log("Azure TTS succeeded:", result);
        synthesizer.close();
        if (callback) callback(null, result);
      },
      error => {
        console.error("Azure TTS error:", error);
        synthesizer.close();
        if (callback) callback(error);
      }
    );
  });
}

// =====================
// IndexedDB & Quiz Word Loading
// =====================
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
        quizBox.innerHTML = "<p>No Chinese words available. Please add words via the dictionary page.</p>";
      } else {
        showWord();
      }
    };
    request.onerror = () => console.error("Error loading dictionary words:", request.error);
  } catch (err) {
    console.error("Error opening DB:", err);
  }
}

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

/* --- Display Quiz Word and Hints --- */
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
    // Remove any previous correct playback buttons.
    document.querySelectorAll(".correct-btn").forEach(btn => btn.remove());
  }
}

/* --- Fuzzy Matching Helper --- */
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

/* --- Live Recognition and Submission --- */
/**
 * Begins live recognition using continuous Azure Speech-to-Text.
 * Implements the following timing:
 *  - Waits 1 second after clicking "Start Recording"/"Retry" before updating to "Speak now..."
 *  - Then starts a 4-second recording window.
 *  - If no valid transcript is captured after 6 seconds (1 sec delay + 4 sec recording + extra 1 sec), shows timeout.
 */
function beginLiveRecognition() {
  // Immediately clear any default text.
  recordingResult.textContent = "";
  
  // Wait 1 second before updating the message and starting recognition.
  setTimeout(() => {
    recordingResult.textContent = "🎙️ Speak now...";
    countdownDisplay.textContent = "⏺️ Recording (4 sec)...";
    startRecordingBtn.textContent = "Recording...";
    
    // Set a timeout for 6 seconds (i.e. 1 sec delay + 4 sec recording + 1 sec extra).
    const timeoutHandle = setTimeout(() => {
      if (!recordedTranscript) {
        startRecordingBtn.textContent = "Retry";
        countdownDisplay.textContent = "";
        recordingResult.textContent = "Recognition timed out. Please try again.";
      }
    }, 6000);
    
    // Start continuous recognition.
    azureSpeechRecognizeContinuous((finalTranscript) => {
      clearTimeout(timeoutHandle);
      recordedTranscript = finalTranscript;
      if (recordedTranscript && recordedTranscript.length > 0) {
        recordingResult.textContent = `🔈 You said: ${recordedTranscript}`;
      } else {
        recordingResult.textContent = "No speech detected.";
      }
      createSubmitButton();
      startRecordingBtn.textContent = "Retry";
      countdownDisplay.textContent = "";
    });
  }, 1000);
}

/**
 * Creates the Submit button after recognition completes.
 */
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

/**
 * Handles submission by fuzzy-comparing the pinyin of the quiz word and the recognized transcript.
 */
async function handleSubmit() {
  console.log("handleSubmit triggered.");
  if (!recordedTranscript) {
    recordingResult.textContent += "\nNo speech detected. Please try again.";
    return;
  }
  const expectedPinyin = removeTrailingPunctuation(window.pinyinPro.pinyin(quizWord.textContent, { toneType: "symbol", segment: true }));
  const recognizedPinyin = removeTrailingPunctuation(window.pinyinPro.pinyin(recordedTranscript, { toneType: "symbol", segment: true }));
  console.log("Quiz word pinyin:", expectedPinyin);
  console.log("Recognized pinyin:", recognizedPinyin);
  
  const distance = levenshteinDistance(recognizedPinyin, expectedPinyin);
  const threshold = Math.floor(expectedPinyin.length * 0.3);
  let isCorrect = (distance <= threshold);
  if (isCorrect) {
    recordingResult.textContent += "\nResult: ✅ Correct (fuzzy match)";
    correctCount++;
  } else {
    recordingResult.textContent += "\nResult: ❌ Wrong";
    recordingResult.textContent += "\nExpected (pinyin): " + expectedPinyin;
    recordingResult.textContent += "\nGot (pinyin): " + recognizedPinyin;
    wrongCount++;
    createCorrectPlaybackButton();
  }
  submitBtn.disabled = true;
  submitBtn.style.backgroundColor = "grey";
  startRecordingBtn.disabled = true;
  startRecordingBtn.style.backgroundColor = "grey";
  await updateWordRecord(words[currentIndex], isCorrect);
  createNextButton();
}

/**
 * Creates the "Play Correct Word" button using Azure TTS.
 */
function createCorrectPlaybackButton() {
  console.log("Attempting to create Play Correct Word button. Quiz word:", quizWord.textContent);
  if (!document.querySelector(".correct-btn") && quizWord.textContent.trim().length > 0) {
    let correctBtn = document.createElement("button");
    correctBtn.textContent = "Play Correct Word";
    correctBtn.classList.add("interactive-btn", "correct-btn");
    correctBtn.style.marginLeft = "auto";
    correctBtn.style.display = "block";
    recordingResult.parentNode.insertBefore(correctBtn, recordingResult.nextSibling);
    console.log("Play Correct Word button created.");
    correctBtn.addEventListener("click", () => {
      console.log("Play Correct Word button clicked.");
      azureTextToSpeech(quizWord.textContent, (error) => {
        if (error) {
          console.error("Azure TTS callback error:", error);
        } else {
          console.log("Azure TTS callback completed successfully.");
        }
      });
    });
  } else {
    console.log("Play Correct Word button not created. Either it exists already or quiz word text is empty:", quizWord.textContent);
  }
}

/**
 * Creates the Next button to proceed to the following quiz word.
 */
function createNextButton() {
  const existingNext = document.querySelector("#controlsContainer button.next-btn");
  if (existingNext) { existingNext.remove(); }
  nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.classList.add("interactive-btn", "next-btn");
  ensureButtonGroup().row2.appendChild(nextBtn);
  nextBtn.addEventListener("click", nextWord);
}

/**
 * Proceeds to the next quiz word or displays the final test results.
 */
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
  if (currentIndex < words.length) {
    showWord();
  } else {
    testCompleted();
  }
}

/**
 * Displays the final test results.
 */
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

/**
 * Saves the quiz result to localStorage.
 */
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

/* --- Initialization --- */
document.addEventListener("DOMContentLoaded", () => {
  loadQuizWords();
});

/* When the Start Recording button is clicked, clear previous messages and begin continuous recognition after a 1-second delay. */
startRecordingBtn.addEventListener("click", () => {
  recordedTranscript = "";
  recordingResult.textContent = ""; // Clear any default text immediately.
  beginLiveRecognition();
});
