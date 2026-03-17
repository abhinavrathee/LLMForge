// backend/controllers/queryController.js
const { getLlmResponses, getAvailableModels } = require('../services/llmService');
const { generateSummary } = require('../services/summaryService');
const QueryHistory = require('../models/QueryHistory');

// @description   Process a user query, get LLM responses, summarize, and save
// @route         POST /api/query
const createQuery = async (req, res) => {
  try {
    const { query, sessionId, selectedModels } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Use selectedModels from request, or default to all models
    const modelsToUse = selectedModels && selectedModels.length > 0 
      ? selectedModels 
      : ['claude-3.5-sonnet', 'gpt-4o-mini', 'mixtral-8x7b-instruct'];

    let chatSession = null;
    let previousTurns = [];

    // If a sessionId is provided, fetch the existing chat session
    if (sessionId) {
      chatSession = await QueryHistory.findOne({ _id: sessionId, userId: req.user._id });
      if (!chatSession) {
         return res.status(404).json({ error: 'Chat session not found' });
      }
      previousTurns = chatSession.turns;
    }

    // Send the user's question to selected LLM providers in parallel
    // Pass previous turns for conversational context
    const responses = await getLlmResponses(query, previousTurns, modelsToUse);

    // This service collects all model outputs
    // and formats them before sending them to the summarizer
    const finalSummary = await generateSummary(query, responses);

    const newTurn = {
      query,
      responses,
      finalSummary,
    };

    if (chatSession) {
      // Append to existing session
      chatSession.turns.push(newTurn);
      const savedHistory = await chatSession.save();
      return res.status(200).json(savedHistory);
    } else {
      // Create new session
      const newQueryHistory = new QueryHistory({
        userId: req.user._id,
        title: query.length > 40 ? query.substring(0, 40) + '...' : query,
        turns: [newTurn],
      });

      const savedHistory = await newQueryHistory.save();
      return res.status(201).json(savedHistory);
    }
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Failed to fetch model responses' });
  }
};

// @description   Get past queries and their responses
// @route         GET /api/history
const getHistory = async (req, res) => {
  try {
    const history = await QueryHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch query history' });
  }
};

// @description   Delete a specific query from history
// @route         DELETE /api/history/:id
const deleteQuery = async (req, res) => {
  try {
    const queryId = req.params.id;
    const deletedQuery = await QueryHistory.findOneAndDelete({ _id: queryId, userId: req.user._id });

    if (!deletedQuery) {
      return res.status(404).json({ error: 'Query not found or not authorized to delete' });
    }

    res.status(200).json({ message: 'Query deleted successfully', id: queryId });
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).json({ error: 'Failed to delete query' });
  }
};

// @description   Get all dynamic live models from Puter.js
// @route         GET /api/query/models
const getModelsList = async (req, res) => {
  try {
    const models = await getAvailableModels();
    res.status(200).json(models);
  } catch (error) {
    console.error('Error fetching models list:', error);
    res.status(500).json({ error: 'Failed to fetch dynamic models list' });
  }
};

module.exports = {
  createQuery,
  getHistory,
  deleteQuery,
  getModelsList,
};
