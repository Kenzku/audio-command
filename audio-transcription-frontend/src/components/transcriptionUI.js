/**
 * TranscriptionUI component
 * Handles the UI for transcribing and displaying results
 */

export function setupTranscriptionUI({
  transcribeButton,
  resultTextElement,
  copyButton,
  newRecordingButton,
  loadingElement,
  statusElement,
  recorder,
  apiUrl
}) {
  // Set up event handlers
  transcribeButton.addEventListener('click', transcribeAudio);
  copyButton.addEventListener('click', copyToClipboard);
  newRecordingButton.addEventListener('click', startNewRecording);
  
  // Transcribe audio function
  async function transcribeAudio() {
    const audioBlob = recorder.getAudioBlob();
    
    if (!audioBlob) {
      statusElement.textContent = 'No recording available to transcribe';
      return;
    }
    
    try {
      // Show loading state
      loadingElement.classList.remove('hidden');
      statusElement.textContent = 'Transcribing your audio...';
      transcribeButton.disabled = true;
      
      // Convert audio blob to base64
      const base64Audio = await blobToBase64(audioBlob);
      
      // Send to backend API
      const response = await fetch(`${apiUrl}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ audioData: base64Audio })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Display transcription result
      resultTextElement.textContent = data.transcription || 'No transcription available';
      
      // Update UI state
      loadingElement.classList.add('hidden');
      statusElement.textContent = 'Transcription complete!';
      
    } catch (error) {
      console.error('Transcription error:', error);
      statusElement.textContent = `Error: ${error.message}`;
      loadingElement.classList.add('hidden');
      transcribeButton.disabled = false;
    }
  }
  
  // Copy transcription to clipboard
  function copyToClipboard() {
    const text = resultTextElement.textContent;
    
    if (text && text !== 'Your transcription will appear here...') {
      navigator.clipboard.writeText(text)
        .then(() => {
          const originalText = copyButton.textContent;
          copyButton.textContent = 'Copied!';
          
          setTimeout(() => {
            copyButton.textContent = originalText;
          }, 2000);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          statusElement.textContent = 'Failed to copy to clipboard';
        });
    }
  }
  
  // Start a new recording
  function startNewRecording() {
    resultTextElement.textContent = 'Your transcription will appear here...';
    recorder.reset();
  }
  
  // Helper function to convert Blob to Base64
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
