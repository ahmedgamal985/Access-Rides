const express = require('express');
const router = express.Router();

// Mock chat messages database
let chatMessages = [
  {
    id: 'msg_1',
    rideId: 'ride_1',
    senderId: 'driver_1',
    senderType: 'driver',
    message: 'Hello! I\'m your driver. I\'m on my way to pick you up.',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    messageType: 'text',
    isRead: true
  },
  {
    id: 'msg_2',
    rideId: 'ride_1',
    senderId: 'user_1',
    senderType: 'passenger',
    message: 'Thank you! I\'ll be waiting at the main entrance.',
    timestamp: new Date('2024-01-15T10:31:00Z'),
    messageType: 'text',
    isRead: true
  },
  {
    id: 'msg_3',
    rideId: 'ride_1',
    senderId: 'driver_1',
    senderType: 'driver',
    message: 'I\'m here! Look for a silver Toyota Camry.',
    timestamp: new Date('2024-01-15T10:45:00Z'),
    messageType: 'text',
    isRead: false
  }
];

// Get chat messages for a ride
router.get('/rides/:rideId/messages', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const rideMessages = chatMessages
      .filter(msg => msg.rideId === rideId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      messages: rideMessages,
      total: chatMessages.filter(msg => msg.rideId === rideId).length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      error: 'Failed to get chat messages',
      message: error.message
    });
  }
});

// Send a new message
router.post('/rides/:rideId/messages', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { senderId, senderType, message, messageType = 'text' } = req.body;

    // Validate required fields
    if (!senderId || !senderType || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'senderId, senderType, and message are required'
      });
    }

    // Validate sender type
    const validSenderTypes = ['driver', 'passenger'];
    if (!validSenderTypes.includes(senderType)) {
      return res.status(400).json({
        error: 'Invalid sender type',
        message: 'senderType must be either "driver" or "passenger"'
      });
    }

    // Create new message
    const newMessage = {
      id: `msg_${Date.now()}`,
      rideId,
      senderId,
      senderType,
      message,
      timestamp: new Date(),
      messageType,
      isRead: false
    };

    chatMessages.push(newMessage);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      chatMessage: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
});

// Mark messages as read
router.patch('/rides/:rideId/messages/read', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId, userType } = req.body;

    if (!userId || !userType) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'userId and userType are required'
      });
    }

    // Mark messages as read for the specified user
    const updatedMessages = chatMessages
      .filter(msg => 
        msg.rideId === rideId && 
        msg.senderId !== userId && 
        msg.senderType !== userType
      )
      .map(msg => {
        msg.isRead = true;
        return msg;
      });

    res.json({
      success: true,
      message: 'Messages marked as read',
      updatedCount: updatedMessages.length
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      error: 'Failed to mark messages as read',
      message: error.message
    });
  }
});

// Get unread message count for a user
router.get('/users/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;

    if (!userType) {
      return res.status(400).json({
        error: 'Missing user type',
        message: 'userType query parameter is required'
      });
    }

    const unreadCount = chatMessages.filter(msg => 
      msg.senderId !== userId && 
      msg.senderType !== userType && 
      !msg.isRead
    ).length;

    res.json({
      success: true,
      unreadCount: unreadCount
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      message: error.message
    });
  }
});

// Send voice message (simulated)
router.post('/rides/:rideId/voice-message', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { senderId, senderType, audioUrl, transcription } = req.body;

    if (!senderId || !senderType || !audioUrl) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'senderId, senderType, and audioUrl are required'
      });
    }

    // Create voice message
    const newMessage = {
      id: `msg_${Date.now()}`,
      rideId,
      senderId,
      senderType,
      message: transcription || '[Voice Message]',
      timestamp: new Date(),
      messageType: 'voice',
      audioUrl,
      isRead: false
    };

    chatMessages.push(newMessage);

    res.status(201).json({
      success: true,
      message: 'Voice message sent successfully',
      chatMessage: newMessage
    });

  } catch (error) {
    console.error('Error sending voice message:', error);
    res.status(500).json({
      error: 'Failed to send voice message',
      message: error.message
    });
  }
});

// Get chat history for a user
router.get('/users/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType, limit = 20, offset = 0 } = req.query;

    if (!userType) {
      return res.status(400).json({
        error: 'Missing user type',
        message: 'userType query parameter is required'
      });
    }

    // Get all rides for the user (this would come from the rides service in a real app)
    const userRides = ['ride_1', 'ride_2']; // Mock data

    const userMessages = chatMessages
      .filter(msg => 
        userRides.includes(msg.rideId) && 
        (msg.senderId === userId || msg.senderType !== userType)
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      messages: userMessages,
      total: chatMessages.filter(msg => 
        userRides.includes(msg.rideId) && 
        (msg.senderId === userId || msg.senderType !== userType)
      ).length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      error: 'Failed to get chat history',
      message: error.message
    });
  }
});

// Delete a message (for moderation purposes)
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;

    const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'The specified message does not exist'
      });
    }

    // In a real app, you might want to soft delete or archive the message
    const deletedMessage = chatMessages.splice(messageIndex, 1)[0];

    res.json({
      success: true,
      message: 'Message deleted successfully',
      deletedMessage: deletedMessage,
      reason: reason || 'No reason provided'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      error: 'Failed to delete message',
      message: error.message
    });
  }
});

// Get chat statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalMessages: chatMessages.length,
      messagesByType: {
        text: chatMessages.filter(msg => msg.messageType === 'text').length,
        voice: chatMessages.filter(msg => msg.messageType === 'voice').length,
        image: chatMessages.filter(msg => msg.messageType === 'image').length
      },
      unreadMessages: chatMessages.filter(msg => !msg.isRead).length,
      messagesToday: chatMessages.filter(msg => {
        const today = new Date();
        const messageDate = new Date(msg.timestamp);
        return messageDate.toDateString() === today.toDateString();
      }).length,
      averageResponseTime: calculateAverageResponseTime()
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error getting chat stats:', error);
    res.status(500).json({
      error: 'Failed to get chat statistics',
      message: error.message
    });
  }
});

// Helper function to calculate average response time
function calculateAverageResponseTime() {
  const conversations = {};
  
  // Group messages by ride
  chatMessages.forEach(msg => {
    if (!conversations[msg.rideId]) {
      conversations[msg.rideId] = [];
    }
    conversations[msg.rideId].push(msg);
  });

  let totalResponseTime = 0;
  let responseCount = 0;

  Object.values(conversations).forEach(conversation => {
    // Sort by timestamp
    conversation.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    for (let i = 1; i < conversation.length; i++) {
      const currentMsg = conversation[i];
      const previousMsg = conversation[i - 1];
      
      // If different senders, calculate response time
      if (currentMsg.senderId !== previousMsg.senderId) {
        const responseTime = new Date(currentMsg.timestamp) - new Date(previousMsg.timestamp);
        totalResponseTime += responseTime;
        responseCount++;
      }
    }
  });

  return responseCount > 0 ? Math.round(totalResponseTime / responseCount / 1000 / 60) : 0; // in minutes
}

module.exports = router;

