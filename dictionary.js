// File: dictionary.js
// NOTE: Ensure index.html includes:
//    <script src="https://cdn.jsdelivr.net/npm/pinyin-pro" defer></script>
//    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" defer></script>

const form = document.getElementById("wordForm");
const wordList = document.getElementById("wordList");
const resetDictionaryBtn = document.getElementById("resetDictionaryBtn");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const importExcelBtn = document.getElementById("importExcelBtn");
const importExcelInput = document.getElementById("importExcelInput");

let db;
let wordLibrary = [];

const DB_NAME = "SpellingAppDB";
const STORE_NAME = "words";

/**
 * normalizeEnglish(english)
 * Returns a string with each word's first letter capitalized.
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
 * Returns a composite key in the form:
 *   normalized(english)_pinyinOfChineseNumeric
 *
 * For example, for english "Father" and Chinese "父亲" the key could be:
 *   "father_fu4qin1"
 */
function generateCompositeKey(word) {
  const eng = word.english.trim().toLowerCase();
  const chinese = word.chinese.trim();
  // Use pinyin-pro with numeric tones and segmentation; remove all spaces.
  const pinyinNumeric = window.pinyinPro.pinyin(chinese, { toneType: "num", segment: true }).replace(/\s+/g, "");
  const key = eng + "_" + pinyinNumeric;
  console.log("Generated composite key:", key, "from English:", eng, "and Chinese:", chinese);
  return key;
}

/**
 * openDB()
 * Opens the IndexedDB database (or creates it if needed) with a store keyed by "english_chinesepinyinnumeric".
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
 * Loads all dictionary entries from the IndexedDB store.
 */
async function loadWords() {
  db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  request.onsuccess = () => {
    wordLibrary = request.result;
    console.log("loadWords: Loaded", wordLibrary.length, "records from IndexedDB.");
    // Sort alphabetically by English (case-insensitive).
    wordLibrary.sort((a, b) => a.english.toLowerCase().localeCompare(b.english.toLowerCase()));
    renderWords();
  };
  request.onerror = () => console.error("loadWords error:", request.error);
}

/**
 * renderWords()
 * Renders the dictionary table using each record's composite key.
 */
function renderWords() {
  wordList.innerHTML = "";
  wordLibrary.forEach((word) => {
    const row = document.createElement("tr");
    const compKey = word.english_chinesepinyinnumeric;
    row.dataset.id = compKey;
    row.innerHTML = `
      <td data-field="english">${word.english}</td>
      <td data-field="chinese">${word.chinese}</td>
      <td data-field="pinyin">${word.pinyin}</td>
      <td>
        <button data-id="${compKey}" class="editBtn">Edit</button>
        <button data-id="${compKey}" class="deleteBtn">Delete</button>
      </td>
    `;
    wordList.appendChild(row);
  });
  
  // Attach delete button listeners.
  document.querySelectorAll(".deleteBtn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      console.log("Delete button clicked. Data-id:", id);
      if (!id) {
        console.error("deleteWord: Invalid key for deletion:", id);
        return;
      }
      try {
        await deleteWord(id);
        console.log("deleteWord: Successfully deleted key:", id);
      } catch (error) {
        console.error("deleteWord: Deletion error for key:", id, error);
      }
      await loadWords();
    });
  });
  
  // Attach edit button listeners.
  document.querySelectorAll(".editBtn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      console.log("Edit button clicked. Data-id:", id);
      const index = wordLibrary.findIndex(word => word.english_chinesepinyinnumeric === id);
      if (index !== -1) {
        editWord(index);
      } else {
        console.error("editWord: Word not found for editing with key:", id);
      }
    });
  });
}

/**
 * saveWord(word)
 * Saves (or updates) a word record in IndexedDB.
 */
async function saveWord(word) {
  word.english = normalizeEnglish(word.english);
  word.chinese = word.chinese.trim();
  // Generate the composite key.
  word.english_chinesepinyinnumeric = generateCompositeKey(word);
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(word);
  await tx.complete;
}

/**
 * deleteWord(key)
 * Deletes the record with the given composite key from IndexedDB.
 */
async function deleteWord(key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => {
      console.log("deleteWord: Request succeeded for key:", key);
      tx.oncomplete = () => {
        console.log("deleteWord: Transaction complete for key:", key);
        resolve();
      };
    };
    request.onerror = () => {
      console.error("deleteWord: Request error for key:", key, request.error);
      reject(request.error);
    };
  });
}

/**
 * editWord(index)
 * Replaces row cells with input fields and provides Save/Cancel controls.
 */
function editWord(index) {
  const row = wordList.children[index];
  const id = row.dataset.id;
  const englishCell = row.querySelector('td[data-field="english"]');
  const chineseCell = row.querySelector('td[data-field="chinese"]');
  const pinyinCell = row.querySelector('td[data-field="pinyin"]');
  const actionsCell = row.querySelector("td:last-child");

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
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", async () => {
    const newEnglish = englishInput.value.trim();
    const newChinese = chineseInput.value.trim();
    if (!newEnglish || !newChinese) {
      alert("Both fields are required.");
      return;
    }
    const newPinyin = window.pinyinPro.pinyin(newChinese, { toneType: "symbol" });
    const updatedWord = {
      english: newEnglish,
      chinese: newChinese,
      pinyin: newPinyin,
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
 * Updates an existing dictionary entry.
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
  // Duplicate check: Only if both English and Chinese match exactly.
  if (wordLibrary.some(w => w.english.toLowerCase() === english.trim().toLowerCase() && w.chinese === chinese.trim())) {
    alert("Duplicate word combination exists.");
    return;
  }
  const pinyin = window.pinyinPro.pinyin(chinese, { toneType: "symbol" });
  const newWord = { english, chinese, pinyin };
  try {
    await saveWord(newWord);
  } catch (error) {
    console.error("Error saving word:", error);
  }
  await loadWords();
  form.reset();
});

/**
 * Excel Export: Exports only the English and Chinese columns to an Excel file.
 */
function exportExcel() {
  let data = [["English", "Chinese"]];
  wordLibrary.forEach(word => {
    data.push([word.english, word.chinese]);
  });
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dictionary");
  XLSX.writeFile(wb, "word_dictionary.xlsx");
}

/**
 * Excel Import: Imports words from an Excel file.
 * Only uses the English and Chinese columns; pinyin is regenerated.
 */
function importExcel(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Convert the worksheet to an array of arrays.
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("Excel Import: Read", rows.length - 1, "data rows.");
    // Assume the first row is a header.
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length >= 2) {
        const english = normalizeEnglish(row[0].toString());
        const chinese = row[1].toString().trim();
        if (!english || !chinese) continue;
        // Skip duplicate entries.
        if (wordLibrary.some(w => w.english.toLowerCase() === english.toLowerCase() && w.chinese === chinese)) {
          console.log("Excel Import: Duplicate found for", english, chinese, "—skipping");
          continue;
        }
        const pinyin = window.pinyinPro.pinyin(chinese, { toneType: "symbol" });
        saveWord({ english, chinese, pinyin });
      }
    }
    // Delay slightly then reload.
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

// Reset Dictionary: Clears all dictionary entries.
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
