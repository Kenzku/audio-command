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
exports.getAvailableModels = (req, res) => {
  try {
    res.status(200).json({
      models: AVAILABLE_MODELS
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve available models'
    });
  }
};

/**
 * Translate audio to a target language
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.translateAudio = async (req, res) => {
  try {
    // Get data from request body
    const { audioData, content, targetLanguage } = req.body;
    
    // If target language isn't specified, default to English
    const finalTargetLanguage = targetLanguage || 'English';

    let transcription;
    
    // If content is provided directly, use it (front-end already has transcription)
    // Otherwise, transcribe the audio first
    if (content) {
      console.log('Content provided directly, skipping transcription step');
      transcription = content;
    } else if (audioData) {
      // Create temporary file path with .wav extension for compatibility
      const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);
      
      // Write the base64-decoded audio data to the temp file
      fs.writeFileSync(tempFilePath, Buffer.from(audioData, 'base64'));
      
      console.log(`Temporary audio file created at: ${tempFilePath}`);
      
      // Create form data for OpenAI API
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempFilePath));
      formData.append('model', 'whisper-1');
      
      // For translation, we first need to transcribe the audio
      console.log('Sending transcription request to OpenAI...');
      
      // OpenAI Audio API endpoint for transcription
      const openaiEndpoint = 'https://api.openai.com/v1/audio/transcriptions';
      
      // Send request to OpenAI
      const transcriptionResponse = await axios.post(openaiEndpoint, formData, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        }
      });
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
      transcription = transcriptionResponse.data.text;
    } else {
      return res.status(400).json({ 
        success: false,
        error: "Either audio data or content must be provided" 
      });
    }
    
    // Now use the GPT API to translate the transcribed text
    console.log('Sending for translation...');
    
    // Send to OpenAI's Chat API for translation
    const translationResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4', // Using GPT-4 for translation
      messages: [
        {
          role: 'system', 
          content: `You are a professional translator fluent in all languages. Translate the following text to ${finalTargetLanguage}. 
            If the target language is unclear or generic (e.g., just "language" or "another language"), translate to English.
            Maintain the tone, meaning, and style as closely as possible.
            If the text is already in the target language, mention this and return the original text.`
        },
        { 
          role: 'user', 
          content: transcription
        }
      ],
      temperature: 0.3 // Lower temperature for more accurate translations
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const translation = translationResponse.data.choices[0].message.content;
    
    // Return both the original transcription and the translation
    res.status(200).json({
      success: true,
      originalTranscription: transcription,
      translation: translation,
      targetLanguage: finalTargetLanguage,
      metadata: {
        processed_at: new Date().toISOString(),
        transcription_model: 'whisper-1',
        translation_model: 'gpt-4'
      }
    });
    
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.response?.data || "Unknown error"
    });
  }
};
