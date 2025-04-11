// azureSpeech.js
// This module provides functions to create an Azure Speech recognizer and perform recognition once.
// Make sure to include the Azure Speech SDK in your HTML file:
// <script src="https://aka.ms/csspeech/jsbrowserpackageraw"></script>

/**
 * Creates an Azure Speech recognizer instance.
 * @param {string} [subscriptionKey="8Yj0oh8v4Pyg4YFzcpWJgK1SILr4ysJ4I1ACHhl1jUqcIyBI4tgRJQQJ99BDACqBBLyXJ3w3AAAYACOGk2lo"] - Your Azure Speech Services subscription key.
 * @param {string} [serviceRegion="southeastasia"] - The Azure service region. Default is "southeastasia".
 * @param {string} [language="zh-CN"] - The language code for recognition, default is set to Chinese.
 * @returns {SpeechSDK.SpeechRecognizer} An instance of SpeechRecognizer.
 * @throws Will throw an error if the SpeechSDK global is not found.
 */
export function createRecognizer(subscriptionKey, serviceRegion, language = "zh-CN") {
  if (typeof SpeechSDK === "undefined") {
    throw new Error("SpeechSDK not found. Please include the Azure Speech SDK script in your HTML.");
  }
  
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
  speechConfig.speechRecognitionLanguage = language;
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  return new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
}

/**
 * Performs a single-shot recognition using the provided recognizer.
 * @param {SpeechSDK.SpeechRecognizer} recognizer - An Azure Speech Recognizer instance.
 * @returns {Promise<string>} A promise that resolves with the recognized text.
 */
export function recognizeOnce(recognizer) {
  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      result => {
        if (result && result.text) {
          resolve(result.text);
        } else {
          reject(new Error("No recognized text received."));
        }
      },
      err => {
        reject(err);
      }
    );
  });
}
