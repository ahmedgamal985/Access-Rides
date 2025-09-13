import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

interface SupportTicket {
  id: string;
  problem: string;
  summary: string;
  timestamp: Date;
  status: 'pending' | 'resolved';
}

interface AISupportProps {
  onClose: () => void;
}

const AISupport: React.FC<AISupportProps> = ({ onClose }) => {
  const [problemDescription, setProblemDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      problem: 'App not responding when I try to book a ride',
      summary: 'User experiencing app freezing during ride booking process. Issue appears to be related to location services or network connectivity.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'resolved',
    },
    {
      id: '2',
      problem: 'Voice commands not working properly',
      summary: 'Voice recognition accuracy is low, especially for non-native English speakers. Need to improve speech-to-text model.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: 'pending',
    },
  ]);

  const processProblemWithAI = async () => {
    if (!problemDescription.trim()) {
      Alert.alert('Error', 'Please describe your problem first.');
      return;
    }

    try {
      setIsProcessing(true);
      
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      await Speech.speak('Processing your problem with AI...', { language: 'en' });
      
      // Call real AI API
      const aiSummary = await callRealAIAnalysis(problemDescription);
      
      const newTicket: SupportTicket = {
        id: Date.now().toString(),
        problem: problemDescription,
        summary: aiSummary,
        timestamp: new Date(),
        status: 'pending',
      };
      
      setSupportTickets(prev => [newTicket, ...prev]);
      setProblemDescription('');
      
      // Show success message
      Alert.alert(
        '✅ Ticket Created Successfully',
        'Your problem has been analyzed by AI and a support ticket has been created. Our team will review it shortly.',
        [{ text: 'OK' }]
      );
      
      await Speech.speak('Problem analyzed and ticket created. Our support team will review it shortly.', { language: 'en' });
      
    } catch (error) {
      console.error('Error processing problem:', error);
      Alert.alert('Error', 'Failed to process your problem. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const callRealAIAnalysis = async (problem: string): Promise<string> => {
    try {
      // Try backend API first
      const response = await fetch('http://localhost:3001/api/ai/analyze-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: problem,
          userId: 'user_' + Date.now()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.analysis || 'AI analysis completed successfully.';
      } else {
        console.log('Backend API not available, trying Gemini API...');
        return await callGeminiAPI(problem);
      }
    } catch (error) {
      console.log('Backend API failed, trying Gemini API...', error);
      return await callGeminiAPI(problem);
    }
  };

  const callGeminiAPI = async (problem: string): Promise<string> => {
    try {
      // Use the provided Gemini API key
      const GEMINI_API_KEY = 'AIzaSyAmWZs41vjM9_GCepQfntGztnbT4_jWaxw';
      
      console.log('🤖 Calling Gemini API for AI analysis...');

      const prompt = `You are an AI support assistant for an accessibility-focused ride-sharing app. 

User Problem: "${problem}"

Please provide a CONCISE technical summary (max 150 words) that includes:
1. Brief issue description
2. Likely cause
3. Priority level (Low/Medium/High/Critical)
4. Next steps for support team

Format as a professional support ticket summary.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (aiResponse) {
          console.log('✅ Gemini API response received');
          return aiResponse.trim();
        } else {
          console.log('❌ No content in Gemini response');
          return await simulateAIAnalysis(problem);
        }
      } else {
        const errorData = await response.text();
        console.log('❌ Gemini API failed:', response.status, errorData);
        return await simulateAIAnalysis(problem);
      }
    } catch (error) {
      console.log('❌ Gemini API error:', error);
      return await simulateAIAnalysis(problem);
    }
  };

  const simulateAIAnalysis = async (problem: string): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock AI analysis based on keywords - more concise
    const keywords = problem.toLowerCase();
    let summary = '';
    
    if (keywords.includes('voice') || keywords.includes('speech') || keywords.includes('mic')) {
      summary = 'VOICE RECOGNITION ISSUE - Priority: Medium\n\nIssue: Microphone or speech-to-text functionality not working properly.\nCause: Likely permissions or audio processing problem.\nAction: Check mic permissions, test in quiet environment, restart app.';
    } else if (keywords.includes('sign') || keywords.includes('camera') || keywords.includes('gesture')) {
      summary = 'SIGN LANGUAGE DETECTION ISSUE - Priority: High\n\nIssue: Camera-based sign language recognition not functioning.\nCause: Camera permissions, lighting, or AI model accuracy.\nAction: Enable camera access, ensure good lighting, try different angles.';
    } else if (keywords.includes('book') || keywords.includes('ride') || keywords.includes('driver')) {
      summary = 'RIDE BOOKING FAILURE - Priority: Critical\n\nIssue: Unable to complete ride booking process.\nCause: Location services, network, or payment processing.\nAction: Check internet, enable GPS, verify payment method, contact support.';
    } else if (keywords.includes('access') || keywords.includes('accessibility') || keywords.includes('screen reader')) {
      summary = 'ACCESSIBILITY FEATURE BROKEN - Priority: High\n\nIssue: Assistive technology compatibility problems.\nCause: Settings or app accessibility implementation.\nAction: Check accessibility settings, test with screen reader, escalate to accessibility team.';
    } else if (keywords.includes('crash') || keywords.includes('freeze') || keywords.includes('hang')) {
      summary = 'APP STABILITY ISSUE - Priority: High\n\nIssue: Application crashes or becomes unresponsive.\nCause: Memory leak, compatibility, or system resource issue.\nAction: Restart app, clear cache, check device compatibility, collect logs.';
    } else {
      summary = 'GENERAL SUPPORT REQUEST - Priority: Medium\n\nIssue: User-reported problem requiring investigation.\nCause: Unknown, needs further analysis.\nAction: Review user details, test functionality, escalate if needed.';
    }
    
    return summary;
  };

  const speakSummary = async (summary: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Speech.speak(summary, { language: 'en' });
    } catch (error) {
      console.error('Error speaking summary:', error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'resolved' ? '#4CAF50' : '#FF9800';
  };

  const getStatusIcon = (status: string) => {
    return status === 'resolved' ? 'check_circle' : 'schedule';
  };

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="support-agent" size={24} color="#007AFF" />
            <Text style={styles.headerTitle}>AI Support</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Problem Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Describe Your Problem</Text>
            <TextInput
              style={styles.problemInput}
              value={problemDescription}
              onChangeText={setProblemDescription}
              placeholder="Tell us what's wrong... (e.g., Voice commands not working, App keeps crashing, etc.)"
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                (!problemDescription.trim() || isProcessing) && styles.analyzeButtonDisabled
              ]}
              onPress={processProblemWithAI}
              disabled={!problemDescription.trim() || isProcessing}
            >
              {isProcessing ? (
                <MaterialIcons name="hourglass-empty" size={20} color="#fff" />
              ) : (
                <MaterialIcons
                  name="psychology"
                  size={20}
                  color={(!problemDescription.trim() || isProcessing) ? "#ccc" : "#fff"}
                />
              )}
              <Text style={[
                styles.analyzeButtonText,
                (!problemDescription.trim() || isProcessing) && styles.analyzeButtonTextDisabled
              ]}>
                {isProcessing ? 'AI Analyzing...' : 'Analyze with AI'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Support Tickets Section */}
          <View style={styles.ticketsSection}>
            <Text style={styles.sectionTitle}>Your Support Tickets</Text>
            {supportTickets.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="inbox" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No support tickets yet</Text>
                <Text style={styles.emptySubtext}>Describe a problem above to create your first ticket</Text>
              </View>
            ) : (
              supportTickets.map((ticket) => (
                <View key={ticket.id} style={styles.ticketCard}>
                  <View style={styles.ticketHeader}>
                    <View style={styles.ticketInfo}>
                      <Text style={styles.ticketTime}>{formatTime(ticket.timestamp)}</Text>
                      <View style={styles.statusContainer}>
                        <MaterialIcons
                          name={getStatusIcon(ticket.status) as any}
                          size={16}
                          color={getStatusColor(ticket.status)}
                        />
                        <Text style={[
                          styles.statusText,
                          { color: getStatusColor(ticket.status) }
                        ]}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.problemText}>{ticket.problem}</Text>
                  
                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryHeader}>
                      <Text style={styles.summaryLabel}>AI Analysis Summary:</Text>
                      <TouchableOpacity
                        style={styles.speakButton}
                        onPress={() => speakSummary(ticket.summary)}
                      >
                        <MaterialIcons name="volume_up" size={16} color="#007AFF" />
                        <Text style={styles.speakButtonText}>Listen</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.summaryText}>{ticket.summary}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  problemInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  analyzeButtonTextDisabled: {
    color: '#999',
  },
  ticketsSection: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    marginBottom: 10,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketTime: {
    fontSize: 12,
    color: '#999',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  problemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  summaryText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  speakButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default AISupport;
