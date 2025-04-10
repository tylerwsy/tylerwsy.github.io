// Define the known prompt as a constant:
const KNOWN_PROMPT = "答案是";

// Helper function to convert digits (0-9) into Chinese characters.
function convertDigitsToChinese(str) {
  const digitMap = { "0": "零", "1": "一", "2": "二", "3": "三", "4": "四", "5": "五", "6": "六", "7": "七", "8": "八", "9": "九" };
  return str.replace(/\d/g, match => digitMap[match]);
}

// ---------------------- Global Variables ----------------------
var db;
var words = [];      // Array of quiz words (loaded from IndexedDB)
var currentIndex = 0;
var correctCount = 0;
var wrongCount = 0;

var quizWord = document.getElementById("quizWord");
var scoreText = document.getElementById("scoreText");
var resultBox = document.getElementById("resultBox");
var quizBox = document.getElementById("quizBox");
var controlsContainer = document.getElementById("controlsContainer");

var pinyinHintBtn = document.getElementById("pinyinHintBtn");
var englishHintBtn = document.getElementById("englishHintBtn");
var startRecordingBtn = document.getElementById("startRecordingBtn");
var recordingResult = document.getElementById("recordingResult");
var countdownDisplay = document.getElementById("countdownDisplay");

var audioContext, analyser, micStream, dataArray;
var mediaRecorder = null;      // Reinitialized per recording session
var recordedChunks = [];       // Holds audio chunks
var latestRecordingBlob = null;// Holds the blob of the last recording
var playbackBtn = null;        // Button to play the recorded audio

var recordedTranscript = "";
var submitBtn = null;          // Created dynamically after recording stops
var nextBtn = null;

var micRequestInProgress = false;
var isRecording = false;
var pinyinShown = false;
var englishShown = false;

// ---------------------- Levenshtein Distance Function ----------------------
function levenshteinDistance(a, b) {
  const matrix = [];
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ---------------------- IndexedDB Functions ----------------------
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SpellingAppDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("words")) {
        db.createObjectStore("words", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadQuizWords() {
  db = await openDB();
  const tx = db.transaction("words", "readonly");
  const store = tx.objectStore("words");
  const request = store.getAll();
  request.onsuccess = () => {
    console.log("[DB] Loaded words:", request.result);
    if (!request.result.length) {
      quizWord.textContent = "⚠️ No words found in library";
      return;
    }
    words = shuffle(request.result);
    showWord();
  };
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ---------------------- TTS Function ----------------------
function speak(text, lang = "zh-CN") {
  if (lang === "zh-CN") {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    audio.play();
  } else {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  }
}

// ---------------------- Display Quiz Word & Update Question Counter ----------------------
function showWord() {
  const questionCountElem = document.getElementById("questionCount");
  if (questionCountElem) {
    questionCountElem.textContent = `Question ${currentIndex + 1} of ${words.length}`;
  }
  if (currentIndex >= words.length) {
    testCompleted();
    return;
  }
  var word = words[currentIndex];
  quizWord.textContent = word.chinese;
  document.getElementById("pinyinHint").textContent = word.pinyin;
  document.getElementById("englishHint").textContent = word.english;
  document.getElementById("pinyinHint").style.display = "none";
  document.getElementById("englishHint").style.display = "none";
  pinyinShown = false;
  englishShown = false;
  recordedTranscript = "";
  recordingResult.textContent = "";
  startRecordingBtn.textContent = "Start Recording";
  if (controlsContainer) { controlsContainer.innerHTML = ""; }
  playbackBtn = null;
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
}

// ---------------------- Hint Buttons ----------------------
pinyinHintBtn?.addEventListener("click", () => {
  const hint = document.getElementById("pinyinHint");
  if (!pinyinShown) {
    hint.style.display = "block";
    pinyinShown = true;
  }
});

englishHintBtn?.addEventListener("click", () => {
  const hint = document.getElementById("englishHint");
  if (!englishShown) {
    hint.style.display = "block";
    englishShown = true;
  } else {
    speak(hint.textContent, "en-US");
  }
});

// ---------------------- Speech Recognition & Recording Setup ----------------------
function createRecognitionInstance() {
  let recog = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recog.onstart = () => console.log("[speech] onstart triggered");
  recog.onerror = e => console.warn("[speech] onerror", e);
  recog.onend = () => { console.log("[speech] onend triggered"); };
  recog.lang = "zh-CN";
  recog.continuous = false;
  recog.interimResults = false;
  recog.onresult = event => {
    recordedTranscript = event.results[0][0].transcript.trim();
    console.log("[speech] Transcript:", recordedTranscript);
    recordingResult.textContent = `🔈 You said: ${recordedTranscript}`;
  };
  return recog;
}

function setupMediaRecorder(stream) {
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  mediaRecorder.onstop = () => {
    latestRecordingBlob = new Blob(recordedChunks, { type: "audio/webm" });
    updatePlaybackButton(latestRecordingBlob);
    recordedChunks = [];
    mediaRecorder = null;
  };
}

function updatePlaybackButton(blob) {
  const audioUrl = URL.createObjectURL(blob);
  if (!playbackBtn) {
    playbackBtn = document.createElement("button");
    playbackBtn.textContent = "Play Recorded Audio";
    playbackBtn.style.display = "block";
    playbackBtn.style.marginTop = "0.5rem";
    playbackBtn.addEventListener("click", () => {
      const audio = new Audio(audioUrl);
      audio.play();
    });
    if (controlsContainer) {
      controlsContainer.appendChild(playbackBtn);
    } else {
      quizBox.appendChild(playbackBtn);
    }
  } else {
    playbackBtn.onclick = () => {
      const audio = new Audio(audioUrl);
      audio.play();
    };
  }
}

// ---------------------- Recording Controls ----------------------
startRecordingBtn?.addEventListener("click", () => {
  if (!isRecording) {
    if (!micStream) {
      if (!micRequestInProgress) {
        micRequestInProgress = true;
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(stream => {
            micStream = stream;
            setupMediaRecorder(stream);
            micRequestInProgress = false;
            beginRecording();
          })
          .catch(err => {
            micRequestInProgress = false;
            console.warn("[mic] Permission denied or unavailable", err);
            recordingResult.textContent = "⚠️ Microphone access denied";
          });
      }
    } else {
      beginRecording();
    }
  } else {
    console.log("[recording] Already recording.");
  }
});

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
  // Remove any existing submit or next buttons.
  if (submitBtn && submitBtn.parentNode) {
    submitBtn.parentNode.removeChild(submitBtn);
    submitBtn = null;
  }
  if (nextBtn && nextBtn.parentNode) {
    nextBtn.parentNode.removeChild(nextBtn);
    nextBtn = null;
  }
  if (playbackBtn && playbackBtn.parentNode) {
    playbackBtn.parentNode.removeChild(playbackBtn);
    playbackBtn = null;
  }
  if (controlsContainer) {
    controlsContainer.innerHTML = "";
  }
  setupMediaRecorder(micStream);
  var recognition = createRecognitionInstance();
  recordingResult.textContent = "🎙️ Speak now...";
  countdownDisplay.textContent = "⏺️ Recording (6 sec)...";
  startRecordingBtn.textContent = "Recording...";
  mediaRecorder.start();
  isRecording = true;
  recognition.start();
  console.log("[recording] Started");
  setTimeout(() => {
    stopRecording(recognition);
    console.log("[recording] Auto-stopped after 6 seconds");
  }, 6000);
}

function stopRecording(recognitionInstance) {
  if (isRecording) {
    recognitionInstance.stop();
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    isRecording = false;
    startRecordingBtn.textContent = "Retry";
    countdownDisplay.textContent = "";
    console.log("[recording] Stopped");
    setTimeout(createSubmitButton, 200);
  }
}

// ---------------------- Create Submit Button ----------------------
// Ensure that this function is declared so it can be called from stopRecording().
function createSubmitButton() {
  if (!submitBtn) {
    submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.style.display = "block";
    submitBtn.style.marginTop = "0.5rem";
    submitBtn.addEventListener("click", handleSubmit);
    console.log("Submit button created and event listener attached.");
    if (controlsContainer) {
      controlsContainer.appendChild(submitBtn);
    } else {
      quizBox.appendChild(submitBtn);
    }
  } else {
    submitBtn.disabled = false;
    console.log("Submit button re-enabled.");
  }
}

/**
 * handleSubmit()
 * Evaluates the recorded response by comparing its pinyin with the expected pinyin.
 */
function handleSubmit() {
  console.log("handleSubmit triggered.");
  if (!recordedTranscript) {
    recordingResult.textContent += "\nNo speech detected. Please record again.";
    return;
  }
  if (!quizWord || !quizWord.textContent) {
    console.error("handleSubmit: quizWord or its textContent is undefined.");
    return;
  }
  var displayedTranscript = recordedTranscript.replace(KNOWN_PROMPT, "");
  
  console.log("DEBUG: recordedTranscript =", recordedTranscript);
  var fullTranscriptPinyin = window.pinyinPro.pinyin(convertDigitsToChinese(recordedTranscript), {
    toneType: "symbol",
    segment: true,
  });
  var tokens = fullTranscriptPinyin.split(" ");
  var transcriptPinyin = tokens.slice(3).join(" ").trim();
  transcriptPinyin = transcriptPinyin.split(" ").map(token => {
    const map = { "0": "líng", "1": "yī", "2": "èr", "3": "sān", "4": "sì", "5": "wǔ", "6": "liù", "7": "qī", "8": "bā", "9": "jiǔ" };
    return map[token] || token;
  }).join(" ");
  
  var expectedPinyin = window.pinyinPro.pinyin(convertDigitsToChinese(quizWord.textContent), {
    toneType: "symbol",
    segment: true,
  });
  expectedPinyin = expectedPinyin.split(" ").map(token => {
    const map = { "0": "líng", "1": "yī", "2": "èr", "3": "sān", "4": "sì", "5": "wǔ", "6": "liù", "7": "qī", "8": "bā", "9": "jiǔ" };
    return map[token] || token;
  }).join(" ");
  
  console.log("Expected pinyin:", expectedPinyin);
  console.log("Transcript pinyin:", transcriptPinyin);
  
  var distance = levenshteinDistance(transcriptPinyin, expectedPinyin);
  var threshold = Math.floor(expectedPinyin.length * 0.3);
  if (distance <= threshold) {
    recordingResult.textContent += "\nResult: ✅ Correct (fuzzy match)";
    correctCount++;
  } else {
    recordingResult.textContent += "\nResult: ❌ Wrong";
    recordingResult.textContent += "\nExpected (pinyin): " + expectedPinyin;
    recordingResult.textContent += "\nGot (pinyin): " + transcriptPinyin;
    wrongCount++;
    createCorrectPlaybackButton();
  }
  submitBtn.disabled = true;
  startRecordingBtn.disabled = true;
  createNextButton();
}

function createCorrectPlaybackButton() {
  let correctBtn = document.createElement("button");
  correctBtn.textContent = "Play Correct Word";
  correctBtn.style.display = "inline-block";
  correctBtn.style.marginLeft = "1rem";
  recordingResult.appendChild(correctBtn);
  correctBtn.addEventListener("click", () => {
    speak(quizWord.textContent, "zh-CN");
  });
}

function createNextButton() {
  if (!nextBtn) {
    nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.style.display = "block";
    nextBtn.style.marginTop = "0.5rem";
    nextBtn.addEventListener("click", nextWord);
    if (controlsContainer) {
      controlsContainer.appendChild(nextBtn);
    } else {
      quizBox.appendChild(nextBtn);
    }
  } else {
    nextBtn.disabled = false;
  }
}

function nextWord() {
  currentIndex++;
  if (submitBtn && submitBtn.parentNode) {
    submitBtn.parentNode.removeChild(submitBtn);
    submitBtn = null;
  }
  if (nextBtn && nextBtn.parentNode) {
    nextBtn.parentNode.removeChild(nextBtn);
    nextBtn = null;
  }
  recordedTranscript = "";
  recordingResult.textContent = "";
  startRecordingBtn.textContent = "Start Recording";
  startRecordingBtn.disabled = false;
  if (controlsContainer) { controlsContainer.innerHTML = ""; }
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
  if (controlsContainer) { controlsContainer.innerHTML = ""; }
  var testAgainBtn = document.createElement("button");
  testAgainBtn.textContent = "Test Again";
  testAgainBtn.style.display = "block";
  testAgainBtn.style.marginTop = "0.5rem";
  testAgainBtn.addEventListener("click", () => {
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    resultBox.style.display = "none";
    quizBox.style.display = "block";
    showWord();
  });
  if (controlsContainer) {
    controlsContainer.appendChild(testAgainBtn);
  } else {
    quizBox.appendChild(testAgainBtn);
  }
}

startRecordingBtn?.addEventListener("click", () => {
  if (!isRecording) {
    if (!micStream) {
      if (!micRequestInProgress) {
        micRequestInProgress = true;
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(stream => {
            micStream = stream;
            setupMediaRecorder(stream);
            micRequestInProgress = false;
            beginRecording();
          })
          .catch(err => {
            micRequestInProgress = false;
            console.warn("[mic] Permission denied or unavailable", err);
            recordingResult.textContent = "⚠️ Microphone access denied";
          });
      }
    } else {
      beginRecording();
    }
  } else {
    console.log("[recording] Already recording.");
  }
});

function beginRecording() {
  recordedChunks = [];
  latestRecordingBlob = null;
  recordedTranscript = "";
  recordingResult.textContent = "";
  if (submitBtn && submitBtn.parentNode) {
    submitBtn.parentNode.removeChild(submitBtn);
    submitBtn = null;
  }
  if (nextBtn && nextBtn.parentNode) {
    nextBtn.parentNode.removeChild(nextBtn);
    nextBtn = null;
  }
  if (playbackBtn && playbackBtn.parentNode) {
    playbackBtn.parentNode.removeChild(playbackBtn);
    playbackBtn = null;
  }
  if (controlsContainer) {
    controlsContainer.innerHTML = "";
  }
  setupMediaRecorder(micStream);
  var recognition = createRecognitionInstance();
  recordingResult.textContent = "🎙️ Speak now...";
  countdownDisplay.textContent = "⏺️ Recording (6 sec)...";
  startRecordingBtn.textContent = "Recording...";
  mediaRecorder.start();
  isRecording = true;
  recognition.start();
  console.log("[recording] Started");
  setTimeout(() => {
    stopRecording(recognition);
    console.log("[recording] Auto-stopped after 6 seconds");
  }, 6000);
}

function stopRecording(recognitionInstance) {
  if (isRecording) {
    recognitionInstance.stop();
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    isRecording = false;
    startRecordingBtn.textContent = "Retry";
    countdownDisplay.textContent = "";
    console.log("[recording] Stopped");
    setTimeout(createSubmitButton, 200);
  }
}

loadQuizWords();
