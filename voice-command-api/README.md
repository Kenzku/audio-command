# Voice Command Detection & Execution API

A production-grade backend API that detects and executes voice commands, providing transcription, translation and LLM-based services built on top of OpenAI technologies.

## Features

- 🗣️ RESTful API endpoints for voice command detection and execution
- 🎤 Audio transcription with high accuracy
- 🌍 Multi-language translation support with GPT-4
- 📚 Integration with OpenAI's Whisper model for state-of-the-art speech-to-text
- 🤖 LLM-powered command analysis and execution
- 📋 Comprehensive OpenAPI/Swagger documentation
- ⚙️ Environment-based configuration for development/production flexibility
- 🔒 Security best practices implementation
- ✅ Built with scalability in mind

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in the project root with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development  # or production
   ```

3. **Start the server:**
   - For development:
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

4. **Access the API:**
   - API base URL: `http://localhost:3000/api/audio`
   - OpenAPI documentation: `http://localhost:3000/api-docs`
   - OpenAPI specification: `http://localhost:3000/api-spec`
   
## API Documentation

### Audio Endpoints

#### Transcribe Audio
```
POST /api/audio/transcribe
```

**Request Body:**
```json
{
  "audioData": "base64_encoded_audio_data",
  "language": "en"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "transcription": "Your transcribed text appears here",
  "metadata": {
    "processed_at": "2025-06-25T10:30:00Z",
    "model": "whisper-1",
    "language": "en"
  }
}
```

#### Translate Audio
```
POST /api/audio/translate
```

**Request Body:**
```json
{
  "audioData": "base64_encoded_audio_data",
  "targetLanguage": "Spanish",
  "content": "Text to translate"  // Optional, if already transcribed
}
```

**Response:**
```json
{
  "success": true,
  "originalTranscription": "Original transcribed text",
  "translation": "Translated text",
  "targetLanguage": "Spanish",
  "metadata": {
    "processed_at": "2025-06-25T10:35:00Z",
    "transcription_model": "whisper-1",
    "translation_model": "gpt-4"
  }
}
```

#### List Available Models
```
GET /api/audio/models
```

**Response:**
```json
{
  "models": [
    {
      "id": "whisper-1",
      "name": "Whisper",
      "description": "OpenAI's speech-to-text model optimized for transcription"
    },
    {
      "id": "whisper-multilingual",
      "name": "Whisper Multilingual",
      "description": "Optimized for multiple languages and accents"
    }
  ]
}
```

### LLM Endpoints

#### Query LLM
```
POST /api/llm/query
```

**Request Body:**
```json
{
  "query": "How do I use the translation API?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "To use the translation API, send a POST request to /api/audio/translate with..."
}
```

## Project Structure

```
src/
├── controllers/
│   ├── audioController.js    # Audio processing logic
│   └── llmController.js      # LLM interaction logic
├── routes/
│   ├── audioRoutes.js        # Audio endpoint definitions
│   └── llmRoutes.js          # LLM endpoint definitions
├── config/
│   └── swagger.js            # OpenAPI configuration
├── middleware/
│   └── errorHandler.js       # Error handling middleware
└── index.js                  # Application entry point
```

## Development

### Code Style

This project follows standard Node.js/JavaScript best practices:
- ES6+ syntax
- Async/await for asynchronous operations
- Error handling with try/catch blocks
- JSDoc comments for documentation

### Testing

Run tests with:
```bash
npm test
```

## Production Deployment

### Recommendations

1. **Environment Variables**:
   - Use a secure method for storing the OpenAI API key in production
   - Configure proper NODE_ENV, PORT settings

2. **Security**:
   - Set up proper CORS configuration for your production domain
   - Add rate limiting to prevent abuse
   - Implement API authentication for production

3. **Performance**:
   - Consider using a process manager like PM2
   - Set up monitoring and logging
   - Implement load balancing for high-traffic applications

### Docker Deployment

A Dockerfile is provided for containerized deployment:

```bash
# Build the Docker image
docker build -t audio-api .

# Run the container
docker run -p 3000:3000 --env-file .env audio-api
```

## License

MIT
