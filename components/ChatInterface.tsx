import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

interface Message {
  id: string;
  text: string;
  isDriver: boolean;
  timestamp: Date;
  isVoice?: boolean;
}

interface ChatInterfaceProps {
  onClose: () => void;
  isDriverCommunication?: boolean;
  driverName?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, isDriverCommunication = false, driverName = 'Driver' }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (isDriverCommunication) {
      return [
        {
          id: '1',
          text: `Hello! I'm ${driverName}, your driver. I'm on my way to pick you up.`,
          isDriver: true,
          timestamp: new Date(),
        },
        {
          id: '2',
          text: 'I\'m here at the pickup location. Please come outside.',
          isDriver: true,
          timestamp: new Date(),
        },
        {
          id: '3',
          text: 'Thank you! I\'m coming out now.',
          isDriver: false,
          timestamp: new Date(),
        },
      ];
    } else {
      return [
        {
          id: '1',
          text: 'Hello! I\'m your AI assistant. How can I help you today?',
          isDriver: true,
          timestamp: new Date(),
        },
        {
          id: '2',
          text: 'I can help you with booking rides, accessibility features, and more.',
          isDriver: true,
          timestamp: new Date(),
        },
      ];
    }
  });
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isDriver: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Simulate driver response
    setTimeout(() => {
      const driverResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Got it! I\'ll be there in 5 minutes.',
        isDriver: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, driverResponse]);
    }, 1000);
  };

  const speakMessage = async (message: Message) => {
    try {
      setIsSpeaking(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      await Speech.speak(message.text, {
        language: 'en',
        pitch: message.isDriver ? 1.0 : 1.1,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Error speaking message:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const startVoiceInput = async () => {
    try {
      setIsListening(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Simulate voice input processing
      await Speech.speak('Listening... Please speak your message.', { language: 'en' });
      
      // In a real implementation, you would use speech recognition here
      setTimeout(() => {
        const mockVoiceInput = 'I\'m at the blue building on the corner';
        setInputText(mockVoiceInput);
        setIsListening(false);
        Speech.speak('Message recognized: ' + mockVoiceInput, { language: 'en' });
      }, 3000);
      
    } catch (error) {
      console.error('Error with voice input:', error);
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    setIsListening(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isDriver ? styles.driverMessage : styles.passengerMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isDriver ? styles.driverBubble : styles.passengerBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isDriver ? styles.driverText : styles.passengerText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            message.isDriver ? styles.driverTimestamp : styles.passengerTimestamp,
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.speakButton}
        onPress={() => speakMessage(message)}
        disabled={isSpeaking}
      >
        <MaterialIcons
          name={isSpeaking ? "volume-up" : "volume-up"}
          size={20}
          color={isSpeaking ? "#007AFF" : "#666"}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="person" size={24} color="#007AFF" />
            <Text style={styles.headerTitle}>
              {isDriverCommunication ? `Chat with ${driverName}` : 'AI Assistant Chat'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isListening && styles.voiceButtonActive
              ]}
              onPressIn={startVoiceInput}
              onPressOut={stopVoiceInput}
              disabled={isSpeaking}
            >
              <MaterialIcons
                name={isListening ? "mic" : "mic"}
                size={24}
                color={isListening ? "#FF3B30" : "#666"}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <MaterialIcons
                name="send"
                size={24}
                color={inputText.trim() ? "#007AFF" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
          
          {isListening && (
            <View style={styles.listeningIndicator}>
              <Text style={styles.listeningText}>Listening... Speak now</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
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
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  driverMessage: {
    justifyContent: 'flex-start',
  },
  passengerMessage: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  driverBubble: {
    backgroundColor: '#e3f2fd',
    borderBottomLeftRadius: 5,
  },
  passengerBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  driverText: {
    color: '#333',
  },
  passengerText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
  },
  driverTimestamp: {
    color: '#666',
  },
  passengerTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  speakButton: {
    padding: 8,
    marginLeft: 5,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    color: '#333',
  },
  voiceButton: {
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  voiceButtonActive: {
    backgroundColor: '#ffebee',
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  listeningIndicator: {
    marginTop: 10,
    alignItems: 'center',
  },
  listeningText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ChatInterface;
