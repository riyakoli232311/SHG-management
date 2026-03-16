import express from 'express';
import LLMService from '../services/llmService.js';
import DataService from '../services/dataService.js';

const router = express.Router();

// In-memory session store (in production, use Redis or database)
const sessionStore = new Map();

/**
 * @route POST /api/chat
 * @desc Send a message to the AI chatbot
 * @access Public (with session tracking)
 */
router.post('/', async (req, res) => {
  try {
    const { message, sessionId, userRole = 'Member' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Generate session ID if not provided
    const session = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get or create conversation history
    if (!sessionStore.has(session)) {
      sessionStore.set(session, {
        history: [],
        createdAt: new Date(),
        userRole: userRole
      });
    }

    const sessionData = sessionStore.get(session);

    // Generate AI response
    const aiResponse = await LLMService.generateResponse(
      message,
      sessionData.history,
      userRole
    );

    // Update conversation history
    sessionData.history.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse, timestamp: new Date() }
    );

    // Keep only last 20 messages to prevent memory issues
    if (sessionData.history.length > 20) {
      sessionData.history = sessionData.history.slice(-20);
    }

    res.json({
      success: true,
      data: {
        response: aiResponse,
        sessionId: session,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      message: error.message
    });
  }
});

/**
 * @route GET /api/chat/history/:sessionId
 * @desc Get conversation history for a session
 * @access Public
 */
router.get('/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionData = sessionStore.get(sessionId);

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: {
        history: sessionData.history,
        createdAt: sessionData.createdAt
      }
    });

  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve history'
    });
  }
});

/**
 * @route DELETE /api/chat/history/:sessionId
 * @desc Clear conversation history for a session
 * @access Public
 */
router.delete('/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (sessionStore.has(sessionId)) {
      sessionStore.delete(sessionId);
    }

    res.json({
      success: true,
      message: 'Conversation history cleared'
    });

  } catch (error) {
    console.error('Clear History Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear history'
    });
  }
});

/**
 * @route POST /api/chat/quick-reply
 * @desc Get quick reply suggestions based on context
 * @access Public
 */
router.post('/quick-reply', async (req, res) => {
  try {
    const { context } = req.body;
    
    // Predefined quick replies based on common SHG queries
    const quickReplies = [
      { label: 'Total Members', query: 'How many members do we have?' },
      { label: 'Total Savings', query: 'What is our total savings?' },
      { label: 'Active Loans', query: 'How many active loans do we have?' },
      { label: 'Pending EMIs', query: 'Show pending repayments' },
      { label: 'Dashboard Summary', query: 'Give me a dashboard overview' },
      { label: 'Village-wise Members', query: 'Show members by village' }
    ];

    res.json({
      success: true,
      data: { quickReplies }
    });

  } catch (error) {
    console.error('Quick Reply Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get quick replies'
    });
  }
});

/**
 * @route GET /api/chat/context
 * @desc Get current SHG context/data for the chatbot
 * @access Public
 */
router.get('/context', (req, res) => {
  try {
    const context = DataService.getDashboardSummary();
    
    res.json({
      success: true,
      data: context
    });

  } catch (error) {
    console.error('Get Context Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve context'
    });
  }
});

export default router;
