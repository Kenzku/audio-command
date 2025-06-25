const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Available transcription models
 * @type {Array}
 */
const AVAILABLE_MODELS = [
  {
    id: 'whisper-1',
    name: 'Whisper',
    description: 'OpenAI\'s speech-to-text model optimized for transcription'
  },
  {
    id: 'whisper-multilingual',
    name: 'Whisper Multilingual',
    description: 'Optimized for multiple languages and accents'
  }
];

/**
 * Controller for audio transcription using OpenAI's API
 */
exports.transcribeAudio = async (req, res) => {
  try {
    // Get audio data from request body
    const { audioData, language, prompt } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ 
        success: false,
        error: "No audio data provided" 
      });
    }

    // Create temporary file path with .wav extension for compatibility
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);
    
    // Write the base64-decoded audio data to the temp file
    fs.writeFileSync(tempFilePath, Buffer.from(audioData, 'base64'));
    
    console.log(`Temporary audio file created at: ${tempFilePath}`);
    
    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath));
    formData.append('model', 'whisper-1');
    
    // Additional optional parameters
    if (req.body.language) {
      formData.append('language', req.body.language);
    }
    
    if (req.body.prompt) {
      formData.append('prompt', req.body.prompt);
    }
    
    console.log('Sending request to OpenAI...');
    
    // OpenAI Audio API endpoint for transcription
    const openaiEndpoint = 'https://api.openai.com/v1/audio/transcriptions';
    
    // Send request to OpenAI
    const response = await axios.post(openaiEndpoint, formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      }
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    // Return the transcription result
    res.status(200).json({
      success: true, 
      transcription: response.data.text,
      metadata: {
        processed_at: new Date().toISOString(),
        model: 'whisper-1',
        language: req.body.language || 'auto-detect'
      }
    });
    
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.response?.data || "Unknown error"
    });
  }
};

/**
 * Get available transcription models
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAvailableModels = async (req, res) => {
  try {
    // Return list of available models
    // In a production environment, this could fetch from OpenAI's API
    res.status(200).json({
      models: AVAILABLE_MODELS,
      default_model: 'whisper-1',
      capabilities: {
        languages: [
          { code: 'en', name: 'English' },
          { code: 'es', name: 'Spanish' },
          { code: 'fr', name: 'French' },
          { code: 'de', name: 'German' },
          { code: 'zh', name: 'Chinese' },
          { code: 'ja', name: 'Japanese' }
        ],
        features: [
          'transcription',
          'translation',
          'speaker-identification'
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve available models',
      details: error.message
    });
  }
};
