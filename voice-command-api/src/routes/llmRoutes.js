const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmController');

/**
 * @swagger
 * /api/llm/query:
 *   post:
 *     summary: Query the LLM with your question about the API
 *     tags: [LLM]
 *     description: Ask a question about how to use the API and get AI-generated guidance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: The question or task you want help with regarding the API
 *                 example: "How can I transcribe an audio file?"
 *     responses:
 *       200:
 *         description: LLM response with API usage guidance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   description: LLM's response with API guidance
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     model:
 *                       type: string
 *                       example: "gpt-3.5-turbo"
 *                     processed_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error processing LLM request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/query', llmController.queryLLM);

/**
 * @swagger
 * /api/llm/execute:
 *   post:
 *     summary: Execute API action based on LLM recommendation
 *     tags: [LLM]
 *     description: Describe what you want to do with the API and this endpoint will execute the appropriate API action
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: What you want to do with the API
 *                 example: "Transcribe an audio recording of my meeting"
 *               action:
 *                 type: object
 *                 description: Action details for execution (optional, if not provided will return recommendation)
 *     responses:
 *       200:
 *         description: Action execution result or recommendation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 executed:
 *                   type: boolean
 *                 recommendation:
 *                   type: string
 *                   description: LLM's recommendation if action not provided
 *                 result:
 *                   type: string
 *                   description: Result of the executed action
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error during execution
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/execute', llmController.executeLLMAction);

module.exports = router;
