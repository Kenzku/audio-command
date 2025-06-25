/**
 * AudioRecorder component
 * Manages audio recording functionality
 */

export function setupRecorder({ 
  recordButton, 
  stopButton, 
  transcribeButton, 
  statusElement, 
  timerElement 
}) {
  // State
  let mediaRecorder;
  let audioChunks = [];
  let startTime;
  let timerInterval;
  let audioBlob = null;
  let isRecording = false;
  
  // Check browser support
  const hasMediaSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  if (!hasMediaSupport) {
    statusElement.textContent = 'Your browser does not support audio recording';
    recordButton.disabled = true;
    console.error('MediaDevices API not supported in this browser');
    return;
  }
  
  // Set up event handlers
  recordButton.addEventListener('click', startRecording);
  stopButton.addEventListener('click', stopRecording);
  
  // Start recording function
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset state
      audioChunks = [];
      
      // Create media recorder
      mediaRecorder = new MediaRecorder(stream);
      
      // Set up event listeners
      mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });
      
      mediaRecorder.addEventListener('stop', () => {
        // Create audio blob when recording stops
        audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        // Update UI
        recordButton.classList.remove('recording');
        stopButton.disabled = true;
        transcribeButton.disabled = false;
        statusElement.textContent = 'Recording stopped. Ready to transcribe.';
        
        // Stop the timer
        clearInterval(timerInterval);
        isRecording = false;
        
        // Get all tracks from stream and stop them
        stream.getTracks().forEach(track => track.stop());
      });
      
      // Start recording
      mediaRecorder.start();
      isRecording = true;
      
      // Update UI
      recordButton.classList.add('recording');
      stopButton.disabled = false;
      transcribeButton.disabled = true;
      statusElement.textContent = 'Recording in progress...';
      
      // Start timer
      startTime = Date.now();
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
      
      // Dispatch custom event that recording has started
      const event = new CustomEvent('recordingStarted', { detail: { stream } });
      document.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      statusElement.textContent = `Error: ${error.message}`;
    }
  }
  
  // Stop recording function
  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  }
  
  // Update timer display
  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
  }
  
  // Reset recorder state for new recording
  function reset() {
    audioChunks = [];
    audioBlob = null;
    isRecording = false;
    clearInterval(timerInterval);
    timerElement.textContent = '00:00';
    recordButton.classList.remove('recording');
    stopButton.disabled = true;
    transcribeButton.disabled = true;
    statusElement.textContent = 'Ready to record';
  }
  
  // Return public API
  return {
    startRecording,
    stopRecording,
    reset,
    isRecording: () => isRecording,
    getAudioBlob: () => audioBlob,
  };
}
