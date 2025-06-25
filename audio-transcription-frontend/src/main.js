import { setupRecorder } from './components/audioRecorder.js';
import { setupTranscriptionUI } from './components/transcriptionUI.js';
import { setupVisualizer } from './components/visualizer.js';
import { setupLLMAssistant } from './components/llmAssistant.js';
import { setupVoiceCommands } from './components/voiceCommands.js';
import { initCommandAnalyzer } from './components/commandAnalyzer.js';
import { APIDiscoveryService } from './services/apiDiscovery.js';
import { API_URL, LLM_API_URL, API_SPEC_URL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Audio Transcription App initialized');
  console.log(`API URL: ${API_URL}`);
  
  // Tab switching functionality
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and content sections
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const targetId = tab.dataset.target;
      document.getElementById(targetId).classList.add('active');
    });
  });
  
  // Initialize audio recorder
  const recorder = setupRecorder({
    recordButton: document.getElementById('recordButton'),
    stopButton: document.getElementById('stopButton'),
    transcribeButton: document.getElementById('transcribeButton'),
    statusElement: document.getElementById('status'),
    timerElement: document.getElementById('timer'),
  });
  
  // Initialize visualizer
  setupVisualizer('waveform', recorder);
  
  // Initialize transcription UI
  setupTranscriptionUI({
    transcribeButton: document.getElementById('transcribeButton'),
    resultTextElement: document.getElementById('resultText'),
    copyButton: document.getElementById('copyButton'),
    newRecordingButton: document.getElementById('newRecordingButton'),
    loadingElement: document.getElementById('loading'),
    statusElement: document.getElementById('status'),
    recorder: recorder,
    apiUrl: API_URL
  });
  
  // Initialize API Discovery Service
  const apiDiscoveryService = new APIDiscoveryService(API_SPEC_URL);
  
  try {
    // Fetch API specification
    await apiDiscoveryService.fetchAPISpec();
    console.log('API specification loaded successfully');
    
    // Make available globally for debugging
    window.apiDiscovery = apiDiscoveryService;
    
    // Initialize LLM Assistant if the container exists
    let llmAssistant;
    if (document.getElementById('llm-assistant')) {
      llmAssistant = setupLLMAssistant({
        apiUrl: LLM_API_URL,
        assistantContainer: document.getElementById('llm-assistant'),
        queryInput: document.getElementById('llm-query'),
        submitButton: document.getElementById('llm-submit'),
        resultContainer: document.getElementById('llm-response')
      });
      
      // Populate assistant with API capabilities
      const endpoints = apiDiscoveryService.getAvailableEndpoints();
      console.log(`Discovered ${endpoints.length} API endpoints`);
    }
    
    // Initialize Command Analyzer for in-recording commands
    const commandAnalyzer = initCommandAnalyzer({
      apiUrl: API_URL,
      llmApiUrl: LLM_API_URL,
      statusElement: document.getElementById('status'),
      resultElement: document.getElementById('resultText'),
      loadingElement: document.getElementById('loading')
    });
    
    // Initialize Voice Commands (for explicit command mode)
    const voiceCommands = setupVoiceCommands({
      statusElement: document.getElementById('status'),
      recorder: recorder,
      apiDiscoveryService: apiDiscoveryService,
      resultTextElement: document.getElementById('resultText'),
      onTranscriptionComplete: (text) => {
        console.log('Transcription from voice command:', text);
      },
      onCommandDetected: (commandInfo) => {
        console.log('Voice command detected:', commandInfo);
      }
    });
    
    // Make voice commands available globally and to recorder component
    if (voiceCommands) {
      window.voiceCommands = voiceCommands;
      if (recorder) {
        recorder.voiceCommands = voiceCommands;
      }
    }
    
    // Voice command functionality is now integrated directly into the recording process
    // No need for a separate button since commands are detected automatically from recordings
  } catch (error) {
    console.error('Failed to initialize API discovery:', error);
  }
  
  // Load test scripts in development mode
  if (import.meta.env.DEV) {
    import('./tests/voiceCommandTests.js')
      .then(() => console.log('Voice command tests loaded'))
      .catch(err => console.error('Failed to load voice command tests:', err));
  }
});
