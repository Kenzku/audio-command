/**
 * API Discovery Service
 * Fetches and parses the OpenAPI spec from the backend
 */

export class APIDiscoveryService {
  constructor(specUrl) {
    this.specUrl = specUrl;
    this.apiSpec = null;
  }
  
  /**
   * Fetch the OpenAPI spec from the backend
   */
  async fetchAPISpec() {
    try {
      const response = await fetch(this.specUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch API spec: ${response.status}`);
      }
      
      this.apiSpec = await response.json();
      return this.apiSpec;
    } catch (error) {
      console.error('API Discovery Error:', error);
      throw error;
    }
  }
  
  /**
   * Get available endpoints from the API spec
   */
  getAvailableEndpoints() {
    if (!this.apiSpec) {
      throw new Error('API spec not loaded. Call fetchAPISpec() first.');
    }
    
    const endpoints = [];
    const paths = this.apiSpec.paths || {};
    
    // Extract endpoints from the OpenAPI spec
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: details.summary || '',
          description: details.description || '',
          tags: details.tags || [],
          parameters: details.parameters || [],
          requestBody: details.requestBody,
          responses: details.responses
        });
      }
    }
    
    return endpoints;
  }
  
  /**
   * Get endpoint details by path and method
   */
  getEndpointDetails(path, method) {
    if (!this.apiSpec) {
      throw new Error('API spec not loaded. Call fetchAPISpec() first.');
    }
    
    const pathObj = this.apiSpec.paths[path];
    if (!pathObj) {
      throw new Error(`Path ${path} not found in API spec`);
    }
    
    const methodObj = pathObj[method.toLowerCase()];
    if (!methodObj) {
      throw new Error(`Method ${method} not found for path ${path}`);
    }
    
    return {
      ...methodObj,
      path,
      method: method.toUpperCase()
    };
  }
  
  /**
   * Find endpoints by tag
   */
  findEndpointsByTag(tag) {
    return this.getAvailableEndpoints().filter(endpoint => 
      endpoint.tags.includes(tag)
    );
  }
  
  /**
   * Search endpoints by keyword in summary or description
   */
  searchEndpoints(keyword) {
    const lowercaseKeyword = keyword.toLowerCase();
    
    return this.getAvailableEndpoints().filter(endpoint => 
      endpoint.summary.toLowerCase().includes(lowercaseKeyword) ||
      endpoint.description.toLowerCase().includes(lowercaseKeyword)
    );
  }
  
  /**
   * Get API server URLs
   */
  getServerUrls() {
    if (!this.apiSpec) {
      throw new Error('API spec not loaded. Call fetchAPISpec() first.');
    }
    
    return this.apiSpec.servers || [];
  }
  
  /**
   * Get raw OpenAPI spec
   */
  getRawSpec() {
    return this.apiSpec;
  }
}
