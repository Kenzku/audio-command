const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer(); // For handling file uploads

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY environment variable not set');
}

// Increase JSON payload limit to 50MB
app.use(express.json({ limit: '50mb' }));
// Support URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Serve static files from the 'public' directory
app.use(express.static('public'));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Example endpoint to send audio data to an audio AI backend
app.post('/analyze-command', async (req, res) => {
  try {
    // Get audio data from the request body
    const audioData = req.body.audioData;
    if (!audioData) {
      return res.status(400).json({ error: "No audio data provided" });
    }

    // Create temporary file from base64 data
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    
    // Create a temporary file path - use .wav extension for compatibility
    const tempFilePath = path.join(os.tmpdir(), `voice-command-${Date.now()}.wav`);
    
    // Write the base64-decoded audio data to the temp file
    fs.writeFileSync(tempFilePath, Buffer.from(audioData, 'base64'));
    
    console.log(`Temporary audio file created at: ${tempFilePath}`);
    
    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath));
    formData.append('model', 'whisper-1');
    
    console.log('Sending request to OpenAI...');
    
    // OpenAI Audio API for transcription
    const backendUrl = 'https://api.openai.com/v1/audio/transcriptions';
    
    // Send request to OpenAI
    const response = await axios.post(backendUrl, formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      }
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    // Return the transcription result
    res.json({ transcription: response.data.text });
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data
    });
  }
});

app.get('/', (req, res) => {
  // Serve the HTML interface
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Open your browser to http://localhost:${PORT} to use the Voice Command Platform UI`);
});
