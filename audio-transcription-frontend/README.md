# Audio Transcription Frontend

A modern web interface for speech recording and OpenAI-powered transcription.

## Features

- 🎙️ Real-time audio recording with visualization
- 🌊 Waveform visualization of audio input
- 📝 Transcription using OpenAI's Whisper model
- 📋 Copy transcription results to clipboard

## Getting Started

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Update API configuration:**
   - Open `src/config.js` and update the API URL to match your backend

3. **Start development server:**
   ```
   npm run dev
   ```

4. **Build for production:**
   ```
   npm run build
   ```

## Project Structure

- `src/` - Source code
  - `components/` - UI components
    - `audioRecorder.js` - Audio recording functionality
    - `transcriptionUI.js` - Transcription display and interaction
    - `visualizer.js` - Audio visualization
  - `styles/` - CSS styles
  - `config.js` - Application configuration
  - `main.js` - Application entry point

## Connecting to Backend

This frontend connects to the audio-api-backend. Make sure the backend server is running at the URL specified in `src/config.js`.

## License

MIT
