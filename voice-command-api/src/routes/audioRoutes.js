const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

/**
 * @swagger
 * /api/audio/transcribe:
 *   post:
 *     summary: Transcribe audio to text
 *     tags: [Audio]
 *     description: Converts spoken audio to text using OpenAI's Whisper model
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TranscriptionRequest'
 *     responses:
 *       200:
 *         description: Audio successfully transcribed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TranscriptionResponse'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error during transcription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/transcribe', audioController.transcribeAudio);

/**
 * @swagger
 * /api/audio/translate:
 *   post:
 *     summary: Translate audio to a different language
 *     tags: [Audio]
 *     description: Transcribes audio using Whisper and translates the text to a target language using OpenAI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TranslationRequest'
 *     responses:
 *       200:
 *         description: Audio successfully translated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TranslationResponse'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error during translation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/translate', audioController.translateAudio);

/**
 * @swagger
 * /api/audio/models:
 *   get:
 *     summary: Get available transcription models
 *     tags: [Audio]
 *     description: Returns a list of available speech-to-text models
 *     responses:
 *       200:
 *         description: List of available models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "whisper-1"
 *                       name:
 *                         type: string
 *                         example: "Whisper"
 *                       description:
 *                         type: string
 *                         example: "OpenAI's speech-to-text model"
 */
router.get('/models', audioController.getAvailableModels);

module.exports = router;
