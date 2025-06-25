# Audio AI Projects

This workspace contains two separate but related projects:

1. **audio-api-backend**: A Node.js backend server that connects to OpenAI's Audio API
2. **audio-transcription-frontend**: A web frontend for recording audio and getting transcriptions

## Getting Started

First, install dependencies for both projects:

### Backend Setup

```bash
cd audio-api-backend
npm install
```

Create a `.env` file in the `audio-api-backend` directory with:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### Frontend Setup

```bash
cd audio-transcription-frontend
npm install
```

## Running the Projects

### Run Backend

```bash
cd audio-api-backend
npm run dev
```

The backend will be available at `http://localhost:3000`.

### Run Frontend

```bash
cd audio-transcription-frontend
npm run dev
```

The frontend will be available at the URL shown in your terminal (typically `http://localhost:5173`).
   - Click stop when finished, then click "Transcribe"

## API Usage
You can also use the API directly by sending a POST request to `/analyze-audio` with base64-encoded audio data:
```json
{
  "audioData": "<base64-encoded-audio-data>"
}
```

## Project Structure
- `index.js` - Main server file with Express configuration and API endpoints
- `public/` - Web interface files
  - `index.html` - Main HTML page
  - `styles.css` - CSS styling
  - `app.js` - Frontend JavaScript for recording and UI interaction
- `.env` - Environment variables (OpenAI API key)
- `test-audio-api.js` - Test script for API functionality
- `download-sample-audio.js` - Helper script to download a sample audio file

## Browser Compatibility
The recording feature works in modern browsers (Chrome, Firefox, Edge, Safari) that support the MediaRecorder API.

## License
MIT
