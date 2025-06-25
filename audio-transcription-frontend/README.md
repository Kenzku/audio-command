# Audio Transcription & Translation Frontend

A production-grade, modern web application for audio recording, transcription, translation, and AI-powered voice command processing.

## Features

- 🎙️ Real-time audio recording with professional-grade UI/UX
- 🌊 Dynamic waveform visualization of audio input
- 📝 High-quality transcription using OpenAI's Whisper model
- 🌍 Translation to any language with LLM-powered capabilities
- 🤖 AI assistant for API discovery and guidance
- 🗣️ Natural voice command detection using LLM analysis
- 📱 Responsive design for both desktop and mobile use
- 🎨 Modern, accessible UI with intuitive controls

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update API configuration:**
   - Open `src/config.js` and update the API URLs to match your backend:
   ```javascript
   export const API_URL = 'http://localhost:3000/api/audio';
   export const LLM_API_URL = 'http://localhost:3000/api/llm';
   export const API_SPEC_URL = 'http://localhost:3000/api-spec';
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/
│   ├── audioRecorder.js       # Audio recording functionality
│   ├── transcriptionUI.js     # Transcription display and controls
│   ├── visualizer.js          # Audio visualization component
│   ├── llmAssistant.js        # AI assistant interface
│   ├── commandAnalyzer.js     # Voice command processing
│   └── voiceCommands.js       # Voice command detection
├── services/
│   └── apiDiscovery.js        # API discovery service
├── styles/
│   ├── main.css               # Main application styles
│   ├── llmAssistant.css       # AI assistant specific styles
│   └── voiceCommands.css      # Voice command specific styles
├── config.js                  # API URLs and configuration
└── main.js                    # Application entry point
```

## Voice Command Features

The application supports natural language voice commands. Users can:

1. **Transcribe content:** 
   - "Transcribe this: [content]"
   - "Can you write down what I say?"

2. **Translate content:**
   - "Translate this to [language]: [content]"
   - "Translate to Japanese: Hello world"
   - "Can you translate this for me?"

3. **Get help and information:**
   - "List models" or "Show available models"
   - "Help" or "What commands can I use?"

Commands are automatically detected after recording stops - no need to explicitly activate a command mode.

## Component Architecture

### Audio Recorder

The audio recorder component handles:
- Microphone access and permissions
- Real-time recording with MediaRecorder API
- Audio chunk collection and processing
- Automatic voice command detection after recording

```javascript
// Example usage
const recorder = setupRecorder({
  recordButton: document.getElementById('recordButton'),
  stopButton: document.getElementById('stopButton'),
  statusElement: document.getElementById('status')
});

// Public API
recorder.startRecording();
recorder.stopRecording();
recorder.getAudioBlob();
```

### Command Analyzer

The command analyzer uses LLM to intelligently process speech:
- Transcribes audio using backend API
- Sends transcription to LLM for command detection
- Parses and executes detected commands
- Updates UI based on command results

```javascript
// Example usage
const analyzer = initCommandAnalyzer({
  apiUrl: API_URL,
  llmApiUrl: LLM_API_URL,
  resultElement: document.getElementById('result')
});

// Process an audio recording
analyzer.analyzeRecording(audioBlob);
```

## Development Guidelines

### Adding New Voice Commands

To add new voice command types:

1. Update the `commandTypes` object in `commandAnalyzer.js`:

```javascript
this.options = {
  commandTypes: {
    TRANSCRIBE: 'transcribe',
    TRANSLATE: 'translate',
    NEW_COMMAND: 'new_command',
    // ...
  }
}
```

2. Update the LLM prompt in `parseTranscriptionWithLLM()` to detect the new command

3. Add a case to `executeCommand()` method:

```javascript
case commandTypes.NEW_COMMAND:
  await this.executeNewCommand(parsedCommand.content);
  break;
```

4. Implement the execution method:

```javascript
async executeNewCommand(content) {
  // Implementation here
}
```

### Custom Styling

The application uses CSS variables for theming. To customize the app's appearance:

```css
:root {
  --primary: #4f46e5;      /* Main accent color */
  --secondary: #10b981;    /* Secondary accent color */
  --background: #f9fafb;   /* Page background */
  --text: #1f2937;         /* Text color */
  /* Add more custom variables as needed */
}
```

## Production Deployment

### Build Optimization

The production build process optimizes assets:
- JavaScript bundling and tree shaking
- CSS minification
- Image optimization

### Hosting Recommendations

1. **Static Hosting Options:**
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront

2. **Configuration:**
   - Update API URLs to production endpoints
   - Ensure proper CORS configuration on backend
   - Configure caching strategies for static assets

3. **Security Considerations:**
   - Use HTTPS for all API communications
   - Implement proper error handling
   - Consider adding user authentication if necessary

## Browser Compatibility

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest version)

Mobile browsers with Web Audio API support are also compatible.

## License

MIT
