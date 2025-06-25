# Voice Command Platform

A full-stack application that detects and executes voice commands with AI-driven transcription, translation, and natural language processing. This project demonstrates how to build production-grade AI integrations using modern web technologies.

## Project Overview

This platform consists of two main components:

1. **Backend API (`voice-command-api`)**: Express.js server that integrates with OpenAI's APIs for voice command detection, transcription, and translation.
2. **Frontend Application (`voice-command-ui`)**: Modern Vite.js app with audio recording, visualization, and LLM-powered command detection and execution.

## Key Features

- 🎤 Real-time audio recording with waveform visualization
- 🔤 High-quality transcription using OpenAI's Whisper models
- 🗣️ Natural voice command detection and execution using LLM analysis
- 🌍 Translation to any language with LLM-powered capabilities
- 🤖 AI assistant for API discovery and assistance
- 📊 OpenAPI documentation and Swagger UI

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- OpenAI API key
- Modern web browser with microphone access

### Backend Setup

```bash
cd voice-command-api
npm install
```

Create a `.env` file in the `voice-command-api` directory with:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### Frontend Setup

```bash
cd voice-command-ui
npm install
```

## Running the Projects

### Option 1: Run Both Services with a Single Script

The easiest way to start both the backend and frontend simultaneously:

```bash
./start-dev.sh
```

This script starts both servers in development mode. The backend will be available at `http://localhost:3000` and the frontend at `http://localhost:5173` (or another port if 5173 is in use).

### Option 2: Run Services Individually

#### Run Backend

```bash
cd voice-command-api
npm run dev  # or npm start for production
```

The backend will be available at `http://localhost:3000`.
API docs will be available at `http://localhost:3000/api-docs`.

#### Run Frontend

```bash
cd voice-command-ui
npm run dev  # or npm run build && npm run preview for production
```

The frontend will be available at the URL shown in your terminal (typically `http://localhost:5173`).
   - Click stop when finished, then click "Transcribe"

## API Usage
You can also use the API directly by sending a POST request to `/analyze-command` with base64-encoded audio data:
```json
{
  "audioData": "<base64-encoded-audio-data>"
}
```

## Project Structure

### Main Project
- `.env` - Environment variables (OpenAI API key)
- `index.js` - Main server file with Express configuration and API endpoints
- `start-dev.sh` - Script to start both backend and frontend servers
- `test-voice-command-api.js` - Test script for API functionality
- `download-sample-audio.js` - Helper script to download a sample audio file

### Backend (`voice-command-api/`)
- `src/` - Backend source code
  - `index.js` - Express application entry point
  - `controllers/` - API endpoint controllers
  - `routes/` - API route definitions
  - `config/` - Configuration files including Swagger setup
  - `services/` - Business logic and external API integration

### Frontend (`voice-command-ui/`)
- `index.html` - Main HTML entry point
- `src/` - Frontend source code
  - `main.js` - Application entry point
  - `components/` - UI components and functionality
  - `styles/` - CSS styling
  - `config.js` - Frontend configuration

## Browser Compatibility
The recording feature works in modern browsers (Chrome, Firefox, Edge, Safari) that support the MediaRecorder API.

## License
MIT

## System Architecture

```
┌───────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│ Frontend (Vite.js)│ ──► │ Backend (Express)  │ ──► │ OpenAI APIs     │
└───────────────────┘     └────────────────────┘     └─────────────────┘
         ▲                          ▲                         │
         │                          │                         │
         └──────────────────────────┴─────────────────────────┘
                        Data flow and responses
```

### Component Design

#### Backend Structure
- RESTful API with Express.js
- OpenAPI/Swagger documentation
- Controller-based architecture
- Integration with OpenAI Whisper and Chat APIs

#### Frontend Structure
- Modern modular JavaScript with Vite.js
- Component-based architecture
- Web Audio API for recording and visualization
- LLM-powered command detection and processing

## Voice Command Features

Users can interact with the app using natural voice commands:

1. **Transcription Commands**: 
   - "Transcribe this: [content]"
   - "Can you write down what I say?"

2. **Translation Commands**:
   - "Translate to [language]: [content]"
   - "Translate this for me"
   - "Can you translate the following to [language]"

3. **Utility Commands**:
   - "List models" or "Show available models"
   - "Help" or "Show commands"

## API Documentation

The backend provides the following key endpoints:

- `POST /api/audio/transcribe` - Transcribes audio to text
- `POST /api/audio/translate` - Translates audio to specified language
- `GET /api/audio/models` - Lists available transcription models
- `POST /api/llm/query` - Sends queries to the LLM for API assistance
- `POST /api/llm/execute` - Executes API calls based on LLM interpretation

Complete API documentation is available at `/api-docs` when the backend is running.

## Production Considerations

### Security
- Implement proper authentication and authorization
- Use environment variables for sensitive information
- Set up CORS correctly for production domains

### Performance
- Consider using WebAssembly for audio processing
- Implement caching strategies for API responses
- Use a CDN for static frontend assets

### Scaling
- Deploy backend to containerized environment (Docker)
- Use load balancing for high availability
- Consider implementing a message queue for processing audio in high-load scenarios

### Monitoring
- Add comprehensive logging (Winston, Pino)
- Implement application performance monitoring
- Set up error tracking with services like Sentry

## Developer Documentation

For detailed guides on implementing similar AI features or extending this project, see the [Developer Playbook](./docs/DEVELOPER_PLAYBOOK.md).
