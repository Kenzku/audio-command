// Sample audio download helper
const fs = require('fs');
const https = require('https');

// This script will download a sample audio file for testing
const sampleAudioUrl = 'https://github.com/openai/whisper/raw/main/samples/sample1.wav';
const outputPath = './sample.mp3';

console.log('Downloading sample audio file...');

// Create a writable stream
const file = fs.createWriteStream(outputPath);

// Download the file
https.get(sampleAudioUrl, function(response) {
  response.pipe(file);
  
  // Handle when download is complete
  file.on('finish', () => {
    file.close();
    console.log(`Sample audio downloaded to ${outputPath}`);
    console.log('You can now run test-audio-api.js to test the API');
  });
}).on('error', function(err) {
  // Handle errors
  fs.unlink(outputPath, () => {}); // Delete the file async if there's an error
  console.error('Error downloading sample audio:', err.message);
});
