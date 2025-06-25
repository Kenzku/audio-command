// Test script for voice command functionality
// Add this to the end of main.js for testing or in the browser console

function testVoiceCommands() {
  console.log('Testing voice command functionality...');
  
  // Test sample queries to simulate LLM responses
  const testQueries = [
    'I want to transcribe my recording',
    'Show me what models are available',
    'Help me understand how to use this app'
  ];
  
  // Simulate voice commands with the LLM
  async function runTest() {
    console.log('Running tests...');
    const { voiceCommands } = window;
    
    if (!voiceCommands) {
      console.error('Voice command system not initialized');
      return;
    }
    
    // Wait for a bit to simulate real-world timing
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Test each query
    for (const query of testQueries) {
      console.log(`Testing voice command: "${query}"`);
      document.getElementById('status').textContent = `Testing: ${query}`;
      
      await wait(1000);
      
      // Simulate voice command detection
      await voiceCommands.handleGenericCommand(query);
      
      await wait(3000);
    }
    
    console.log('Voice command tests complete');
  }
  
  // Run the test
  runTest().catch(console.error);
}

// Uncomment to run tests automatically
// setTimeout(testVoiceCommands, 3000);

// Add to window for manual testing from console
window.testVoiceCommands = testVoiceCommands;
