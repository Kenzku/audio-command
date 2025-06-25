const swaggerJsDoc = require('swagger-jsdoc');

// OpenAPI definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Voice Command API',
      version: '1.0.0',
      description: 'API for detecting and executing voice commands using OpenAI technologies',
      contact: {
        name: 'API Support',
        url: 'https://example.com/support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Voice Commands',
        description: 'Voice command detection and execution endpoints',
      },
      {
        name: 'Audio',
        description: 'Audio transcription endpoints',
      },
      {
        name: 'Health',
        description: 'API health check',
      },
      {
        name: 'LLM',
        description: 'Language Model integration for API discovery and usage',
      },
    ],
    components: {
      schemas: {
        TranscriptionRequest: {
          type: 'object',
          required: ['audioData'],
          properties: {
            audioData: {
              type: 'string',
              description: 'Base64 encoded audio data',
              example: 'data:audio/wav;base64,UklGRiQAAABXQVZ...',
            },
            language: {
              type: 'string',
              description: 'Language code (ISO 639-1) for transcription',
              example: 'en',
            },
            prompt: {
              type: 'string',
              description: 'Optional prompt to guide the transcription',
              example: 'This is a meeting about project status.',
            },
          },
        },
        TranscriptionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the transcription was successful',
              example: true,
            },
            transcription: {
              type: 'string',
              description: 'The transcribed text',
              example: 'Hello world, this is a test transcription.',
            },
            metadata: {
              type: 'object',
              properties: {
                processed_at: {
                  type: 'string',
                  format: 'date-time',
                  description: 'When the audio was processed',
                  example: '2025-06-25T12:34:56Z',
                },
              },
            },
          },
        },
        TranslationRequest: {
          type: 'object',
          required: ['audioData', 'targetLanguage'],
          properties: {
            audioData: {
              type: 'string',
              description: 'Base64 encoded audio data',
              example: 'data:audio/wav;base64,UklGRiQAAABXQVZ...',
            },
            targetLanguage: {
              type: 'string',
              description: 'Target language for translation',
              example: 'Spanish',
            },
          },
        },
        TranslationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the translation was successful',
              example: true,
            },
            originalTranscription: {
              type: 'string',
              description: 'The original transcribed text',
              example: 'Hello world, this is a test transcription.',
            },
            translation: {
              type: 'string',
              description: 'The translated text',
              example: 'Hola mundo, esta es una transcripción de prueba.',
            },
            targetLanguage: {
              type: 'string',
              description: 'The language the audio was translated to',
              example: 'Spanish',
            },
            metadata: {
              type: 'object',
              properties: {
                processed_at: {
                  type: 'string',
                  format: 'date-time',
                  description: 'When the audio was processed',
                  example: '2025-06-25T12:34:56Z',
                },
                transcription_model: {
                  type: 'string',
                  description: 'The model used for transcription',
                  example: 'whisper-1',
                },
                translation_model: {
                  type: 'string',
                  description: 'The model used for translation',
                  example: 'gpt-4',
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Always false for error responses',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Failed to process audio data',
            },
            details: {
              type: 'object',
              description: 'Additional error details if available',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'API status',
              example: 'ok',
            },
            message: {
              type: 'string',
              description: 'Status message',
              example: 'Audio API is running',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/index.js'], // paths to files with annotations
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
