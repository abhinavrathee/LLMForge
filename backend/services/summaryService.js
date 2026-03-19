// backend/services/summaryService.js
// Generates a real synthesized summary by passing all model responses into an LLM

const puter = require('@heyputer/puter.js').puter;

if (process.env.PUTER_API_KEY) {
  puter.setAuthToken(process.env.PUTER_API_KEY);
}

const normalizeContent = (content) => {
  if (!content) return null;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(block => block && (block.type === 'text' || block.text))
      .map(block => block.text || String(block))
      .join('\n')
      .trim() || String(content);
  }
  return String(content);
};

const generateSummary = async (query, responses) => {
  try {
    // Build a single prompt that includes all model outputs
    const modelSection = responses
      .filter(r => r.answer && !r.answer.startsWith('Error:'))
      .map(r => `### ${r.modelName}\n${r.answer}`)
      .join('\n\n---\n\n');

    if (!modelSection) {
      return 'No valid model responses to summarize.';
    }

    const prompt = `You are an expert AI analyst. Multiple AI models have answered the same question. Your task is to synthesize their responses into a single, concise, and insightful summary that captures the best points from each model.

**User Question:** ${query}

**Model Responses:**
${modelSection}

---

Please write a clear, well-structured synthesis that:
1. Highlights the key points all models agreed on
2. Notes any unique or interesting perspectives from individual models
3. Provides one final actionable conclusion or recommendation

Keep the tone professional and concise. Use markdown formatting for clarity.`;

    const response = await puter.ai.chat(prompt, {
      model: 'gpt-4o',
      temperature: 0.5,
    });

    let summaryText = normalizeContent(
      Array.isArray(response) ? response :
      response?.message?.content || response?.text || response?.content ||
      response?.choices?.[0]?.message?.content || response
    );

    return summaryText || 'Unable to generate synthesis.';
  } catch (error) {
    console.error('Error generating summary:', error?.message || error || 'Unknown error');
    // Graceful fallback: build a simple text summary from the raw responses
    const points = responses
      .filter(r => r.answer && !r.answer.startsWith('Error:'))
      .map(r => `**${r.modelName}:** ${r.answer.substring(0, 200)}...`);
    return points.length > 0
      ? `**Quick Synthesis:**\n\n${points.join('\n\n')}`
      : 'Failed to generate summary.';
  }
};

module.exports = {
  generateSummary,
};
