// azureSpeech.js
// This module provides functions to perform speech recognition and text-to-speech
// using the Azure Speech SDK and a secure Render backend to fetch an authorization token.

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

/**
 * Performs one-shot speech-to-text recognition.
 * Uses a secure token fetched from Render.
 * @param {function} callback - Called with (error, recognizedText) after recognition.
 */
function azureSpeechRecognize(callback) {
  if (typeof SpeechSDK === "undefined") {
    console.error("Azure Speech SDK not found. Please include the SDK script in your HTML.");
    return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(newStream => {
      fetchAzureToken((err, data) => {
        if (err) {
          newStream.getTracks().forEach(track => track.stop());
          if (callback) callback(err);
          return;
        }
        const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(newStream);
        const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(data.token, data.region);
        speechConfig.speechRecognitionLanguage = "zh-CN";
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
        recognizer.recognizeOnceAsync(
          result => {
            const recognizedText = result.text;
            console.log("[azure] Recognized text:", recognizedText);
            if (callback) callback(null, recognizedText);
            newStream.getTracks().forEach(track => track.stop());
          },
          err => {
            console.error("[azure] Recognition error:", err);
            newStream.getTracks().forEach(track => track.stop());
            if (callback) callback(err);
          }
        );
      });
    })
    .catch(err => {
      console.error("Error obtaining microphone stream:", err);
      if (callback) callback(err);
    });
}

/**
 * Performs text-to-speech synthesis using Azure.
 * Uses a secure token fetched from Render.
 * @param {string} text - The text to speak.
 * @param {function} callback - Called with (error, result) after synthesis.
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
    // Adjust the voice if needed.
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

// Expose functions for external use, if needed.
window.azureSpeech = {
  azureSpeechRecognize,
  azureTextToSpeech
};
