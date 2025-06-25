const axios = require('axios');
const swaggerDocs = require('../config/swagger');

/**
 * Controller for LLM integration that allows autonomous API usage
 */

/**
 * Sends a message to OpenAI API for LLM assistance
 * @param {string} message - User query for the LLM
 * @param {object} apiSpec - OpenAPI specification (optional, will use the system's spec if not provided)
 * @returns {Promise<object>} - LLM response with recommended API actions
 */
async function getLLMResponse(message, apiSpec = null) {
  try {
    const spec = apiSpec || swaggerDocs;
    const openaiEndpoint = 'https://api.openai.com/v1/chat/completions';

    // Create system prompt with the OpenAPI spec
    const systemPrompt = `You are an AI assistant that helps users interact with an Audio Transcription API.
The API has the following OpenAPI specification. Use this to determine which endpoints to call:
${JSON.stringify(spec, null, 2)}
Always analyze the API spec to determine the correct endpoints, parameters, and response formats. When recommending actions, 
provide the exact endpoint URL, HTTP method, required parameters, and explain why this endpoint is appropriate.`;

    const response = await axios.post(openaiEndpoint, {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      result: response.data.choices[0].message.content,
      metadata: {
        model: response.data.model,
        processed_at: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('LLM API Error:', error.response?.data || error.message);
    throw new Error(`Failed to get LLM response: ${error.message}`);
  }
}

/**
 * Query the LLM with the API spec for autonomous usage
 */
exports.queryLLM = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false,
        error: "No query provided" 
      });
    }

    const llmResponse = await getLLMResponse(query);
    
    res.status(200).json({
      success: true,
      response: llmResponse.result,
      metadata: llmResponse.metadata
    });
    
  } catch (error) {
    console.error('LLM Error:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.response?.data || "Unknown error"
    });
  }
};

/**
 * Execute an API call based on LLM recommendations
 */
exports.executeLLMAction = async (req, res) => {
  try {
    const { query, action } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false,
        error: "No query provided" 
      });
    }

    // First get LLM recommendation if action not provided
    let actionToExecute = action;
    if (!actionToExecute) {
      const llmResponse = await getLLMResponse(query);
      // Here we could parse the LLM response to extract the recommended action
      // For now we'll just return the recommendation
      return res.status(200).json({
        success: true,
        recommendation: llmResponse.result,
        metadata: {
          note: "To execute this action, call this endpoint again with the 'action' parameter containing execution details"
        }
      });
    }

    // Execute the action (in a production environment, you would implement a safe way to execute API actions)
    res.status(200).json({
      success: true,
      executed: true,
      action: actionToExecute,
      result: "Action execution simulated successfully",
      note: "This is a placeholder. In production, implement secure action execution logic."
    });
    
  } catch (error) {
    console.error('LLM Action Error:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.response?.data || "Unknown error"
    });
  }
};
