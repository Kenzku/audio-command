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
        TRANSLATE: 'translate',
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
      
      // Always update result element with the transcription immediately
      // This ensures the user sees the transcription text right away
      if (this.options.resultElement) {
        this.options.resultElement.textContent = transcription;
      }
      
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
        - "transcribe this:" or similar phrases indicating transcription, followed by content to transcribe
        - Any translation-related phrase like "translate", "translate for me", "translate this", "translate to [language]", "can you translate", etc.
        - "list models" or "show me available models" or similar phrases asking to see available models
        - "help" or any requests for assistance
        
        Return a JSON object with:
        1. commandType: "transcribe", "translate", "list_models", "help", or "unknown"
        2. content: The actual content to transcribe or translate (if present)
        3. command: The specific command detected
        4. targetLanguage: The target language for translation (if a translation command)
           - If a specific language is mentioned (e.g., "translate to Spanish"), extract that language
           - If no language is specified, default to "English"
           - Be flexible in language detection, recognizing names like "Japanese", "German", "French", etc.
           - If the user just says "translate" without specifying a language, assume English as the target
        
        IMPORTANT: Be very flexible in command detection. Users might phrase things in many different ways.
        
        Examples:
        - "transcribe this: Hello world" → { "commandType": "transcribe", "command": "transcribe this", "content": "Hello world" }
        - "please transcribe the following" → { "commandType": "transcribe", "command": "please transcribe", "content": "the following" }
        - "translate this to Spanish: Hello how are you?" → { "commandType": "translate", "command": "translate this to Spanish", "content": "Hello how are you?", "targetLanguage": "Spanish" }
        - "can you translate the following to Japanese" → { "commandType": "translate", "command": "translate to Japanese", "content": "the following", "targetLanguage": "Japanese" }
        - "translate for me" → { "commandType": "translate", "command": "translate", "content": "for me", "targetLanguage": "English" }
        - "help me understand how this works" → { "commandType": "help", "command": "help", "content": "me understand how this works" }
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
    const { commandType, content, command } = parsedCommand;
    const { commandTypes } = this.options;
    
    try {
      switch (commandType) {
        case commandTypes.TRANSCRIBE:
          await this.executeTranscribeCommand(content);
          break;
          
        case commandTypes.TRANSLATE:
          await this.executeTranslateCommand(content, parsedCommand.targetLanguage);
          break;
          
        case commandTypes.LIST_MODELS:
          await this.executeListModelsCommand();
          break;
          
        case commandTypes.HELP:
          this.executeHelpCommand();
          break;
          
        case commandTypes.UNKNOWN:
        default:
          // For unknown commands, the full transcription is already displayed
          // Just update the status to indicate completion
          if (this.options.statusElement) {
            this.options.statusElement.textContent = 'Transcription complete';
          }
          break;
      }
      
      // Enable the transcribe button (if it exists) after command execution
      const transcribeButton = document.getElementById('transcribeButton');
      if (transcribeButton) {
        transcribeButton.disabled = false;
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
   * Execute translate command with the content and target language
   * @param {string} content - The content to translate
   * @param {string} targetLanguage - The target language to translate to (defaults to English)
   */
  async executeTranslateCommand(content, targetLanguage) {
    if (!content) {
      if (this.options.statusElement) {
        this.options.statusElement.textContent = 'Error: No content provided for translation';
      }
      return;
    }
    
    // Use English as default target language if none specified
    const finalTargetLanguage = targetLanguage || 'English';
    
    if (this.options.statusElement) {
      this.options.statusElement.textContent = `Translating to ${finalTargetLanguage}...`;
    }
    
    try {
      // For translation, we don't need to send the audio again
      // We can just send the content and target language to the backend
      const response = await fetch(`${this.options.apiUrl}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          audioData: "", // Not used when we already have the content
          content: content,
          targetLanguage: finalTargetLanguage
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.translation) {
        throw new Error('Translation failed or returned empty result');
      }
      
      // Display both the original content and the translation
      if (this.options.resultElement) {
        this.options.resultElement.innerHTML = `
          <div class="translation-result">
            <div class="original">
              <h4>Original (${data.originalLanguage || 'detected language'})</h4>
              <p>${data.originalTranscription || content}</p>
            </div>
            <div class="translation">
              <h4>Translation (${data.targetLanguage || finalTargetLanguage})</h4>
              <p>${data.translation}</p>
            </div>
          </div>
        `;
      }
      
      if (this.options.statusElement) {
        this.options.statusElement.textContent = `Translation to ${data.targetLanguage || finalTargetLanguage} complete`;
      }
      
    } catch (error) {
      console.error('Translation error:', error);
      
      if (this.options.statusElement) {
        this.options.statusElement.textContent = `Error: ${error.message}`;
      }
      
      if (this.options.resultElement) {
        // Keep showing the original content if translation fails
        this.options.resultElement.innerHTML = `
          <div class="translation-result">
            <div class="original">
              <h4>Original</h4>
              <p>${content}</p>
            </div>
            <div class="translation error">
              <h4>Translation Error</h4>
              <p class="error-message">Failed to translate: ${error.message}</p>
            </div>
          </div>
        `;
      }
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
            <li><strong>Translate to [language]: [your content]</strong> - Translate to a specific language</li>
            <li><strong>Translate this for me</strong> - Translate to English (default)</li>
            <li><strong>List models</strong> or <strong>Show available models</strong> - Lists transcription models</li>
            <li><strong>Help</strong> - Shows this help information</li>
          </ul>
          <p>Translation is flexible - try phrases like "translate this to Japanese" or "can you translate the following to French".</p>
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
