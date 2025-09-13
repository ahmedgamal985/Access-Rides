import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import VoiceRecorder from './VoiceRecorder';
import AdvancedSignLanguageCamera from './AdvancedSignLanguageCamera';
import SimpleSignTranslator from './SimpleSignTranslator';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'driver';
  timestamp: Date;
  type: 'text' | 'voice' | 'sign' | 'system';
  isTranslated?: boolean;
  signLanguageGif?: string;
}

interface DriverChatInterfaceProps {
  visible: boolean;
  onClose: () => void;
  driverName: string;
  driverInfo: {
    name: string;
    rating: number;
    vehicle: string;
    eta: string;
    phone: string;
  };
}

const DriverChatInterface: React.FC<DriverChatInterfaceProps> = ({
  visible,
  onClose,
  driverName,
  driverInfo,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSignLanguageMode, setIsSignLanguageMode] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showSignTranslator, setShowSignTranslator] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // محاكاة رسائل السائق
  useEffect(() => {
    if (visible) {
      console.log('💬 DriverChatInterface opened for:', driverName);
      
      // رسالة ترحيب
      const welcomeMessage: Message = {
        id: '1',
        text: `مرحباً! أنا ${driverName}، سأكون معك خلال ${driverInfo.eta}`,
        sender: 'driver',
        timestamp: new Date(),
        type: 'text',
      };

      // رسالة النظام
      const systemMessage: Message = {
        id: '2',
        text: 'تم تأكيد الرحلة بنجاح',
        sender: 'driver',
        timestamp: new Date(),
        type: 'system',
      };

      setMessages([welcomeMessage, systemMessage]);

      // محاكاة رسائل السائق التلقائية
      setTimeout(() => {
        addDriverMessage('أنا في الطريق إليك الآن');
      }, 3000);

      setTimeout(() => {
        addDriverMessage('أقترب من موقعك، سأكون هناك خلال دقيقتين');
      }, 8000);

      setTimeout(() => {
        addDriverMessage('وصلت! أين أنت بالضبط؟');
      }, 15000);
    }
  }, [visible]);

  const addDriverMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'driver',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string, type: 'text' | 'voice' | 'sign' = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addUserMessage(inputText);
      setInputText('');
      
      // محاكاة رد السائق
      setTimeout(() => {
        const responses = [
          'فهمت، شكراً لك',
          'حسناً، سأكون هناك قريباً',
          'ممتاز، شكراً للمعلومة',
          'فهمت تماماً',
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addDriverMessage(randomResponse);
      }, 1000);
    }
  };

  const handleVoiceInput = (text: string) => {
    addUserMessage(text, 'voice');
    setIsVoiceMode(false);
    
    // محاكاة رد السائق
    setTimeout(() => {
      addDriverMessage('فهمت رسالتك الصوتية، شكراً لك');
    }, 1000);
  };

  const handleSignLanguageInput = (text: string) => {
    addUserMessage(text, 'sign');
    setIsSignLanguageMode(false);
    
    // محاكاة رد السائق
    setTimeout(() => {
      addDriverMessage('فهمت إشارتك، شكراً لك');
    }, 1000);
  };

  const handleMessagePress = (message: Message) => {
    if (message.sender === 'driver' && message.type === 'text') {
      console.log('🎬 Opening sign translator for message:', message.text);
      setSelectedMessage(message);
      setShowSignTranslator(true);
    }
  };

  const handleTranslateToSign = (message: Message) => {
    setIsTranslating(true);
    
    // محاكاة الترجمة
    setTimeout(() => {
      const translatedMessage = {
        ...message,
        isTranslated: true,
        signLanguageGif: getSignLanguageGif(message.text),
      };
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? translatedMessage : msg
        )
      );
      
      setIsTranslating(false);
      setShowSignTranslator(false);
      setSelectedMessage(null);
      
      // تأثير هابتي
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 2000);
  };

  const getSignLanguageGif = (text: string): string => {
    // محاكاة GIFs لغة الإشارة
    const gifMap: { [key: string]: string } = {
      'مرحباً': 'https://media.giphy.com/media/hello-sign.gif',
      'أنا في الطريق': 'https://media.giphy.com/media/on-the-way.gif',
      'أقترب من موقعك': 'https://media.giphy.com/media/approaching.gif',
      'وصلت': 'https://media.giphy.com/media/arrived.gif',
      'أين أنت': 'https://media.giphy.com/media/where-are-you.gif',
      'شكراً لك': 'https://media.giphy.com/media/thank-you.gif',
      'فهمت': 'https://media.giphy.com/media/understood.gif',
    };
    
    return gifMap[text] || 'https://media.giphy.com/media/default-sign.gif';
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <TouchableOpacity
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.driverMessage,
          isSystem && styles.systemMessage,
        ]}
        onPress={() => handleMessagePress(message)}
        disabled={!isUser && message.type !== 'text'}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>
            {isUser ? 'أنت' : isSystem ? 'النظام' : driverName}
          </Text>
          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString('ar-EG', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        
        <View style={styles.messageContent}>
          {message.type === 'voice' && (
            <MaterialIcons name="mic" size={16} color="#666" style={styles.messageIcon} />
          )}
          {message.type === 'sign' && (
            <MaterialIcons name="gesture" size={16} color="#666" style={styles.messageIcon} />
          )}
          
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.driverMessageText,
            isSystem && styles.systemMessageText,
          ]}>
            {message.text}
          </Text>
          
          {message.isTranslated && message.signLanguageGif && (
            <View style={styles.signLanguageContainer}>
              <Text style={styles.signLanguageLabel}>ترجمة بلغة الإشارة:</Text>
              <View style={styles.gifContainer}>
                <Text style={styles.gifPlaceholder}>🎬 GIF: {message.text}</Text>
              </View>
            </View>
          )}
        </View>
        
        {message.sender === 'driver' && message.type === 'text' && !message.isTranslated && (
          <View style={styles.translateHint}>
            <MaterialIcons name="translate" size={12} color="#007AFF" />
            <Text style={styles.translateHintText}>اضغط لترجمة بلغة الإشارة</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.driverInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{driverName.charAt(0)}</Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{driverName}</Text>
              <Text style={styles.driverRating}>⭐ {driverInfo.rating}</Text>
              <Text style={styles.driverVehicle}>{driverInfo.vehicle}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="اكتب رسالة..."
              placeholderTextColor="#999"
              multiline
            />
            
            <TouchableOpacity
              style={[styles.actionButton, isVoiceMode && styles.activeButton]}
              onPress={() => setIsVoiceMode(true)}
            >
              <MaterialIcons name="mic" size={24} color={isVoiceMode ? "#fff" : "#666"} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, isSignLanguageMode && styles.activeButton]}
              onPress={() => setIsSignLanguageMode(true)}
            >
              <MaterialIcons name="gesture" size={24} color={isSignLanguageMode ? "#fff" : "#666"} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <MaterialIcons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Voice Recorder Modal */}
        {isVoiceMode && (
          <VoiceRecorder
            onVoiceInput={handleVoiceInput}
            onClose={() => setIsVoiceMode(false)}
            currentField="pickup"
          />
        )}

        {/* Sign Language Camera Modal */}
        {isSignLanguageMode && (
          <AdvancedSignLanguageCamera
            onSignInput={handleSignLanguageInput}
            onClose={() => setIsSignLanguageMode(false)}
            currentField="pickup"
            isDriverCommunication={true}
            driverName={driverName}
          />
        )}

        {/* Sign Language Translator Modal */}
        {showSignTranslator && selectedMessage && (
          <SimpleSignTranslator
            visible={showSignTranslator}
            message={selectedMessage}
            onClose={() => {
              setShowSignTranslator(false);
              setSelectedMessage(null);
            }}
            onTranslate={handleTranslateToSign}
            isTranslating={isTranslating}
          />
        )}
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

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
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  driverRating: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  driverVehicle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  driverMessage: {
    alignSelf: 'flex-start',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    padding: 10,
    maxWidth: '90%',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageIcon: {
    marginRight: 5,
    marginTop: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  userMessageText: {
    color: '#fff',
  },
  driverMessageText: {
    color: '#333',
  },
  systemMessageText: {
    color: '#007AFF',
    textAlign: 'center',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 12,
    alignSelf: 'flex-end',
  },
  driverMessage: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  signLanguageContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  signLanguageLabel: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  gifContainer: {
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifPlaceholder: {
    fontSize: 14,
    color: '#666',
  },
  translateHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  translateHintText: {
    fontSize: 10,
    color: '#007AFF',
    marginLeft: 4,
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
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DriverChatInterface;
