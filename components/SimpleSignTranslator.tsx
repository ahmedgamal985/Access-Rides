import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'driver';
  timestamp: Date;
  type: 'text' | 'voice' | 'sign' | 'system';
}

interface SimpleSignTranslatorProps {
  visible: boolean;
  message: Message;
  onClose: () => void;
  onTranslate: (message: Message) => void;
  isTranslating: boolean;
}

const SimpleSignTranslator: React.FC<SimpleSignTranslatorProps> = ({
  visible,
  message,
  onClose,
  onTranslate,
  isTranslating,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const words = message.text.split(' ');
  const currentWord = words[currentWordIndex];

  // قاموس رموز لغة الإشارة البسيط
  const signLanguageSymbols: { [key: string]: string } = {
    'مرحباً': '👋',
    'أنا': '👤',
    'في': '📍',
    'الطريق': '🛣️',
    'إليك': '➡️',
    'الآن': '⏰',
    'أقترب': '🏃‍♂️',
    'من': '📍',
    'موقعك': '📍',
    'سأكون': '👤',
    'هناك': '📍',
    'خلال': '⏱️',
    'دقيقتين': '⏰⏰',
    'وصلت': '✅',
    'أين': '❓',
    'أنت': '👤',
    'بالضبط': '🎯',
    'فهمت': '👍',
    'شكراً': '🙏',
    'لك': '👤',
    'حسناً': '👌',
    'قريباً': '⏰',
    'ممتاز': '⭐',
    'للمعلومة': '📝',
    'تماماً': '✅',
    'رسالتك': '💬',
    'الصوتية': '🎤',
    'إشارتك': '👋',
    'تم': '✅',
    'تأكيد': '✅',
    'الرحلة': '🚗',
    'بنجاح': '🎉',
  };

  // قاموس حركات لغة الإشارة
  const signLanguageGestures: { [key: string]: string[] } = {
    'مرحباً': ['👋', '👋', '👋'],
    'أنا': ['👤', '👆', '👤'],
    'في': ['📍', '👇', '📍'],
    'الطريق': ['🛣️', '➡️', '🛣️'],
    'إليك': ['➡️', '👆', '➡️'],
    'الآن': ['⏰', '👆', '⏰'],
    'أقترب': ['🏃‍♂️', '➡️', '🏃‍♂️'],
    'من': ['📍', '👆', '📍'],
    'موقعك': ['📍', '👆', '📍'],
    'سأكون': ['👤', '👆', '👤'],
    'هناك': ['📍', '👆', '📍'],
    'خلال': ['⏱️', '👆', '⏱️'],
    'دقيقتين': ['⏰', '⏰', '⏰'],
    'وصلت': ['✅', '👆', '✅'],
    'أين': ['❓', '👆', '❓'],
    'أنت': ['👤', '👆', '👤'],
    'بالضبط': ['🎯', '👆', '🎯'],
    'فهمت': ['👍', '👆', '👍'],
    'شكراً': ['🙏', '👆', '🙏'],
    'لك': ['👤', '👆', '👤'],
    'حسناً': ['👌', '👆', '👌'],
    'قريباً': ['⏰', '👆', '⏰'],
    'ممتاز': ['⭐', '👆', '⭐'],
    'للمعلومة': ['📝', '👆', '📝'],
    'تماماً': ['✅', '👆', '✅'],
    'رسالتك': ['💬', '👆', '💬'],
    'الصوتية': ['🎤', '👆', '🎤'],
    'إشارتك': ['👋', '👆', '👋'],
    'تم': ['✅', '👆', '✅'],
    'تأكيد': ['✅', '👆', '✅'],
    'الرحلة': ['🚗', '👆', '🚗'],
    'بنجاح': ['🎉', '👆', '🎉'],
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  useEffect(() => {
    if (isPlaying && currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
        setAnimationPhase(prev => (prev + 1) % 3);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (currentWordIndex >= words.length) {
      setIsPlaying(false);
      setCurrentWordIndex(0);
      setAnimationPhase(0);
    }
  }, [isPlaying, currentWordIndex, words.length]);

  const startTranslation = () => {
    console.log('🎬 Starting sign language translation for:', message.text);
    setIsPlaying(true);
    setCurrentWordIndex(0);
    setAnimationPhase(0);
    
    // تأثير هابتي
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // قراءة النص
    Speech.speak(message.text, { language: 'ar' });
  };

  const stopTranslation = () => {
    setIsPlaying(false);
    setCurrentWordIndex(0);
    setAnimationPhase(0);
    Speech.stop();
  };

  const handleTranslate = () => {
    console.log('💾 Saving translation for message:', message.text);
    onTranslate(message);
  };

  const getCurrentSymbol = () => {
    return signLanguageSymbols[currentWord] || '❓';
  };

  const getCurrentGestures = () => {
    return signLanguageGestures[currentWord] || ['❓', '❓', '❓'];
  };

  const renderSignAnimation = () => {
    const gestures = getCurrentGestures();
    const currentGesture = gestures[animationPhase] || gestures[0];
    
    return (
      <Animated.View
        style={[
          styles.signContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: rotationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }) },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.signSymbol}>
          <Text style={styles.signSymbolText}>{currentGesture}</Text>
        </View>
        <View style={styles.signFrame}>
          <View style={styles.handContainer}>
            <Text style={styles.handSymbol}>✋</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderProgressBar = () => {
    const progress = words.length > 0 ? (currentWordIndex + 1) / words.length : 0;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentWordIndex + 1} / {words.length}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>ترجمة بلغة الإشارة</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Message Text */}
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>

          {/* Sign Animation */}
          <View style={styles.animationContainer}>
            {renderSignAnimation()}
          </View>

          {/* Current Word */}
          <View style={styles.wordContainer}>
            <Text style={styles.currentWord}>
              {isPlaying ? currentWord : 'اضغط "ابدأ الترجمة" لرؤية المعنى'}
            </Text>
            <Text style={styles.wordSymbol}>
              {isPlaying ? getCurrentSymbol() : '👋'}
            </Text>
          </View>

          {/* Progress Bar */}
          {isPlaying && renderProgressBar()}

          {/* Controls */}
          <View style={styles.controlsContainer}>
            {!isPlaying ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={startTranslation}
              >
                <MaterialIcons name="play-arrow" size={24} color="#fff" />
                <Text style={styles.buttonText}>ابدأ الترجمة</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopTranslation}
              >
                <MaterialIcons name="stop" size={24} color="#fff" />
                <Text style={styles.buttonText}>إيقاف</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.translateButton}
              onPress={handleTranslate}
              disabled={isTranslating}
            >
              <MaterialIcons name="translate" size={24} color="#fff" />
              <Text style={styles.buttonText}>
                {isTranslating ? 'جاري الترجمة...' : 'حفظ الترجمة'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Gesture Guide */}
          <View style={styles.guideContainer}>
            <Text style={styles.guideTitle}>دليل الإشارات:</Text>
            <View style={styles.gestureList}>
              {getCurrentGestures().map((gesture, index) => (
                <View
                  key={index}
                  style={[
                    styles.gestureItem,
                    index === animationPhase && styles.activeGesture,
                  ]}
                >
                  <Text style={styles.gestureSymbol}>{gesture}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  messageContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  signContainer: {
    alignItems: 'center',
  },
  signSymbol: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signSymbolText: {
    fontSize: 40,
  },
  signFrame: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  handContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handSymbol: {
    fontSize: 60,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentWord: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  wordSymbol: {
    fontSize: 30,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  guideContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  gestureList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gestureItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeGesture: {
    backgroundColor: '#007AFF',
  },
  gestureSymbol: {
    fontSize: 24,
  },
});

export default SimpleSignTranslator;
