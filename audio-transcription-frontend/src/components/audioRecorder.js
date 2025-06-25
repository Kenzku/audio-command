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
        statusElement.textContent = 'Recording stopped. Analyzing...';
        
        // Stop the timer
        clearInterval(timerInterval);
        isRecording = false;
        
        // Get all tracks from stream and stop them
        stream.getTracks().forEach(track => track.stop());
        
        // Automatically analyze the recording for commands
        if (window.voiceCommandAnalyzer) {
          try {
            console.log('Sending audio blob for analysis...');
            window.voiceCommandAnalyzer(audioBlob);
            // Don't update status here, let the analyzer handle it
          } catch (cmdError) {
            console.error('Error analyzing voice command:', cmdError);
            statusElement.textContent = 'Error analyzing recording. Ready to transcribe.';
            transcribeButton.disabled = false; // Enable manual transcription as fallback
          }
        } else {
          statusElement.textContent = 'Ready to transcribe.';
          transcribeButton.disabled = false; // Enable manual transcription
        }
      });
      
      // Start recording
      mediaRecorder.start();
      isRecording = true;
      
      // Update UI
      recordButton.classList.add('recording');
      stopButton.disabled = false;
      transcribeButton.disabled = true;
      statusElement.textContent = 'Recording... (Voice commands enabled)';
      
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
  
  // Enable automatic voice command detection after recording
  function enableVoiceCommandAfterRecording() {
    if (window.voiceCommands) {
      setTimeout(() => {
        window.voiceCommands.startCommandMode();
      }, 500); // Short delay after recording stops
    }
  }
  
  // Return public API
  return {
    startRecording,
    stopRecording,
    reset,
    isRecording: () => isRecording,
    getAudioBlob: () => audioBlob,
    // Property to be set by main.js
    voiceCommands: null,
    // Method to activate voice commands mode
    activateVoiceCommands: () => {
      if (window.voiceCommands) {
        window.voiceCommands.startCommandMode();
      }
    }
  };
}
