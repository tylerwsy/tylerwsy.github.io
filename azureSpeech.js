// azureSpeech.js
// This module provides functions to create an Azure Speech recognizer and perform recognition once.
// Make sure to include the Azure Speech SDK in your HTML file:
// <script src="https://aka.ms/csspeech/jsbrowserpackageraw"></script>

/**
 * Creates an Azure Speech recognizer instance.
 * @param {string} [subscriptionKey="8Yj0oh8v4Pyg4YFzcpWJgK1SILr4ysJ4I1ACHhl1jUqcIyBI4tgRJQQJ99BDACqBBLyXJ3w3AAAYACOGk2lo"] - Your Azure Speech Services subscription key.
 * @param {string} [serviceRegion="southeastasia"] - The Azure service region. Default is "southeastasia".
 * @param {function} [callback] - A callback function to run after recognition.
 */
function azureSpeechRecognize(subscriptionKey = azureSubscriptionKey, serviceRegion = azureServiceRegion, callback) {
  if (typeof SpeechSDK === "undefined") {
    console.error("Azure Speech SDK not found. Please include the SDK script in your HTML.");
    return;
  }
  // Request a fresh microphone stream to ensure we have a live audio source.
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(newStream => {
      // Create an audio configuration from the fresh stream.
      const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(newStream);
      // Create speech config with your subscription key and region.
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
      speechConfig.speechRecognitionLanguage = "zh-CN";
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      recognizer.recognizeOnceAsync(
        result => {
          recordedTranscript = result.text;
          console.log("[azure] Recognized text:", recordedTranscript);
          recordingResult.textContent = `🔈 You said: ${recordedTranscript}`;
          if (callback) callback();
          // Stop the newly obtained stream.
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
