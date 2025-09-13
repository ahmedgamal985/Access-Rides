const express = require('express');
const router = express.Router();

// Mock support tickets database
let supportTickets = [
  {
    id: 'ticket_1',
    userId: 'user_1',
    subject: 'Voice commands not working',
    description: 'The voice recognition feature is not responding when I try to book a ride',
    category: 'technical',
    priority: 'high',
    status: 'open',
    aiAnalysis: {
      summary: 'Voice recognition accuracy is low, especially for non-native English speakers. Need to improve speech-to-text model.',
      confidence: 0.85,
      suggestedActions: [
        'Check microphone permissions',
        'Test in quiet environment',
        'Update app if available'
      ],
      estimatedResolutionTime: '2-3 business days'
    },
    createdAt: new Date('2024-01-14T10:30:00Z'),
    updatedAt: new Date('2024-01-14T10:30:00Z'),
    assignedTo: 'support_agent_1',
    responses: [
      {
        id: 'response_1',
        message: 'Thank you for reporting this issue. We are investigating the voice recognition problem.',
        author: 'support_agent_1',
        authorType: 'agent',
        createdAt: new Date('2024-01-14T11:00:00Z')
      }
    ]
  },
  {
    id: 'ticket_2',
    userId: 'user_2',
    subject: 'Sign language recognition needs improvement',
    description: 'The sign language feature is not recognizing my gestures correctly',
    category: 'accessibility',
    priority: 'medium',
    status: 'in_progress',
    aiAnalysis: {
      summary: 'Sign language recognition accuracy is below expected threshold. Lighting conditions and camera angle may be factors.',
      confidence: 0.78,
      suggestedActions: [
        'Ensure good lighting',
        'Check camera permissions',
        'Try different angles'
      ],
      estimatedResolutionTime: '1-2 weeks'
    },
    createdAt: new Date('2024-01-13T15:45:00Z'),
    updatedAt: new Date('2024-01-15T09:20:00Z'),
    assignedTo: 'support_agent_2',
    responses: [
      {
        id: 'response_2',
        message: 'We are working on improving the sign language recognition model. A new update should be available soon.',
        author: 'support_agent_2',
        authorType: 'agent',
        createdAt: new Date('2024-01-15T09:20:00Z')
      }
    ]
  }
];

// Create new support ticket
router.post('/tickets', async (req, res) => {
  try {
    const {
      userId,
      subject,
      description,
      category = 'general',
      priority = 'medium',
      aiAnalysis
    } = req.body;

    // Validate required fields
    if (!userId || !subject || !description) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'userId, subject, and description are required'
      });
    }

    // Create new ticket
    const newTicket = {
      id: `ticket_${Date.now()}`,
      userId,
      subject,
      description,
      category,
      priority,
      status: 'open',
      aiAnalysis: aiAnalysis || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedTo: null,
      responses: []
    };

    supportTickets.push(newTicket);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: newTicket
    });

  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      error: 'Failed to create support ticket',
      message: error.message
    });
  }
});

// Get user's support tickets
router.get('/tickets/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, category, limit = 10, offset = 0 } = req.query;

    let userTickets = supportTickets.filter(ticket => ticket.userId === userId);

    // Apply filters
    if (status) {
      userTickets = userTickets.filter(ticket => ticket.status === status);
    }
    if (category) {
      userTickets = userTickets.filter(ticket => ticket.category === category);
    }

    // Sort by creation date (newest first)
    userTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginatedTickets = userTickets.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      success: true,
      tickets: paginatedTickets,
      total: userTickets.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error getting user tickets:', error);
    res.status(500).json({
      error: 'Failed to get support tickets',
      message: error.message
    });
  }
});

// Get specific ticket
router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = supportTickets.find(t => t.id === ticketId);

    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'The specified support ticket does not exist'
      });
    }

    res.json({
      success: true,
      ticket: ticket
    });

  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).json({
      error: 'Failed to get support ticket',
      message: error.message
    });
  }
});

// Update ticket status
router.patch('/tickets/:ticketId/status', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, assignedTo } = req.body;

    const ticket = supportTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'The specified support ticket does not exist'
      });
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Update ticket
    ticket.status = status;
    ticket.updatedAt = new Date();
    if (assignedTo) {
      ticket.assignedTo = assignedTo;
    }

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      ticket: ticket
    });

  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      error: 'Failed to update ticket status',
      message: error.message
    });
  }
});

// Add response to ticket
router.post('/tickets/:ticketId/responses', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, author, authorType = 'user' } = req.body;

    if (!message || !author) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'message and author are required'
      });
    }

    const ticket = supportTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'The specified support ticket does not exist'
      });
    }

    // Create new response
    const newResponse = {
      id: `response_${Date.now()}`,
      message,
      author,
      authorType,
      createdAt: new Date()
    };

    ticket.responses.push(newResponse);
    ticket.updatedAt = new Date();

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      response: newResponse
    });

  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({
      error: 'Failed to add response',
      message: error.message
    });
  }
});

// Get ticket statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total: supportTickets.length,
      open: supportTickets.filter(t => t.status === 'open').length,
      inProgress: supportTickets.filter(t => t.status === 'in_progress').length,
      resolved: supportTickets.filter(t => t.status === 'resolved').length,
      closed: supportTickets.filter(t => t.status === 'closed').length,
      byCategory: {
        technical: supportTickets.filter(t => t.category === 'technical').length,
        accessibility: supportTickets.filter(t => t.category === 'accessibility').length,
        billing: supportTickets.filter(t => t.category === 'billing').length,
        general: supportTickets.filter(t => t.category === 'general').length
      },
      byPriority: {
        low: supportTickets.filter(t => t.priority === 'low').length,
        medium: supportTickets.filter(t => t.priority === 'medium').length,
        high: supportTickets.filter(t => t.priority === 'high').length,
        critical: supportTickets.filter(t => t.priority === 'critical').length
      },
      averageResolutionTime: calculateAverageResolutionTime(),
      aiAnalysisCoverage: supportTickets.filter(t => t.aiAnalysis).length / supportTickets.length * 100
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

// Search tickets
router.get('/tickets/search', async (req, res) => {
  try {
    const { q, category, status, priority, limit = 10, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Missing search query',
        message: 'Search query (q) is required'
      });
    }

    let filteredTickets = supportTickets;

    // Apply text search
    const searchQuery = q.toLowerCase();
    filteredTickets = filteredTickets.filter(ticket =>
      ticket.subject.toLowerCase().includes(searchQuery) ||
      ticket.description.toLowerCase().includes(searchQuery) ||
      ticket.responses.some(response =>
        response.message.toLowerCase().includes(searchQuery)
      )
    );

    // Apply filters
    if (category) {
      filteredTickets = filteredTickets.filter(ticket => ticket.category === category);
    }
    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }

    // Sort by relevance (newest first for now)
    filteredTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginatedTickets = filteredTickets.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      success: true,
      tickets: paginatedTickets,
      total: filteredTickets.length,
      query: q,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error searching tickets:', error);
    res.status(500).json({
      error: 'Failed to search tickets',
      message: error.message
    });
  }
});

// Helper function to calculate average resolution time
function calculateAverageResolutionTime() {
  const resolvedTickets = supportTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
  
  if (resolvedTickets.length === 0) {
    return 0;
  }

  const totalTime = resolvedTickets.reduce((sum, ticket) => {
    const created = new Date(ticket.createdAt);
    const resolved = new Date(ticket.updatedAt);
    const diffInHours = (resolved - created) / (1000 * 60 * 60);
    return sum + diffInHours;
  }, 0);

  return Math.round(totalTime / resolvedTickets.length);
}

module.exports = router;

