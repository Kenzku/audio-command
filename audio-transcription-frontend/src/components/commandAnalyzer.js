/**
 * Voice Command Analyzer
 * Analyzes audio recordings for potential voice commands using LLM
 */

import { API_URL, LLM_API_URL } from '../config.js';

export class CommandAnalyzer {
  constructor(options = {}) {
    this.options = {
      apiUrl: API_URL,
      llmApiUrl: LLM_API_URL,
      statusElement: null,
      resultElement: null,
      loadingElement: null,
      commandTypes: {
        TRANSCRIBE: 'transcribe',
        LIST_MODELS: 'list_models',
        HELP: 'help',
        UNKNOWN: 'unknown'
      },
      ...options
    };
  }

  /**
   * Analyze audio blob for voice commands and execute accordingly
   * @param {Blob} audioBlob - The audio recording to analyze
   */
  async analyzeRecording(audioBlob) {
    if (!audioBlob) {
      console.error('No audio recording provided for analysis');
      return;
    }
    
    try {
      // Update UI status
      if (this.options.statusElement) {
        this.options.statusElement.textContent = 'Analyzing recording for commands...';
      }
      
      // Show loading indicator
      if (this.options.loadingElement) {
        this.options.loadingElement.classList.remove('hidden');
      }
      
      // First, transcribe the audio to text
      const transcription = await this.transcribeAudio(audioBlob);
      
      if (!transcription) {
        throw new Error('Failed to transcribe audio for command analysis');
      }
      
      console.log('Transcription for command analysis:', transcription);
      
      // Send to LLM to identify commands and content sections
      const parsedCommand = await this.parseTranscriptionWithLLM(transcription);
      
      if (!parsedCommand) {
        throw new Error('Failed to parse command from transcription');
      }
      
      console.log('Parsed command:', parsedCommand);
      
      // Execute the identified command
      await this.executeCommand(parsedCommand, audioBlob);
      
    } catch (error) {
      console.error('Error analyzing voice command:', error);
      if (this.options.statusElement) {
        this.options.statusElement.textContent = `Error: ${error.message}`;
      }
    } finally {
      // Hide loading indicator
      if (this.options.loadingElement) {
        this.options.loadingElement.classList.add('hidden');
      }
    }
  }
  
  /**
   * Transcribe audio to text
   * @param {Blob} audioBlob - Audio recording to transcribe
   * @returns {Promise<string>} - The transcription text
   */
  async transcribeAudio(audioBlob) {
    try {
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Send to backend API
      const response = await fetch(`${this.options.apiUrl}/transcribe`, {
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
      
      if (!data.success || !data.transcription) {
        throw new Error('Transcription failed or returned empty result');
      }
      
      return data.transcription;
      
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }
  
  /**
   * Parse transcription to identify commands and content
   * @param {string} transcription - The transcribed speech
   * @returns {Promise<Object>} - Object containing command and content
   */
  async parseTranscriptionWithLLM(transcription) {
    try {
      // Construct prompt for LLM to identify commands in the transcription
      const prompt = `
        I have an audio transcription that may contain both a command and content.
        Please analyze this transcription: "${transcription}"
        
        Identify if there's a command like:
        - "transcribe this:" followed by content to transcribe
        - "list models" or "show me available models"
        - "help" or requests for assistance
        
        Return a JSON object with:
        1. commandType: "transcribe", "list_models", "help", or "unknown"
        2. content: The actual content to transcribe (if present)
        3. command: The specific command detected
        
        For example, if someone said "transcribe this: Hello world",
        return { "commandType": "transcribe", "command": "transcribe this", "content": "Hello world" }
      `;
      
      // Call LLM API to process the command
      const response = await fetch(`${this.options.llmApiUrl}/query`, {
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
            commandType: this.options.commandTypes.UNKNOWN,
            command: 'unknown',
            content: transcription,
            rawLLMResponse: data.response
          };
        }
      } else {
        // If no JSON found, assume the whole transcription is content
        return {
          commandType: this.options.commandTypes.UNKNOWN,
          command: 'unknown',
          content: transcription,
          rawLLMResponse: data.response
        };
      }
      
    } catch (error) {
      console.error('Error processing transcription with LLM:', error);
      // Default to treating the whole transcription as content
      return {
        commandType: this.options.commandTypes.UNKNOWN,
        command: 'unknown',
        content: transcription,
        error: error.message
      };
    }
  }
  
  /**
   * Execute the identified command
   * @param {Object} parsedCommand - The parsed command from LLM
   * @param {Blob} originalAudio - The original audio recording
   */
  async executeCommand(parsedCommand, originalAudio) {
    const { commandType, content } = parsedCommand;
    const { commandTypes } = this.options;
    
    try {
      switch (commandType) {
        case commandTypes.TRANSCRIBE:
          await this.executeTranscribeCommand(content);
          break;
          
        case commandTypes.LIST_MODELS:
          await this.executeListModelsCommand();
          break;
          
        case commandTypes.HELP:
          this.executeHelpCommand();
          break;
          
        case commandTypes.UNKNOWN:
        default:
          // Just show the full transcription
          if (this.options.resultElement && content) {
            this.options.resultElement.textContent = content;
          }
          
          if (this.options.statusElement) {
            this.options.statusElement.textContent = 'Transcription complete';
          }
          break;
      }
    } catch (error) {
      console.error('Error executing command:', error);
      if (this.options.statusElement) {
        this.options.statusElement.textContent = `Error: ${error.message}`;
      }
    }
  }
  
  /**
   * Execute transcribe command with the content
   * @param {string} content - The content to transcribe
   */
  async executeTranscribeCommand(content) {
    if (this.options.resultElement && content) {
      this.options.resultElement.textContent = content;
    }
    
    if (this.options.statusElement) {
      this.options.statusElement.textContent = 'Transcription complete';
    }
  }
  
  /**
   * Execute list models command
   */
  async executeListModelsCommand() {
    if (this.options.statusElement) {
      this.options.statusElement.textContent = 'Fetching available models...';
    }
    
    try {
      const response = await fetch(`${this.options.apiUrl}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (this.options.resultElement) {
        let modelsHtml = '<h3>Available Models:</h3><ul>';
        data.models.forEach(model => {
          modelsHtml += `<li><strong>${model.name}</strong> (${model.id}): ${model.description}</li>`;
        });
        modelsHtml += '</ul>';
        
        this.options.resultElement.innerHTML = modelsHtml;
      }
      
      if (this.options.statusElement) {
        this.options.statusElement.textContent = 'Models fetched successfully';
      }
      
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }
  
  /**
   * Execute help command
   */
  executeHelpCommand() {
    if (this.options.resultElement) {
      this.options.resultElement.innerHTML = `
        <div class="help-info">
          <h3>Voice Command Help</h3>
          <p>You can use the following voice commands while recording:</p>
          <ul>
            <li><strong>Transcribe this: [your content]</strong> - Transcribe specific content</li>
            <li><strong>List models</strong> or <strong>Show available models</strong> - Lists transcription models</li>
            <li><strong>Help</strong> - Shows this help information</li>
          </ul>
          <p>Or just speak naturally and the AI will transcribe your entire recording.</p>
        </div>
      `;
    }
    
    if (this.options.statusElement) {
      this.options.statusElement.textContent = 'Showing help information';
    }
  }
  
  /**
   * Convert blob to base64
   * @param {Blob} blob - The blob to convert
   * @returns {Promise<string>} - Base64 string
   */
  blobToBase64(blob) {
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
}

// Create a singleton instance for global use
let analyzerInstance = null;

/**
 * Initialize the command analyzer
 * @param {Object} options - Configuration options
 * @returns {CommandAnalyzer} - The analyzer instance
 */
export function initCommandAnalyzer(options) {
  analyzerInstance = new CommandAnalyzer(options);
  
  // Create global function for recorder to call
  window.voiceCommandAnalyzer = (audioBlob) => {
    return analyzerInstance.analyzeRecording(audioBlob);
  };
  
  return analyzerInstance;
}
