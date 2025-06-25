# Audio Transcription API

This is the backend API for the Audio Transcription application, providing an interface to OpenAI's Audio APIs.

## Features

- RESTful API endpoints for audio transcription
- Integration with OpenAI's Whisper model for speech-to-text
- CORS enabled for frontend integration
- Environment-based configuration

## Getting Started

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in the project root with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

3. **Start the server:**
   ```
   # Production mode
   npm start
   
   # Development mode (auto-restart on file changes)
   npm run dev
   ```

## API Endpoints

### POST /api/audio/transcribe

Transcribes audio data to text using OpenAI's Whisper model.

**Request Body:**
```json
{
  "audioData": "[base64_encoded_audio]",
  "language": "en" // optional, defaults to auto-detection
}
```

**Response:**
```json
{
  "success": true,
  "transcription": "Your transcribed text here...",
  "metadata": {
    "processed_at": "2025-06-25T10:30:00Z"
  }
}
```

### GET /api/health

Health check endpoint to verify the API is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Audio API is running"
}
```

## Project Structure

- `src/` - Source code
  - `index.js` - Main application entry point
  - `controllers/` - API controllers
  - `routes/` - API route definitions
- `.env` - Environment configuration

## License

MIT
