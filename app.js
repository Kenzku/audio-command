require('dotenv').config();
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// Example endpoint to send audio data to AssemblyAI for speech-to-text
app.post('/analyze-audio', async (req, res) => {
  try {
    // In a real scenario, you would get audio data from req.body or a file upload
    const audioData = req.body.audioData; // Placeholder: base64 or URL to audio file
    
    // AssemblyAI speech-to-text API
    const backendUrl = 'https://api.assemblyai.com/v2/transcript';
    
    // Include your API key in the headers
    const headers = {
      'Authorization': process.env.ASSEMBLY_AI_API_KEY || 'YOUR_ASSEMBLY_AI_API_KEY',
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(backendUrl, { 
      audio_url: audioData, // AssemblyAI expects a URL to the audio file or base64 audio data
      language_code: 'en_us'  
    }, { headers });
    
    res.json({ result: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload audio file endpoint
app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    
    // Process the uploaded file
    // In a real application, you would upload this to a storage service
    // and then send the URL to AssemblyAI
    
    res.json({ 
      message: 'Audio file received',
      fileSize: req.file.size,
      // Normally you would return a URL to the uploaded file
      // audioUrl: 'https://storage.example.com/your-audio-file.mp3'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Node.js Audio AI Backend Connector is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
