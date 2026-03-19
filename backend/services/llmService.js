// backend/services/llmService.js
// Using @heyputer/puter.js for native SDK model access

const puter = require('@heyputer/puter.js').puter;

// Initialize SDK with the API Key if available
if (process.env.PUTER_API_KEY) {
  puter.setAuthToken(process.env.PUTER_API_KEY);
}

const fetchPuterResponse = async (query, previousTurns = [], modelName = 'claude-3.5-sonnet') => {
  try {
    // Build conversation history from previous turns for context
    const messages = [];
    previousTurns.forEach(turn => {
      messages.push({ role: 'user', content: turn.query });
      if (turn.responses && turn.responses.length > 0) {
        const answer = turn.responses[0].answer;
        messages.push({ role: 'assistant', content: answer });
      }
    });
    // Add current query
    messages.push({ role: 'user', content: query });

    // Call Puter AI Chat via native SDK
    let response;
    // The SDK sometimes accepts array of messages, or just a string prompt with options
    try {
      response = await puter.ai.chat(messages, {
        model: modelName,
        temperature: 0.7,
      });
    } catch {
      // Fallback if messages array is rejected (some versions of SDK might prefer string prompts)
      response = await puter.ai.chat(query, {
        model: modelName,
        temperature: 0.7,
      });
    }

    // Helper to normalize any content format to a plain string
    const normalizeContent = (content) => {
      if (!content) return null;
      if (typeof content === 'string') return content;
      // Handle array of content blocks: [{type: 'text', text: '...'}, ...]
      if (Array.isArray(content)) {
        return content
          .filter(block => block && (block.type === 'text' || block.text))
          .map(block => block.text || String(block))
          .join('\n')
          .trim() || String(content);
      }
      return String(content);
    };

    // Parse the response resiliently (handles string, object, or array content blocks)
    let parsedAnswer = 'No response received';
    if (typeof response === 'string') {
      parsedAnswer = response;
    } else if (Array.isArray(response)) {
      // Top-level response IS an array of content blocks e.g. [{type:'text', text:'...'}]
      parsedAnswer = normalizeContent(response);
    } else if (response?.message?.content) {
      parsedAnswer = normalizeContent(response.message.content);
    } else if (response?.text) {
      parsedAnswer = normalizeContent(response.text);
    } else if (response?.content) {
      parsedAnswer = normalizeContent(response.content);
    } else if (response?.choices?.[0]?.message?.content) {
      parsedAnswer = normalizeContent(response.choices[0].message.content);
    }

    return {
      modelName: modelName,
      answer: parsedAnswer,
    };
  } catch (error) {
    const errorMsg = error?.message || (typeof error === 'string' ? error : 'Unknown Puter API error');
    console.error(`Error fetching Puter ${modelName} response:`, errorMsg);
    return {
      modelName: modelName,
      answer: `Error: ${errorMsg}`,
    };
  }
};


const getLlmResponses = async (query, previousTurns = [], selectedModels = null) => {
  // Use provided models or default to all available models
  const modelsToFetch = selectedModels && selectedModels.length > 0
    ? selectedModels 
    : ['claude-3.5-sonnet', 'gpt-4o-mini', 'mixtral-8x7b-instruct'];

  // Create fetch promises for only the selected models
  const fetchPromises = modelsToFetch.map(model => {
    return fetchPuterResponse(query, previousTurns, model);
  });


  // Call multiple Puter models concurrently for diverse responses
  // All models are free through Puter's platform!
  const results = await Promise.allSettled(fetchPromises);

  // Map results back to the expected array format
  return results
    .map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          modelName: 'AI Model',
          answer: `Error: Unable to fetch response - ${result.reason}`,
        };
      }
    })
    .filter(response => response && response.answer); // Filter out empty responses
};

const getAvailableModels = async () => {
  try {
    const models = await puter.ai.listModels();
    return models.map(m => ({
      id: m.id,
      name: m.name || m.id,
      provider: m.provider || 'unknown',
    }));
  } catch (error) {
    console.error('Error fetching Puter models:', error.message);
    throw error;
  }
};

module.exports = {
  getLlmResponses,
  getAvailableModels
};
