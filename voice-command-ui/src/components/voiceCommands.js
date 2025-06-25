/**
 * Voice Commands Component
 * Integrates speech recognition with API calls via LLM
 */

import annyang from 'annyang';
import { API_URL, LLM_API_URL } from '../config.js';

// Constants for voice command types
const COMMAND_TYPES = {
  TRANSCRIBE: 'transcribe',
  LIST_MODELS: 'list_models',
  GET_HELP: 'help',
  UNKNOWN: 'unknown'
};

/**
 * Setup voice command recognition and processing
 */
export function setupVoiceCommands({
  statusElement,
  recorder,
  apiDiscoveryService,
  resultTextElement,
  onTranscriptionComplete,
  onCommandDetected
}) {
  // Check if speech recognition is supported
  if (!annyang) {
    console.error('Speech recognition not supported');
    statusElement.textContent = 'Voice commands not supported in this browser';
    return null;
  }
  
  let isListening = false;
  let commandMode = false;
  let audioBlob = null;
  
  // Initialize command recognition
  function initCommandRecognition() {
    // Command handlers
    const commands = {
      // Basic commands that don't need LLM processing
      'transcribe (this) (audio) (recording) (please)': handleTranscribeCommand,
      'list (available) models': handleListModelsCommand,
      'help (me) (please)': handleHelpCommand,
      'stop listening': stopCommandMode,
      
      // Generic command handler for anything else
      '*query': handleGenericCommand
    };
    
    // Setup annyang
    annyang.addCommands(commands);
    annyang.setLanguage('en-US');
    
    // Setup events
    annyang.addCallback('result', handleSpeechResult);
    annyang.addCallback('error', (error) => {
      console.error('Speech recognition error:', error);
      stopCommandMode();
      statusElement.textContent = `Voice command error: ${error.error}`;
    });
  }
  
  /**
   * Start listening for voice commands
   */
  function startCommandMode() {
    if (!annyang || isListening) return;
    
    try {
      // Initialize if not already
      if (!commandMode) {
        initCommandRecognition();
        commandMode = true;
      }
      
      // Start listening
      annyang.start({ autoRestart: false });
      isListening = true;
      statusElement.textContent = 'Listening for commands...';
      
      // Notify listeners if callback provided
      if (onCommandDetected) {
        onCommandDetected({
          type: 'start',
          message: 'Voice command mode activated'
        });
      }
    } catch (error) {
      console.error('Failed to start voice commands:', error);
      statusElement.textContent = 'Could not start voice commands';
    }
  }
  
  /**
   * Stop listening for voice commands
   */
  function stopCommandMode() {
    if (!annyang || !isListening) return;
    
    annyang.abort();
    isListening = false;
    statusElement.textContent = 'Voice command mode deactivated';
    
    // Notify listeners if callback provided
    if (onCommandDetected) {
      onCommandDetected({
        type: 'stop',
        message: 'Voice command mode deactivated'
      });
    }
  }
  
  /**
   * Handle speech recognition results
   */
  function handleSpeechResult(phrases) {
    if (phrases && phrases.length > 0) {
      const command = phrases[0].toLowerCase();
      
      // Display recognized command
      if (resultTextElement) {
        resultTextElement.innerHTML = `<div class="voice-command">Command recognized: "${command}"</div>`;
      }
      
      console.log('Voice command recognized:', command);
      
      // Process command with LLM if it wasn't handled by direct commands
      // This will be done by the handleGenericCommand function
    }
  }
  
  /**
   * Parse spoken command to identify API intent
   */
  async function parseCommandWithLLM(command) {
    try {
      // Get API spec if available
      const apiSpec = apiDiscoveryService ? apiDiscoveryService.getRawSpec() : null;
      
      // Construct a prompt that helps the LLM identify the intent
      const promptPrefix = apiSpec 
        ? "Given this API specification: " + JSON.stringify(apiSpec.paths) 
        : "You're a voice assistant for an audio transcription API.";
        
      const prompt = `${promptPrefix}

Based on the user's spoken command: "${command}", determine:
1. Which API endpoint should be called?
2. What parameters should be provided?
3. What is the user's intent?

Return JSON in this format:
{
  "commandType": "transcribe|list_models|help|unknown",
  "endpoint": "/api/path",
  "method": "GET|POST",
  "parameters": {},
  "intent": "brief description"
}`;

      // Call LLM API to process the command
      const response = await fetch(`${LLM_API_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: prompt })
      });
      
      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to process command with LLM');
      }
      
      // Extract the JSON response from the LLM text
      const jsonMatch = data.response.match(/```json\n([\s\S]*?)\n```/) || 
                        data.response.match(/{[\s\S]*?}/);
                        
      if (jsonMatch) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          return parsedResponse;
        } catch (parseError) {
          console.error('Error parsing LLM JSON:', parseError);
          return {
            commandType: COMMAND_TYPES.UNKNOWN,
            intent: 'Could not parse command',
            rawLLMResponse: data.response
          };
        }
      } else {
        return {
          commandType: COMMAND_TYPES.UNKNOWN,
          intent: 'Command not recognized',
          rawLLMResponse: data.response
        };
      }
      
    } catch (error) {
      console.error('Error processing command with LLM:', error);
      return {
        commandType: COMMAND_TYPES.UNKNOWN,
        intent: `Error: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Handle the transcribe command
   */
  async function handleTranscribeCommand() {
    if (!recorder) {
      statusElement.textContent = 'Recorder not available';
      return;
    }
    
    // Get the recorded audio blob
    audioBlob = recorder.getAudioBlob();
    
    if (!audioBlob) {
      statusElement.textContent = 'No audio recording available to transcribe';
      return;
    }
    
    // Perform transcription
    await transcribeAudio(audioBlob);
    
    // Stop command mode
    stopCommandMode();
  }
  
  /**
   * Handle the list models command
   */
  async function handleListModelsCommand() {
    statusElement.textContent = 'Fetching available models...';
    
    try {
      const response = await fetch(`${API_URL}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (resultTextElement) {
        let modelsHtml = '<h3>Available Models:</h3><ul>';
        data.models.forEach(model => {
          modelsHtml += `<li><strong>${model.name}</strong> (${model.id}): ${model.description}</li>`;
        });
        modelsHtml += '</ul>';
        
        resultTextElement.innerHTML = modelsHtml;
      }
      
      statusElement.textContent = 'Available models fetched successfully';
      
    } catch (error) {
      console.error('Error fetching models:', error);
      statusElement.textContent = `Error: ${error.message}`;
    }
    
    // Stop command mode
    stopCommandMode();
  }
  
  /**
   * Handle help command
   */
  function handleHelpCommand() {
    if (resultTextElement) {
      resultTextElement.innerHTML = `
        <div class="help-info">
          <h3>Voice Command Help</h3>
          <p>You can use the following voice commands:</p>
          <ul>
            <li><strong>Transcribe this audio</strong> - Converts the current recording to text</li>
            <li><strong>List models</strong> - Shows available transcription models</li>
            <li><strong>Help</strong> - Shows this help information</li>
            <li><strong>Stop listening</strong> - Deactivates voice command mode</li>
          </ul>
          <p>You can also try natural language commands and the AI will attempt to understand them.</p>
        </div>
      `;
    }
    
    statusElement.textContent = 'Showing help information';
    
    // Stop command mode
    stopCommandMode();
  }
  
  /**
   * Handle generic command using LLM to determine intent
   */
  async function handleGenericCommand(query) {
    statusElement.textContent = 'Processing command...';
    
    try {
      // Parse the command with LLM to determine intent
      const parsedCommand = await parseCommandWithLLM(query);
      
      // Notify listeners if callback provided
      if (onCommandDetected) {
        onCommandDetected({
          type: 'command',
          command: query,
          parsedCommand: parsedCommand
        });
      }
      
      // Handle different command types
      switch (parsedCommand.commandType) {
        case COMMAND_TYPES.TRANSCRIBE:
          await handleTranscribeCommand();
          break;
          
        case COMMAND_TYPES.LIST_MODELS:
          await handleListModelsCommand();
          break;
          
        case COMMAND_TYPES.GET_HELP:
          handleHelpCommand();
          break;
          
        case COMMAND_TYPES.UNKNOWN:
        default:
          statusElement.textContent = 'Command not recognized';
          if (resultTextElement) {
            resultTextElement.innerHTML = `
              <div class="unknown-command">
                <p>I didn't understand: "${query}"</p>
                <p>Intent detected: ${parsedCommand.intent || 'Unknown'}</p>
                <p>Try saying "help" for available commands.</p>
              </div>
            `;
          }
          break;
      }
    } catch (error) {
      console.error('Error handling generic command:', error);
      statusElement.textContent = `Error: ${error.message}`;
    }
  }
  
  /**
   * Transcribe audio file
   */
  async function transcribeAudio(audioBlob) {
    try {
      statusElement.textContent = 'Transcribing audio...';
      
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);
      
      // Call API
      const response = await fetch(`${API_URL}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ audioData: base64Audio })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.transcription) {
        if (resultTextElement) {
          resultTextElement.innerHTML = `<div class="transcription-result">${data.transcription}</div>`;
        }
        
        statusElement.textContent = 'Transcription complete';
        
        // Call the callback if provided
        if (onTranscriptionComplete) {
          onTranscriptionComplete(data.transcription);
        }
      } else {
        throw new Error('Transcription failed');
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      statusElement.textContent = `Transcription error: ${error.message}`;
    }
  }
  
  /**
   * Convert blob to base64
   */
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extract the base64 part from the data URL
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  // Return public interface
  return {
    startCommandMode,
    stopCommandMode,
    isCommandModeActive: () => isListening,
    transcribeAudio: (blob) => {
      audioBlob = blob;
      return transcribeAudio(blob);
    }
  };
}
