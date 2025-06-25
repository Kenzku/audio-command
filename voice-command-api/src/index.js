const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const audioRoutes = require('./routes/audioRoutes');
const llmRoutes = require('./routes/llmRoutes');

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY environment variable not set');
}

// Middlewares
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Documentation - Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css'
}));

// API Description in JSON format (OpenAPI spec)
app.get('/api-spec', (req, res) => {
  res.json(swaggerDocs);
});

// API Routes
app.use('/api/audio', audioRoutes);
app.use('/api/llm', llmRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags: [Health]
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: API is running properly
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Audio API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Audio API Backend server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/audio`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`OpenAPI specification at http://localhost:${PORT}/api-spec`);
});
