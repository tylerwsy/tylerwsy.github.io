// File: testResults.js
// Module to handle test result storage in a modular way.

const DB_NAME = "TestResultsDB";
const STORE_NAME = "results";

/**
 * openTestResultsDB()
 *  Opens (or creates) the TestResultsDB with a "results" object store.
 */
function openTestResultsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create a store with an auto-incrementing key.
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        // Create indexes for targeted queries.
        store.createIndex("user", "user", { unique: false });
        store.createIndex("testType", "testType", { unique: false });
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * addTestResult(result)
 *  Stores a new test session result.
 *  The result object should contain:
 *    user: "boy" or "girl",
 *    testType: e.g., "Chinese - Pronunciation Test",
 *    totalAttempts: <number>,
 *    correctCount: <number>,
 *    date: <timestamp>
 */
function addTestResult(result) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openTestResultsDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(result);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * getTestResults(filter)
 *  Retrieves test results with optional filtering.
 *  filter is an object with optional properties { user, testType }.
 */
function getTestResults({ user, testType } = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openTestResultsDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const results = [];
      const cursorRequest = store.openCursor();
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const record = cursor.value;
          // Skip records that don't match filter criteria.
          if ((user && record.user !== user) || (testType && record.testType !== testType)) {
            // Skip this record.
          } else {
            results.push(record);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    } catch (error) {
      reject(error);
    }
  });
}

// Expose the functions to the global scope (or use module exports if using an ES module system)
window.testResultsDB = {
  openTestResultsDB,
  addTestResult,
  getTestResults
};
