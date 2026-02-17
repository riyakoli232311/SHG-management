import axios from 'axios';
import DataService from './dataService.js';

/**
 * LLM Service for SakhiSahyog AI Chatbot
 * Integrates with external LLM APIs (OpenAI, Claude, or other providers)
 * Uses RAG (Retrieval Augmented Generation) approach
 */

class LLMService {
  constructor() {
    // Default to using a free/open LLM API
    // You can configure this with environment variables
    this.apiKey = process.env.OPENAI_API_KEY || process.env.CLAUDE_API_KEY || '';
    this.provider = process.env.LLM_PROVIDER || 'openai'; // 'openai', 'claude', 'ollama'
    this.baseURL = this.getBaseURL();
  }

  getBaseURL() {
    switch (this.provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'claude':
        return 'https://api.anthropic.com/v1';
      case 'ollama':
        return process.env.OLLAMA_URL || 'http://localhost:11434';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  /**
   * Generate system prompt with SHG context
   */
  generateSystemPrompt(context, userRole = 'Member') {
    const dashboard = context.dashboard || DataService.getDashboardSummary();
    
    return `You are SakhiSahyog AI, an intelligent assistant for Self Help Groups (SHGs) in India.
Your role is to help ${userRole}s with their SHG-related queries.

CURRENT SHG DATA CONTEXT:
${JSON.stringify(dashboard, null, 2)}

GUIDELINES:
1. Always provide accurate, helpful responses based on the data context provided.
2. Be respectful and culturally sensitive - address users as "Sakhi" (sister/friend).
3. Use simple, clear language that rural women can understand.
4. For financial data, always show amounts in Indian Rupees (₹).
5. If data is not available, say so politely and offer to help with what you know.
6. Encourage financial literacy and women's empowerment in your responses.
7. Keep responses concise but informative.

You can answer questions about:
- Member information and demographics
- Savings and deposits
- Loans and credit
- Repayments and EMIs
- Training and skill development
- SHG management best practices

Respond in a warm, encouraging tone that empowers women.`;
  }

  /**
   * Build conversation history for context
   */
  buildMessages(userQuery, context, conversationHistory = [], userRole = 'Member') {
    const messages = [
      {
        role: 'system',
        content: this.generateSystemPrompt(context, userRole)
      }
    ];

    // Add conversation history (last 5 messages for context)
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-5);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add relevant data context as a system message
    if (Object.keys(context).length > 0) {
      messages.push({
        role: 'system',
        content: `Relevant data for this query: ${JSON.stringify(context, null, 2)}`
      });
    }

    // Add user query
    messages.push({
      role: 'user',
      content: userQuery
    });

    return messages;
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(messages) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      throw error;
    }
  }

  /**
   * Call Claude API
   */
  async callClaude(messages) {
    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          messages: messages
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Claude API Error:', error.message);
      throw error;
    }
  }

  /**
   * Call Ollama (local LLM)
   */
  async callOllama(messages) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/chat`,
        {
          model: 'llama2' || 'mistral',
          messages: messages,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.message.content;
    } catch (error) {
      console.error('Ollama API Error:', error.message);
      throw error;
    }
  }

  /**
   * Generate AI response using RAG approach
   */
  async generateResponse(userQuery, conversationHistory = [], userRole = 'Member') {
    try {
      // Step 1: Retrieve relevant context based on query
      const context = DataService.getContextForQuery(userQuery);

      // Step 2: Build messages with context
      const messages = this.buildMessages(userQuery, context, conversationHistory, userRole);

      // Step 3: Call appropriate LLM provider
      let response;
      
      if (!this.apiKey && this.provider !== 'ollama') {
        // Fallback to mock response if no API key
        return this.generateMockResponse(userQuery, context);
      }

      switch (this.provider) {
        case 'openai':
          response = await this.callOpenAI(messages);
          break;
        case 'claude':
          response = await this.callClaude(messages);
          break;
        case 'ollama':
          response = await this.callOllama(messages);
          break;
        default:
          response = await this.callOpenAI(messages);
      }

      return response;
    } catch (error) {
      console.error('LLM Service Error:', error);
      // Fallback to mock response on error
      return this.generateMockResponse(userQuery, DataService.getContextForQuery(userQuery));
    }
  }

  /**
   * Generate mock response when LLM API is not available
   * This provides basic functionality without external API
   */
  generateMockResponse(query, context) {
    const lowerQuery = query.toLowerCase();
    const dashboard = context.dashboard || DataService.getDashboardSummary();

    // Simple pattern matching for common queries
    if (lowerQuery.includes('total member') || lowerQuery.includes('how many member')) {
      return `Namaste Sakhi! 🙏\n\nOur SHG has **${dashboard.totalMembers} members** across different villages. We're a strong community of women supporting each other!\n\nWould you like to know more about member distribution by village?`;
    }

    if (lowerQuery.includes('total saving') || lowerQuery.includes('how much saved')) {
      return `Hello Sakhi! 💰\n\nOur group has collected a total of **₹${dashboard.totalSavings.toLocaleString()}** in savings. That's amazing progress!\n\nOn average, each member has contributed ₹${dashboard.averageSavingsPerMember.toLocaleString()}.`;
    }

    if (lowerQuery.includes('loan') && (lowerQuery.includes('total') || lowerQuery.includes('how much'))) {
      return `Namaste! 📊\n\nWe've disbursed **₹${dashboard.totalLoansDisbursed.toLocaleString()}** in loans to support our members' businesses and needs.\n\nCurrently, we have ${dashboard.activeLoansCount} active loans being repaid.`;
    }

    if (lowerQuery.includes('repayment') || lowerQuery.includes('emi')) {
      return `Hello Sakhi! 💫\n\nWe've collected **₹${dashboard.totalRepaymentsCollected.toLocaleString()}** in repayments so far.\n\nPending EMIs: ${dashboard.pendingRepayments}\nOverdue EMIs: ${dashboard.overdueRepayments}\n\nLet's ensure timely repayments to keep our SHG financially healthy!`;
    }

    if (lowerQuery.includes('dashboard') || lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
      return `Namaste Sakhi! Here's our SHG summary: 🌟\n\n**Members:** ${dashboard.totalMembers}\n**Total Savings:** ₹${dashboard.totalSavings.toLocaleString()}\n**Loans Disbursed:** ₹${dashboard.totalLoansDisbursed.toLocaleString()}\n**Repayments Collected:** ₹${dashboard.totalRepaymentsCollected.toLocaleString()}\n**Active Loans:** ${dashboard.activeLoansCount}\n\nOur SHG is growing strong! Keep up the great work! 💪`;
    }

    if (lowerQuery.includes('village')) {
      const villageData = Object.entries(dashboard.membersByVillage)
        .map(([village, count]) => `- ${village}: ${count} members`)
        .join('\n');
      return `Namaste! 🏘️\n\nHere are our members by village:\n${villageData}\n\nTogether we're building stronger communities!`;
    }

    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      return `Namaste Sakhi! 🙏\n\nI'm your SakhiSahyog AI assistant. I can help you with:\n\n📊 **Dashboard Overview** - Get SHG summary\n👥 **Member Information** - Total members, village-wise data\n💰 **Savings Data** - Total savings, monthly collections\n💳 **Loan Information** - Active loans, disbursed amounts\n💸 **Repayment Status** - EMIs, pending/overdue payments\n\nWhat would you like to know about?`;
    }

    // Default response
    return `Namaste Sakhi! 🙏\n\nI'm here to help you with information about our SHG. You can ask me about:\n- Member details and statistics\n- Savings and collections\n- Loans and credit\n- Repayments and EMIs\n\nWhat would you like to know?`;
  }
}

export default new LLMService();
