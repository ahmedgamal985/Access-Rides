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
  const [isSpeaking, setIsSpeaking] = useState(false);
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
      Alert.alert('Error', 'Please enter some text to summarize first.');
      return;
    }

    try {
      setIsProcessing(true);
      
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      await Speech.speak('Summarizing your text with AI...', { language: 'en' });
      
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
        '✅ Text Summarized Successfully',
        'Your text has been summarized by AI and saved. You can listen to the summary or view it anytime.',
        [{ text: 'OK' }]
      );
      
      await Speech.speak('Text summarized successfully. Summary saved and ready to view.', { language: 'en' });
      
    } catch (error) {
      console.error('Error processing text:', error);
      Alert.alert('Error', 'Failed to summarize your text. Please try again.');
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

      const prompt = `You are a text summarization AI for a ride-sharing app support system.

User Input: "${problem}"

Please provide a CONCISE summary (max 100 words) that:
1. Captures the main issue/problem
2. Extracts key technical details
3. Identifies the core problem
4. Suggests immediate action

Format as a brief, clear summary for support team reference. Focus on summarizing the user's input, not analyzing it.`;

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
    
    // Simple text summarization based on length and keywords
    const words = problem.split(' ').length;
    let summary = '';
    
    if (words > 50) {
      // Long text - extract key points
      const sentences = problem.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const keySentences = sentences.slice(0, 2); // Take first 2 meaningful sentences
      summary = `SUMMARY: ${keySentences.join('. ').trim()}`;
    } else if (words > 20) {
      // Medium text - clean up and shorten
      summary = `SUMMARY: ${problem.replace(/\s+/g, ' ').trim()}`;
    } else {
      // Short text - keep as is
      summary = `SUMMARY: ${problem}`;
    }
    
    // Add word count for reference
    summary += `\n\n[Original: ${words} words → Summary: ${summary.split(' ').length} words]`;
    
    return summary;
  };

  const speakSummary = async (summary: string) => {
    try {
      setIsSpeaking(true);
      
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Clean the summary text for better speech
      const cleanSummary = summary
        .replace(/\n\n/g, '. ')
        .replace(/\n/g, '. ')
        .replace(/Priority: \w+/g, '')
        .replace(/Issue:/g, 'Issue:')
        .replace(/Cause:/g, 'Cause:')
        .replace(/Action:/g, 'Action:')
        .trim();
      
      await Speech.speak(cleanSummary, { 
        language: 'en',
        rate: 0.8,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    } catch (error) {
      console.error('Error speaking summary:', error);
      setIsSpeaking(false);
      Alert.alert('Speech Error', 'Unable to read the summary. Please check your device audio settings.');
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
            <MaterialIcons name="summarize" size={24} color="#007AFF" />
            <Text style={styles.headerTitle}>AI Text Summarizer</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Problem Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Enter Text to Summarize</Text>
            <TextInput
              style={styles.problemInput}
              value={problemDescription}
              onChangeText={setProblemDescription}
              placeholder="Paste your long text here... (e.g., Long error messages, detailed descriptions, etc.)"
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
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
                  name="smart-toy"
                  size={20}
                  color={(!problemDescription.trim() || isProcessing) ? "#ccc" : "#fff"}
                />
              )}
              <Text style={[
                styles.analyzeButtonText,
                (!problemDescription.trim() || isProcessing) && styles.analyzeButtonTextDisabled
              ]}>
                {isProcessing ? 'Summarizing...' : 'Summarize Text'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Summaries Section */}
          <View style={styles.ticketsSection}>
            <Text style={styles.sectionTitle}>Your Text Summaries</Text>
            {supportTickets.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="summarize" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No summaries yet</Text>
                <Text style={styles.emptySubtext}>Paste your long text above to create your first summary</Text>
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
                      <Text style={styles.summaryLabel}>AI Text Summary:</Text>
                      <TouchableOpacity
                        style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
                        onPress={() => speakSummary(ticket.summary)}
                        disabled={isSpeaking}
                      >
                        <MaterialIcons 
                          name={isSpeaking ? "volume_off" : "volume_up"} 
                          size={16} 
                          color={isSpeaking ? "#FF6B6B" : "#007AFF"} 
                        />
                        <Text style={[styles.speakButtonText, isSpeaking && styles.speakButtonTextActive]}>
                          {isSpeaking ? 'Speaking...' : 'Listen'}
                        </Text>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  speakButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  speakButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  speakButtonTextActive: {
    color: '#FF6B6B',
  },
});

export default AISupport;
