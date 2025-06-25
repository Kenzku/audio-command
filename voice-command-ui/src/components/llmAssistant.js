/**
 * LLM Assistant component
 * Integrates with the backend LLM API to provide AI-powered API discovery and usage
 */

export function setupLLMAssistant({
  apiUrl,
  assistantContainer,
  queryInput,
  submitButton,
  resultContainer
}) {
  // Element references
  const assistantPanel = assistantContainer || document.getElementById('llm-assistant');
  const questionInput = queryInput || document.getElementById('llm-query');
  const askButton = submitButton || document.getElementById('llm-submit');
  const responseArea = resultContainer || document.getElementById('llm-response');
  const loadingIndicator = assistantPanel.querySelector('.loading') || document.createElement('div');
  
  // Ensure the loading indicator exists
  if (!assistantPanel.querySelector('.loading')) {
    loadingIndicator.className = 'loading hidden';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Thinking...</p>';
    assistantPanel.appendChild(loadingIndicator);
  }
  
  // Initialize state
  let isWaiting = false;
  
  // Set up event listeners
  if (askButton) {
    askButton.addEventListener('click', handleQuerySubmit);
  }
  
  if (questionInput) {
    questionInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isWaiting) {
        handleQuerySubmit();
      }
    });
  }
  
  /**
   * Handle query submission to the LLM API
   */
  async function handleQuerySubmit() {
    if (isWaiting) return;
    
    const query = questionInput.value.trim();
    if (!query) {
      showError('Please enter a question about using the API');
      return;
    }
    
    // Show loading state
    isWaiting = true;
    loadingIndicator.classList.remove('hidden');
    askButton.disabled = true;
    
    try {
      // Call the LLM API
      const response = await fetch(`${apiUrl}/llm/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.response) {
        displayLLMResponse(data.response);
      } else {
        showError('The assistant couldn\'t answer your question');
      }
      
    } catch (error) {
      console.error('LLM API Error:', error);
      showError(`Error: ${error.message}`);
    } finally {
      // Reset UI state
      isWaiting = false;
      loadingIndicator.classList.add('hidden');
      askButton.disabled = false;
    }
  }
  
  /**
   * Display the LLM response with formatted markdown
   */
  function displayLLMResponse(response) {
    // Format code blocks and API examples
    const formattedResponse = formatLLMResponse(response);
    
    // Display the response
    responseArea.innerHTML = formattedResponse;
    
    // Add syntax highlighting if available
    if (window.hljs) {
      responseArea.querySelectorAll('pre code').forEach((block) => {
        window.hljs.highlightBlock(block);
      });
    }
    
    // Add event listeners to any API action buttons
    responseArea.querySelectorAll('.api-action-btn').forEach(button => {
      button.addEventListener('click', handleAPIAction);
    });
  }
  
  /**
   * Format the LLM response with proper markdown and code highlighting
   */
  function formatLLMResponse(response) {
    // Basic markdown-like formatting
    let formatted = response
      // Code blocks
      .replace(/```(json|javascript|js|bash|shell)?\n([\s\S]*?)```/g, '<pre><code class="$1">$2</code></pre>')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      // Line breaks
      .replace(/\n\n/g, '<br><br>')
      // Detect API endpoints and add action buttons where relevant
      .replace(/((POST|GET|PUT|DELETE) \/api\/[a-zA-Z0-9\/-]+)/g, 
               '<code>$1</code> <button class="api-action-btn" data-endpoint="$1">Try it</button>');
    
    return formatted;
  }
  
  /**
   * Handle clicking on API action buttons
   */
  function handleAPIAction(event) {
    const endpoint = event.target.dataset.endpoint;
    
    // In a real implementation, you would:
    // 1. Parse the endpoint and method
    // 2. Show a form for entering required parameters
    // 3. Call the LLM execute endpoint with the action details
    
    alert(`API Action: ${endpoint}\n\nIn a complete implementation, this would show a form to execute this API call.`);
  }
  
  /**
   * Show error message
   */
  function showError(message) {
    responseArea.innerHTML = `<div class="error">${message}</div>`;
  }
  
  // Return public methods
  return {
    askQuestion: async (query) => {
      questionInput.value = query;
      await handleQuerySubmit();
    },
    getLastResponse: () => responseArea.innerHTML
  };
}
