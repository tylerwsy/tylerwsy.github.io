// File: dictionary.js
// NOTE: This file expects that pinyin-pro and XLSX libraries are loaded as shown in dictionary.html

const form = document.getElementById("wordForm");
const wordList = document.getElementById("wordList");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const importExcelBtn = document.getElementById("importExcelBtn");
const importExcelInput = document.getElementById("importExcelInput");
const resetDictionaryBtn = document.getElementById("resetDictionaryBtn");

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
 *   Returns a composite key in the form:
 *       normalizedEnglish + "_" + numeric-tone-pinyin-of-Chinese
 *   Example: "father_fu4qin1"
 */
function generateCompositeKey(word) {
  const eng = word.english.trim().toLowerCase();
  const chinese = word.chinese.trim();
  const pinyinNumeric = window.pinyinPro.pinyin(chinese, { toneType: "num", segment: true }).replace(/\s+/g, "");
  const key = eng + "_" + pinyinNumeric;
  console.log("Generated composite key:", key);
  return key;
}

/**
 * openDB()
 *   Opens the IndexedDB database; creates the "words" object store with keyPath "english_chinesepinyinnumeric"
 *   if it does not exist.
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
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * loadWords()
 *   Loads all dictionary entries from IndexedDB and sorts them alphabetically by English.
 */
async function loadWords() {
  db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  request.onsuccess = () => {
    dictionary = request.result;
    console.log("loadWords: Loaded", dictionary.length, "records.");
    dictionary.sort((a, b) => a.english.toLowerCase().localeCompare(b.english.toLowerCase()));
    renderWords();
  };
  request.onerror = () => console.error("loadWords error:", request.error);
}

/**
 * renderWords()
 *   Renders the dictionary entries in the table.
 */
function renderWords() {
  wordList.innerHTML = "";
  dictionary.forEach((word, index) => {
    const row = document.createElement("tr");
    // Use composite key as a data attribute.
    row.dataset.key = word.english_chinesepinyinnumeric;
    row.innerHTML = `
      <td data-field="english">${word.english}</td>
      <td data-field="chinese">${word.chinese}</td>
      <td data-field="pinyin">${word.pinyin}</td>
      <td data-field="attempts_boy">${word.attempts_boy || 0}</td>
      <td data-field="correct_boy">${word.correct_boy || 0}</td>
      <td data-field="attempts_girl">${word.attempts_girl || 0}</td>
      <td data-field="correct_girl">${word.correct_girl || 0}</td>
      <td>
        <button data-index="${index}" class="editBtn">Edit</button>
        <button data-index="${index}" class="deleteBtn">Delete</button>
      </td>
    `;
    wordList.appendChild(row);
  });
  
  // Attach event listeners.
  document.querySelectorAll(".deleteBtn").forEach(button => {
    button.addEventListener("click", async (e) => {
      const index = e.target.getAttribute("data-index");
      const word = dictionary[index];
      if(word) {
        const key = word.english_chinesepinyinnumeric;
        await deleteWord(key);
        await loadWords();
      }
    });
  });
  
  document.querySelectorAll(".editBtn").forEach(button => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      editWord(index);
    });
  });
}

/**
 * saveWord(word)
 *   Saves a new word entry to IndexedDB. When a word is added manually or via Excel import,
 *   its pinyin is generated automatically. Progress fields are initialized to 0.
 */
async function saveWord(word) {
  word.english = normalizeEnglish(word.english);
  word.chinese = word.chinese.trim();
  word.pinyin = window.pinyinPro.pinyin(word.chinese, { toneType: "symbol" });
  // Initialize progress tracking fields if not provided.
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
 *   Deletes a dictionary entry by composite key.
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
 *   Allows user to edit the English and Chinese fields of a record.
 */
function editWord(index) {
  const row = wordList.children[index];
  const key = row.dataset.key;
  const englishCell = row.querySelector('td[data-field="english"]');
  const chineseCell = row.querySelector('td[data-field="chinese"]');
  const pinyinCell = row.querySelector('td[data-field="pinyin"]');
  const attemptsBoyCell = row.querySelector('td[data-field="attempts_boy"]');
  const correctBoyCell = row.querySelector('td[data-field="correct_boy"]');
  const attemptsGirlCell = row.querySelector('td[data-field="attempts_girl"]');
  const correctGirlCell = row.querySelector('td[data-field="correct_girl"]');
  const actionsCell = row.querySelector("td:last-child");
  
  // Create input fields for English and Chinese. (Progress fields remain read-only.)
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
  // pinyin and progress will be regenerated
  pinyinCell.textContent = "";
  
  actionsCell.innerHTML = "";
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", async () => {
    const newEnglish = englishInput.value.trim();
    const newChinese = chineseInput.value.trim();
    if (!newEnglish || !newChinese) {
      alert("Both fields are required.");
      return;
    }
    // Prevent duplicates: skip if there is another entry with same English and Chinese.
    if (dictionary.some(w => w.english.toLowerCase() === newEnglish.toLowerCase() && w.chinese === newChinese && w.english_chinesepinyinnumeric !== key)) {
      alert("This combination already exists.");
      return;
    }
    const newPinyin = window.pinyinPro.pinyin(newChinese, { toneType: "symbol" });
    // Keep progress values as they were.
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
  
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", loadWords);
  
  actionsCell.appendChild(saveBtn);
  actionsCell.appendChild(cancelBtn);
}

/**
 * updateWord(word)
 *   Updates an existing dictionary entry.
 */
async function updateWord(word) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(word);
  await tx.complete;
}

/**
 * Form submission handler: Add a new word to the dictionary.
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let english = document.getElementById("englishInput").value;
  let chinese = document.getElementById("chineseInput").value;
  if (!english || !chinese) return;
  // Check for duplicates: Only if both English and Chinese exactly match an entry.
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
 * Excel Export:
 *   Exports the dictionary to an Excel file (.xlsx) containing only the English and Chinese columns.
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
 * Excel Import:
 *   Imports words from an Excel file. Expects only English and Chinese columns.
 *   Pinyin is regenerated, and progress fields are initialized to 0.
 */
function importExcel(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Convert worksheet to an array of arrays.
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("Excel Import: Read", rows.length - 1, "data rows.");
    // Assume the first row is header.
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
