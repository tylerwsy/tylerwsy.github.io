// File: app.js
// NOTE: Requires <script src="https://cdn.jsdelivr.net/npm/pinyin-pro" defer></script> in index.html

const form = document.getElementById("wordForm");
const wordList = document.getElementById("wordList");
const exportCSVBtn = document.getElementById("exportCSVBtn");
const importCSVBtn = document.getElementById("importCSVBtn");
const importCSVInput = document.getElementById("importCSVInput");

let db;
let wordLibrary = [];

const DB_NAME = "SpellingAppDB";
const STORE_NAME = "words";

// Open the IndexedDB database.
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = e => {
      const db = e.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: "english_chinese", autoIncrement: false });
    };
  });
}

async function loadWords() {
  db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  request.onsuccess = () => {
    wordLibrary = request.result;
    renderWords();
  };
}

function renderWords() {
  wordList.innerHTML = "";
  wordLibrary.forEach((word, index) => {
    const row = document.createElement("tr");
    // Create a unique key combining english and chinese.
    row.innerHTML = `
      <td data-field="english">${word.english}</td>
      <td data-field="chinese">${word.chinese}</td>
      <td data-field="pinyin">${word.pinyin}</td>
      <td>
        <button data-index="${index}" class="editBtn">Edit</button>
        <button data-index="${index}" class="deleteBtn">Delete</button>
      </td>
    `;
    wordList.appendChild(row);
  });

  // Attach delete and edit listeners.
  document.querySelectorAll(".deleteBtn").forEach(button => {
    button.addEventListener("click", async e => {
      const index = e.target.getAttribute("data-index");
      const word = wordLibrary[index];
      await deleteWord(word.english + "_" + word.chinese);
      await loadWords();
    });
  });

  document.querySelectorAll(".editBtn").forEach(button => {
    button.addEventListener("click", e => {
      const index = e.target.getAttribute("data-index");
      editWord(index);
    });
  });
}

async function saveWord(word) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  // Key is concatenated as english_chinese
  word.english_chinese = word.english + "_" + word.chinese;
  store.put(word);
  await tx.complete;
}

async function deleteWord(key) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.delete(key);
  await tx.complete;
}

function editWord(index) {
  // Replace the row cells with input elements.
  const row = wordList.children[index];
  const englishCell = row.querySelector('td[data-field="english"]');
  const chineseCell = row.querySelector('td[data-field="chinese"]');
  const pinyinCell = row.querySelector('td[data-field="pinyin"]');
  const actionsCell = row.querySelector("td:last-child");

  // Create input fields
  const englishInput = document.createElement("input");
  englishInput.type = "text";
  englishInput.value = englishCell.textContent;
  
  const chineseInput = document.createElement("input");
  chineseInput.type = "text";
  chineseInput.value = chineseCell.textContent;
  
  // Replace cells with inputs
  englishCell.innerHTML = "";
  englishCell.appendChild(englishInput);
  chineseCell.innerHTML = "";
  chineseCell.appendChild(chineseInput);
  
  // Hide the pinyin cell (it will be regenerated)
  pinyinCell.textContent = "";
  
  // Replace actions with Save and Cancel buttons
  actionsCell.innerHTML = "";
  
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", async () => {
    // Compute new pinyin from the new Chinese
    const newEnglish = englishInput.value.trim();
    const newChinese = chineseInput.value.trim();
    if (!newEnglish || !newChinese) {
      alert("Both fields are required.");
      return;
    }
    // Allow duplicate English if Chinese differs.
    // Check duplicate only if both english and chinese match another entry.
    const duplicate = wordLibrary.some(w => w.english === newEnglish && w.chinese === newChinese && (w.english + "_" + w.chinese !== word.english_chinese));
    if (duplicate) {
      alert("This combination already exists.");
      return;
    }
    const newPinyin = window.pinyinPro.pinyin(newChinese, { toneType: "symbol" });
    const updatedWord = {
      english: newEnglish,
      chinese: newChinese,
      pinyin: newPinyin,
      english_chinese: newEnglish + "_" + newChinese,
    };
    await saveWord(updatedWord);
    await loadWords();
  });
  
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", loadWords);
  
  actionsCell.appendChild(saveBtn);
  actionsCell.appendChild(cancelBtn);
}

// Export CSV from the word library.
function exportCSV() {
  let csvContent = "data:text/csv;charset=utf-8,English,Chinese,Pinyin\n";
  wordLibrary.forEach(word => {
    csvContent += `${word.english},${word.chinese},${word.pinyin}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "word_dictionary.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import CSV file into the word dictionary.
function importCSV(file) {
  const reader = new FileReader();
  reader.onload = async function(e) {
    const csv = e.target.result;
    const lines = csv.split("\n");
    // Assume first line is header.
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const parts = line.split(",");
        if (parts.length >= 3) {
          const english = parts[0].trim();
          const chinese = parts[1].trim();
          const pinyin = parts[2].trim();
          // Only save if the exact combination doesn't exist.
          const duplicate = wordLibrary.some(w => w.english === english && w.chinese === chinese);
          if (!duplicate) {
            await saveWord({ english, chinese, pinyin });
          }
        }
      }
    }
    await loadWords();
  };
  reader.readAsText(file);
}

// Attach CSV export and import events.
exportCSVBtn?.addEventListener("click", exportCSV);
importCSVBtn?.addEventListener("click", () => {
  importCSVInput.click();
});
importCSVInput?.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    importCSV(file);
  }
});

// ---------------------- The remaining part of the script (Speech and Quiz Logic) ----------------------

// (Below is the same speech quiz management code as provided previously.)

// Define the speech quiz known prompt, etc. (Code from your previous script follows)
// — The code below is unchanged from your previous app.js with fuzzy pinyin matching:

// Create a fresh SpeechRecognition instance
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

// Setup media recorder.
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
    postAudioToServer(latestRecordingBlob);
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

function postAudioToServer(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.wav");
  fetch("http://localhost:5000/transcribe", {
    method: "POST",
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      console.log("Transcription from DeepSpeech:", data.transcription);
      recordingResult.textContent += `\nDeepSpeech: ${data.transcription}`;
    })
    .catch(err => console.error(err));
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
            setupMicStream(stream);
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
    setTimeout(() => { createSubmitButton(); }, 200);
  }
}

function createSubmitButton() {
  if (!submitBtn) {
    submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.style.display = "block";
    submitBtn.style.marginTop = "0.5rem";
    submitBtn.addEventListener("click", handleSubmit);
    if (controlsContainer) {
      if (playbackBtn && playbackBtn.parentNode) {
        controlsContainer.insertBefore(submitBtn, playbackBtn.nextSibling);
      } else {
        controlsContainer.appendChild(submitBtn);
      }
    } else {
      quizBox.appendChild(submitBtn);
    }
  } else {
    submitBtn.disabled = false;
  }
}

function handleSubmit() {
  if (!recordedTranscript) {
    recordingResult.textContent += "\nNo speech detected. Please record again.";
    return;
  }
  var combinedQuiz = KNOWN_PROMPT + quizWord.textContent;
  if (!recordedTranscript.startsWith(KNOWN_PROMPT)) {
    recordedTranscript = KNOWN_PROMPT + recordedTranscript;
  }
  // Remove known prompt for display purposes.
  var displayedTranscript = recordedTranscript.replace(KNOWN_PROMPT, "");
  
  // For words from the fourth onward, compare using pinyin only.
  // Convert the full recorded transcript (including known prompt) to pinyin with segmentation.
  var fullTranscriptPinyin = window.pinyinPro.pinyin(convertDigitsToChinese(recordedTranscript), { toneType: "symbol", segment: true });
  // Split into tokens and remove the first three tokens corresponding to the known prompt.
  var tokens = fullTranscriptPinyin.split(" ");
  var transcriptPinyin = tokens.slice(3).join(" ").trim();
  transcriptPinyin = transcriptPinyin.split(" ").map(token => {
    const map = { "0": "líng", "1": "yī", "2": "èr", "3": "sān", "4": "sì", "5": "wǔ", "6": "liù", "7": "qī", "8": "bā", "9": "jiǔ" };
    return map[token] || token;
  }).join(" ");
  // The expected pinyin is the pinyin of the quiz word only (without the known prompt).
  var expectedPinyin = window.pinyinPro.pinyin(convertDigitsToChinese(quizWord.textContent), { toneType: "symbol", segment: true });
  expectedPinyin = expectedPinyin.split(" ").map(token => {
    const map = { "0": "líng", "1": "yī", "2": "èr", "3": "sān", "4": "sì", "5": "wǔ", "6": "liù", "7": "qī", "8": "bā", "9": "jiǔ" };
    return map[token] || token;
  }).join(" ");
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
  if (controlsContainer) {
    controlsContainer.innerHTML = "";
  }
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
  if (controlsContainer) {
    controlsContainer.innerHTML = "";
  }
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

function postAudioToServer(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.wav");
  fetch("http://localhost:5000/transcribe", {
    method: "POST",
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      console.log("Transcription from DeepSpeech:", data.transcription);
      recordingResult.textContent += `\nDeepSpeech: ${data.transcription}`;
    })
    .catch(err => console.error(err));
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
            setupMicStream(stream);
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
    setTimeout(() => { createSubmitButton(); }, 200);
  }
}

loadQuizWords();
