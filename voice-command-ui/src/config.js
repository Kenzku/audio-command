// Configuration for the Voice Command App
// Change this to match your backend API URL

// Base API URL
const DEV_BASE_URL = 'http://localhost:3000';
const PROD_BASE_URL = 'https://your-production-api.com';

// Use development URL by default
export const BASE_URL = DEV_BASE_URL;

// API endpoints
export const API_URL = `${BASE_URL}/api/audio`;
export const LLM_API_URL = `${BASE_URL}/api/llm`;
export const API_SPEC_URL = `${BASE_URL}/api-spec`;
export const API_DOCS_URL = `${BASE_URL}/api-docs`;

// Default language for transcription
export const DEFAULT_LANGUAGE = 'en';

// Maximum recording time in seconds (0 for unlimited)
export const MAX_RECORDING_TIME = 300; // 5 minutes

// OpenAI Whisper model to use
export const WHISPER_MODEL = 'whisper-1';
