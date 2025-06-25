const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Simple test script to demonstrate using the voice command API endpoint
 */
async function testVoiceCommandApi() {
  try {
    // Path to a sample audio file (replace with your own audio file)
    // For testing, you can use any .mp3 or .wav file
    const audioPath = path.join(__dirname, 'sample.mp3'); 
    
    // Check if sample file exists
    if (!fs.existsSync(audioPath)) {
      console.log('⚠️  Sample voice command audio file not found. Please create a sample.mp3 file first.');
      console.log('💡 Tip: You can use any short audio clip for testing.');
      console.log('   Run: node download-sample-audio.js');
      return;
    }
    
    console.log('🎙️  Sending voice command to API for transcription and analysis...');
    
    // Get file info
    const stats = fs.statSync(audioPath);
    console.log(`Voice command file size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Read and convert the audio file to base64
    const audioBuffer = fs.readFileSync(audioPath);
    const base64Audio = audioBuffer.toString('base64');
    console.log(`Base64 length: ${base64Audio.length} characters`);
    
    console.log('Method 1: Testing with direct base64 in JSON...');
    // Send request to our local API endpoint using base64
    const response1 = await axios.post('http://localhost:3000/analyze-command', {
      audioData: base64Audio
    });
    
    console.log('✅ API Response (base64):');
    console.log(JSON.stringify(response1.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testVoiceCommandApi();
