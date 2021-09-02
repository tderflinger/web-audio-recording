/*
 *  Adapted from  https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/record
 *  BSD-style license
 */

"use strict";

const FLASK_ENDPOINT = "http://localhost:5000/audio";

let mediaRecorder;
let recordedBlobs;

const codecPreferences = document.querySelector("#codecPreferences");

const errorMsgElement = document.querySelector("span#errorMsg");
const recordButton = document.querySelector("button#record");

recordButton.addEventListener("click", () => {
  if (recordButton.textContent === "Start Recording") {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = "Start Recording";
    codecPreferences.disabled = false;
  }
});

function handleDataAvailable(event) {
  console.log("handleDataAvailable", event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function getSupportedMimeTypes() {
  const possibleTypes = [
    "audio/webm;codecs=opus",
  ];
  return possibleTypes.filter((mimeType) => {
    return MediaRecorder.isTypeSupported(mimeType);
  });
}

async function startRecording() {
  const constraints = {
    audio: true,
    video: false,
  };
  console.log("Using media constraints:", constraints);
  await init(constraints);

  recordedBlobs = [];
  const mimeType =
    codecPreferences.options[codecPreferences.selectedIndex].value;
  const options = { mimeType };

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error("Exception while creating MediaRecorder:", e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(
      e
    )}`;
    return;
  }

  console.log("Created MediaRecorder", mediaRecorder, "with options", options);
  recordButton.textContent = "Stop Recording";
  mediaRecorder.onstop = (event) => {
    console.log("Recorder stopped: ", event);
    console.log("Recorded Blobs: ", recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log("MediaRecorder started", mediaRecorder);
}

// Stop recording and send to Flask webservice
function stopRecording() {
  mediaRecorder.onstop = function(event) { 
    const blob = new Blob(recordedBlobs, { type: "audio/webm" });

    fetch(FLASK_ENDPOINT, { method: "POST", body: blob })
      .then((response) => {
        console.log("Success! ", response);
      })
      .catch((err) => {
        console.error("Error posting audio data! ", err);
      });
  }

  mediaRecorder.stop();
}

function handleSuccess(stream) {
  console.log("getUserMedia() got stream:", stream);
  window.stream = stream;

  const gumAudio = document.querySelector("audio#gum");
  gumAudio.srcObject = stream;

  getSupportedMimeTypes().forEach((mimeType) => {
    const option = document.createElement("option");
    option.value = mimeType;
    option.innerText = option.value;
    codecPreferences.appendChild(option);
  });
  codecPreferences.disabled = false;
}

async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error("navigator.getUserMedia error:", e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.message}`;
  }
}
