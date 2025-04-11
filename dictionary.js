// File: dictionary.js
// NOTE: Expects pinyin-pro and XLSX libraries loaded via dictionary.html.

const form = document.getElementById("wordForm");
const wordList = document.getElementById("wordList");
const tableHead = document.getElementById("tableHead");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const importExcelBtn = document.getElementById("importExcelBtn");
const importExcelInput = document.getElementById("importExcelInput");
const resetDictionaryBtn = document.getElementById("resetDictionaryBtn");

// No profile selector on this page; retrieve fixed profile from localStorage.
let selectedProfile = localStorage.getItem("selectedProfile") || "boy";

let db;
let dictionary = []; // Array to hold dictionary entries

const DB_NAME = "SpellingAppDB";
const STORE_NAME = "words";

/**
 * normalizeEnglish(english)
 *   Capitalizes the first letter of each word.
 */
function normalizeEnglish(english) {
  return english
    .trim()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * generateCompositeKey(word)
 *   Returns a composite key in the form: normalizedEnglish + "_" + numericTonePinyinOfChinese
 */
function generateCompositeKey(word) {
  const eng = word.english.trim().toLowerCase();
  const chinese = word.chinese.trim();
  // Use numeric tone for key generation and remove spaces.
  const pinyinNumeric = window.pinyinPro.pinyin(chinese, { toneType: "num", segment: true }).replace(/\s+/g, "");
  const key = eng + "_" + pinyinNumeric;
  console.log("Generated composite key:", key);
  return key;
}

/**
 * openDB()
 *   Opens the IndexedDB database; creates the object store with keyPath "english_chinesepinyinnumeric" if needed.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "english_chinesepinyinnumeric" });
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * loadWords()
 *   Loads all dictionary entries from IndexedDB.
 */
async function loadWords() {
  db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  request.onsuccess = () => {
    dictionary = request.result;
    console.log("loadWords: Loaded", dictionary.length, "records.");
    // Sort alphabetically by English (case-insensitive)
    dictionary.sort((a, b) => a.english.toLowerCase().localeCompare(b.english.toLowerCase()));
    renderWords();
  };
  request.onerror = () => console.error("loadWords error:", request.error);
}

/**
 * renderWords()
 *   Rebuilds the table header and rows based on the fixed selectedProfile.
 */
function renderWords() {
  // Build table header dynamically.
  tableHead.innerHTML = `
    <tr>
      <th>English</th>
      <th>Chinese</th>
      <th>Pinyin</th>
      <th>Attempts (${selectedProfile === "boy" ? "Boy" : "Girl"})</th>
      <th>Correct (${selectedProfile === "boy" ? "Boy" : "Girl"})</th>
      <th>Percentage</th>
      <th>Actions</th>
    </tr>
  `;
  
  wordList.innerHTML = "";
  dictionary.forEach((word, index) => {
    const row = document.createElement("tr");
    row.dataset.key = word.english_chinesepinyinnumeric;
    let attempts = selectedProfile === "boy" ? word.attempts_boy : word.attempts_girl;
    let correct = selectedProfile === "boy" ? word.correct_boy : word.correct_girl;
    let percentage = attempts > 0 ? ((correct / attempts) * 100).toFixed(1) + "%" : "-";
    
    row.innerHTML = `
      <td data-field="english">${word.english}</td>
      <td data-field="chinese">${word.chinese}</td>
      <td data-field="pinyin">${word.pinyin}</td>
      <td data-field="attempts">${attempts || 0}</td>
      <td data-field="correct">${correct || 0}</td>
      <td data-field="percentage">${percentage}</td>
      <td>
        <button data-index="${index}" class="interactive-btn editBtn">Edit</button>
        <button data-index="${index}" class="interactive-btn deleteBtn">Delete</button>
      </td>
    `;
    wordList.appendChild(row);
  });
  
  // Attach event listeners for delete and edit actions.
  document.querySelectorAll(".deleteBtn").forEach(button => {
    button.addEventListener("click", async e => {
      const index = e.target.getAttribute("data-index");
      const word = dictionary[index];
      if (word) {
        await deleteWord(word.english_chinesepinyinnumeric);
        await loadWords();
      }
    });
  });
  
  document.querySelectorAll(".editBtn").forEach(button => {
    button.addEventListener("click", e => {
      const index = e.target.getAttribute("data-index");
      editWord(index);
    });
  });
}

/**
 * saveWord(word)
 *   Saves a new or updated record. Generates the pinyin and composite key.
 */
async function saveWord(word) {
  word.english = normalizeEnglish(word.english);
  word.chinese = word.chinese.trim();
  word.pinyin = window.pinyinPro.pinyin(word.chinese, { toneType: "symbol" });
  // Initialize progress fields.
  word.attempts_boy = word.attempts_boy || 0;
  word.correct_boy = word.correct_boy || 0;
  word.attempts_girl = word.attempts_girl || 0;
  word.correct_girl = word.correct_girl || 0;
  word.english_chinesepinyinnumeric = generateCompositeKey(word);
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(word);
  await tx.complete;
}

/**
 * deleteWord(key)
 *   Deletes a record from the store.
 */
async function deleteWord(key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * editWord(index)
 *   Makes a row editable and provides Save/Cancel options.
 */
function editWord(index) {
  const row = wordList.children[index];
  const key = row.dataset.key;
  const englishCell = row.querySelector('td[data-field="english"]');
  const chineseCell = row.querySelector('td[data-field="chinese"]');
  const pinyinCell = row.querySelector('td[data-field="pinyin"]');
  const actionsCell = row.querySelector("td:last-child");
  
  // Create input fields.
  const englishInput = document.createElement("input");
  englishInput.type = "text";
  englishInput.value = englishCell.textContent;
  
  const chineseInput = document.createElement("input");
  chineseInput.type = "text";
  chineseInput.value = chineseCell.textContent;
  
  englishCell.innerHTML = "";
  englishCell.appendChild(englishInput);
  chineseCell.innerHTML = "";
  chineseCell.appendChild(chineseInput);
  pinyinCell.textContent = "";
  
  actionsCell.innerHTML = "";
  // Save button.
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.classList.add("interactive-btn");
  saveBtn.addEventListener("click", async () => {
    const newEnglish = englishInput.value.trim();
    const newChinese = chineseInput.value.trim();
    if (!newEnglish || !newChinese) {
      alert("Both fields are required.");
      return;
    }
    if (dictionary.some(w => w.english.toLowerCase() === newEnglish.toLowerCase() &&
        w.chinese === newChinese &&
        w.english_chinesepinyinnumeric !== key)) {
      alert("This combination already exists.");
      return;
    }
    const newPinyin = window.pinyinPro.pinyin(newChinese, { toneType: "symbol" });
    let oldRecord = dictionary.find(w => w.english_chinesepinyinnumeric === key) || {};
    const updatedWord = {
      english: newEnglish,
      chinese: newChinese,
      pinyin: newPinyin,
      attempts_boy: oldRecord.attempts_boy || 0,
      correct_boy: oldRecord.correct_boy || 0,
      attempts_girl: oldRecord.attempts_girl || 0,
      correct_girl: oldRecord.correct_girl || 0,
    };
    updatedWord.english_chinesepinyinnumeric = generateCompositeKey(updatedWord);
    await updateWord(updatedWord);
    await loadWords();
  });
  
  // Cancel button.
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.classList.add("interactive-btn");
  cancelBtn.addEventListener("click", loadWords);
  
  actionsCell.appendChild(saveBtn);
  actionsCell.appendChild(cancelBtn);
}

/**
 * updateWord(word)
 *   Updates an existing record in IndexedDB.
 */
async function updateWord(word) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(word);
  await tx.complete;
}

/**
 * Form submission: Adds a new word.
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let english = document.getElementById("englishInput").value;
  let chinese = document.getElementById("chineseInput").value;
  if (!english || !chinese) return;
  if (dictionary.some(w => w.english.toLowerCase() === english.trim().toLowerCase() && w.chinese === chinese.trim())) {
    alert("Duplicate word combination exists.");
    return;
  }
  const pinyin = window.pinyinPro.pinyin(chinese, { toneType: "symbol" });
  const newWord = { 
    english, 
    chinese, 
    pinyin, 
    attempts_boy: 0,
    correct_boy: 0,
    attempts_girl: 0,
    correct_girl: 0
  };
  try {
    await saveWord(newWord);
  } catch (error) {
    console.error("Error saving word:", error);
  }
  await loadWords();
  form.reset();
});

/**
 * Excel Export: Exports dictionary to an Excel file (.xlsx) with only English & Chinese.
 */
function exportExcel() {
  let data = [["English", "Chinese"]];
  dictionary.forEach(word => {
    data.push([word.english, word.chinese]);
  });
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dictionary");
  XLSX.writeFile(wb, "word_dictionary.xlsx");
}

/**
 * Excel Import: Imports words from an Excel file that has only English & Chinese columns.
 * Pinyin is regenerated, and progress fields are set to 0.
 */
function importExcel(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("Excel Import: Read", rows.length - 1, "data rows.");
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length >= 2) {
        const english = normalizeEnglish(row[0].toString());
        const chinese = row[1].toString().trim();
        if (!english || !chinese) continue;
        if (dictionary.some(w => w.english.toLowerCase() === english.toLowerCase() && w.chinese === chinese)) {
          console.log("Excel Import: Duplicate found for", english, chinese, "– skipping");
          continue;
        }
        const pinyin = window.pinyinPro.pinyin(chinese, { toneType: "symbol" });
        saveWord({ 
          english, 
          chinese, 
          pinyin, 
          attempts_boy: 0,
          correct_boy: 0,
          attempts_girl: 0,
          correct_girl: 0
        });
      }
    }
    setTimeout(loadWords, 500);
  };
  reader.readAsArrayBuffer(file);
}

exportExcelBtn?.addEventListener("click", exportExcel);
importExcelBtn?.addEventListener("click", () => { importExcelInput.click(); });
importExcelInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    importExcel(file);
  }
});

if (resetDictionaryBtn) {
  resetDictionaryBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to reset the entire dictionary? This will remove all words.")) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
      });
      await loadWords();
    }
  });
}

window.addEventListener("DOMContentLoaded", loadWords);
