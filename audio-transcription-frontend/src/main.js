import { setupRecorder } from './components/audioRecorder.js';
import { setupTranscriptionUI } from './components/transcriptionUI.js';
import { setupVisualizer } from './components/visualizer.js';
import { setupLLMAssistant } from './components/llmAssistant.js';
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
    if (document.getElementById('llm-assistant')) {
      const llmAssistant = setupLLMAssistant({
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
  } catch (error) {
    console.error('Failed to initialize API discovery:', error);
  }
});
