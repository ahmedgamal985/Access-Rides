import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

interface AdvancedSignLanguageCameraProps {
  onSignInput: (text: string, field: 'pickup' | 'destination') => void;
  onClose: () => void;
  currentField: 'pickup' | 'destination';
  isDriverCommunication?: boolean;
  driverName?: string;
}

interface PosePoint {
  x: number;
  y: number;
  confidence: number;
}

interface SignGesture {
  id: string;
  name: string;
  points: PosePoint[];
  timestamp: number;
}

interface SignWritingSymbol {
  symbol: string;
  position: { x: number; y: number };
  rotation: number;
}

const AdvancedSignLanguageCamera: React.FC<AdvancedSignLanguageCameraProps> = ({ 
  onSignInput, 
  onClose, 
  currentField, 
  isDriverCommunication = false, 
  driverName = '' 
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<SignGesture | null>(null);
  const [gestureHistory, setGestureHistory] = useState<SignGesture[]>([]);
  const [signWritingSymbols, setSignWritingSymbols] = useState<SignWritingSymbol[]>([]);
  const [detectedText, setDetectedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);
  
  const cameraRef = useRef<Camera>(null);
  const processingInterval = useRef<NodeJS.Timeout | null>(null);
  const gestureStartTime = useRef<number>(0);
  const animationValue = useRef(new Animated.Value(0)).current;

  // Sign language vocabulary for different contexts
  const signVocabulary = {
    locations: [
      { sign: 'HOME', gesture: 'fist-tap-chest', meaning: 'Home' },
      { sign: 'HOSPITAL', gesture: 'cross-arms', meaning: 'Hospital' },
      { sign: 'STATION', gesture: 'point-forward', meaning: 'Station' },
      { sign: 'AIRPORT', gesture: 'arms-spread', meaning: 'Airport' },
      { sign: 'SCHOOL', gesture: 'book-gesture', meaning: 'School' },
      { sign: 'MALL', gesture: 'shopping-gesture', meaning: 'Mall' },
      { sign: 'PARK', gesture: 'tree-gesture', meaning: 'Park' },
      { sign: 'RESTAURANT', gesture: 'eating-gesture', meaning: 'Restaurant' },
    ],
    communication: [
      { sign: 'HELLO', gesture: 'wave', meaning: 'Hello' },
      { sign: 'THANK_YOU', gesture: 'thumbs-up', meaning: 'Thank you' },
      { sign: 'WAIT', gesture: 'stop-palm', meaning: 'Please wait' },
      { sign: 'HELP', gesture: 'help-gesture', meaning: 'I need help' },
      { sign: 'READY', gesture: 'thumbs-up', meaning: 'I am ready' },
      { sign: 'SLOW', gesture: 'slow-motion', meaning: 'Please drive slowly' },
      { sign: 'STOP', gesture: 'stop-sign', meaning: 'Stop here' },
      { sign: 'GO', gesture: 'point-forward', meaning: 'Let\'s go' },
    ]
  };

  useEffect(() => {
    getCameraPermissions();
    initializeAdvancedModel();
  }, []);

  useEffect(() => {
    if (isModelLoaded && hasPermission) {
      startAdvancedDetection();
    }
    return () => {
      if (processingInterval.current) {
        clearInterval(processingInterval.current);
      }
    };
  }, [isModelLoaded, hasPermission]);

  useEffect(() => {
    // Animate confidence indicator
    Animated.timing(animationValue, {
      toValue: confidence / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [confidence]);

  const getCameraPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        await Speech.speak('Advanced sign language recognition ready!', { language: 'en' });
      } else {
        await Speech.speak('Camera permission required for sign language recognition', { language: 'en' });
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };

  const initializeAdvancedModel = async () => {
    try {
      console.log('Initializing advanced sign language model...');
      
      // Simulate advanced model loading with pose detection capabilities
      setTimeout(() => {
        setIsModelLoaded(true);
        console.log('Advanced sign language model loaded');
        Speech.speak('Advanced sign language model ready', { language: 'en' });
      }, 3000);
      
    } catch (error) {
      console.error('Error initializing advanced model:', error);
      Alert.alert('Error', 'Failed to initialize advanced sign language model');
    }
  };

  const startAdvancedDetection = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }

    if (isRealTimeMode) {
      // Real-time detection
      processingInterval.current = setInterval(() => {
        if (cameraRef.current && !isProcessing) {
          captureAndAnalyzeFrame();
        }
      }, 100); // 10 FPS for real-time detection
    } else {
      // Manual recording mode
      setTimeout(async () => {
        if (cameraRef.current && !isProcessing) {
          await startGestureRecording();
        }
      }, 2000);
    }
  };

  const captureAndAnalyzeFrame = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Simulate pose detection and gesture recognition
      const poseData = await simulatePoseDetection();
      const gesture = await analyzeGesture(poseData);
      
      if (gesture && gesture.confidence > 0.7) {
        setCurrentGesture(gesture);
        setConfidence(gesture.confidence * 100);
        
        // Add to gesture history
        setGestureHistory(prev => [...prev.slice(-4), gesture]);
        
        // Generate SignWriting symbols
        generateSignWritingSymbols(gesture);
        
        // Try to recognize the complete sign
        await recognizeCompleteSign();
      }
      
    } catch (error) {
      console.error('Error analyzing frame:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePoseDetection = async (): Promise<PosePoint[]> => {
    // Simulate pose detection with 21 hand landmarks
    const landmarks: PosePoint[] = [];
    for (let i = 0; i < 21; i++) {
      landmarks.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        confidence: 0.8 + Math.random() * 0.2
      });
    }
    return landmarks;
  };

  const analyzeGesture = async (poseData: PosePoint[]): Promise<SignGesture | null> => {
    // Simulate gesture analysis
    const gestures = isDriverCommunication ? signVocabulary.communication : signVocabulary.locations;
    const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
    
    return {
      id: Date.now().toString(),
      name: randomGesture.sign,
      points: poseData,
      timestamp: Date.now()
    };
  };

  const generateSignWritingSymbols = (gesture: SignGesture) => {
    // Generate SignWriting symbols based on gesture
    const symbols: SignWritingSymbol[] = gesture.points.map((point, index) => ({
      symbol: getSignWritingSymbol(gesture.name, index),
      position: { x: point.x, y: point.y },
      rotation: Math.random() * 360
    }));
    
    setSignWritingSymbols(symbols);
  };

  const getSignWritingSymbol = (signName: string, index: number): string => {
    // Map sign names to SignWriting symbols
    const symbolMap: { [key: string]: string[] } = {
      'HOME': ['🏠', '👆', '📍'],
      'HOSPITAL': ['🏥', '➕', '🏥'],
      'STATION': ['🚉', '➡️', '🚉'],
      'HELLO': ['👋', '👋', '👋'],
      'THANK_YOU': ['👍', '❤️', '👍'],
      'WAIT': ['✋', '⏰', '✋'],
    };
    
    const symbols = symbolMap[signName] || ['✋', '👆', '✋'];
    return symbols[index % symbols.length];
  };

  const recognizeCompleteSign = async () => {
    if (gestureHistory.length < 3) return;
    
    // Analyze gesture sequence
    const recentGestures = gestureHistory.slice(-3);
    const signSequence = recentGestures.map(g => g.name).join(' ');
    
    // Find matching sign in vocabulary
    const vocabulary = isDriverCommunication ? signVocabulary.communication : signVocabulary.locations;
    const matchedSign = vocabulary.find(sign => 
      signSequence.includes(sign.sign) || sign.gesture.includes(signSequence.toLowerCase())
    );
    
    if (matchedSign && confidence > 80) {
      setDetectedText(matchedSign.meaning);
      await Speech.speak(`Sign detected: ${matchedSign.meaning}`, { language: 'en' });
      
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const startGestureRecording = async () => {
    setIsRecording(true);
    gestureStartTime.current = Date.now();
    
    await Speech.speak('Recording gesture... Make your sign now', { language: 'en' });
    
    // Record for 3 seconds
    setTimeout(async () => {
      await stopGestureRecording();
    }, 3000);
  };

  const stopGestureRecording = async () => {
    setIsRecording(false);
    
    if (currentGesture) {
      await recognizeCompleteSign();
    }
    
    await Speech.speak('Gesture recording complete', { language: 'en' });
  };

  const handleSignInput = async () => {
    if (detectedText) {
      await Speech.speak(`Sending: ${detectedText}`, { language: 'en' });
      onSignInput(detectedText, currentField);
      onClose();
    }
  };

  const toggleRecordingMode = () => {
    setIsRealTimeMode(!isRealTimeMode);
    Speech.speak(isRealTimeMode ? 'Manual recording mode' : 'Real-time mode', { language: 'en' });
  };

  const clearGestureHistory = () => {
    setGestureHistory([]);
    setSignWritingSymbols([]);
    setDetectedText('');
    setConfidence(0);
    Speech.speak('Gesture history cleared', { language: 'en' });
  };

  const handleClose = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    onClose();
  };

  if (hasPermission === null) {
    return (
      <Modal visible={true} transparent={true} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.loadingText}>Initializing advanced sign language recognition...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={true} transparent={true} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.errorText}>Camera permission required for advanced sign language recognition</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={getCameraPermissions}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          type={CameraType.front}
          ref={cameraRef}
        >
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isDriverCommunication ? `Advanced Sign Chat with ${driverName}` : 'Advanced Sign Language Input'}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Control Panel */}
            <View style={styles.controlPanel}>
              <TouchableOpacity 
                style={[styles.controlButton, isRealTimeMode && styles.activeControlButton]}
                onPress={toggleRecordingMode}
              >
                <MaterialIcons 
                  name={isRealTimeMode ? "visibility" : "videocam"} 
                  size={20} 
                  color={isRealTimeMode ? "#007AFF" : "#fff"} 
                />
                <Text style={[styles.controlText, isRealTimeMode && styles.activeControlText]}>
                  {isRealTimeMode ? 'Real-time' : 'Manual'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.controlButton}
                onPress={clearGestureHistory}
              >
                <MaterialIcons name="clear" size={20} color="#fff" />
                <Text style={styles.controlText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Detection Area */}
            <View style={styles.detectionArea}>
              <View style={styles.detectionFrame}>
                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>REC</Text>
                  </View>
                )}
                
                {/* SignWriting Symbols Overlay */}
                {signWritingSymbols.map((symbol, index) => (
                  <View
                    key={index}
                    style={[
                      styles.signWritingSymbol,
                      {
                        left: symbol.position.x,
                        top: symbol.position.y,
                        transform: [{ rotate: `${symbol.rotation}deg` }]
                      }
                    ]}
                  >
                    <Text style={styles.symbolText}>{symbol.symbol}</Text>
                  </View>
                ))}
                
                <Text style={styles.detectionText}>
                  {isProcessing ? 'Analyzing...' : isRecording ? 'Recording...' : 'Sign here'}
                </Text>
              </View>
            </View>

            {/* Status Panel */}
            <View style={styles.statusPanel}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Model:</Text>
                <Text style={styles.statusValue}>{isModelLoaded ? 'Ready' : 'Loading...'}</Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Confidence:</Text>
                <View style={styles.confidenceBar}>
                  <Animated.View 
                    style={[
                      styles.confidenceFill,
                      { width: animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })}
                    ]} 
                  />
                </View>
                <Text style={styles.statusValue}>{Math.round(confidence)}%</Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Detected:</Text>
                <Text style={styles.statusValue}>{detectedText || 'None'}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            {detectedText && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSignInput}
                >
                  <MaterialIcons name="send" size={24} color="#fff" />
                  <Text style={styles.sendButtonText}>Send: {detectedText}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Gesture History */}
            {gestureHistory.length > 0 && (
              <View style={styles.gestureHistory}>
                <Text style={styles.historyTitle}>Recent Gestures:</Text>
                <View style={styles.historyList}>
                  {gestureHistory.slice(-3).map((gesture, index) => (
                    <View key={gesture.id} style={styles.historyItem}>
                      <Text style={styles.historyText}>{gesture.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Camera>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeControlButton: {
    backgroundColor: '#fff',
  },
  controlText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
  },
  activeControlText: {
    color: '#007AFF',
  },
  detectionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detectionFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    position: 'relative',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  recordingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  signWritingSymbol: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 20,
    color: '#007AFF',
  },
  detectionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  statusPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  statusValue: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  gestureHistory: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  historyTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  historyText: {
    color: '#fff',
    fontSize: 12,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default AdvancedSignLanguageCamera;
