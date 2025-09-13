import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import * as CameraPermissions from 'expo-camera';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

interface AdvancedSignLanguageCameraProps {
  onSignInput: (text: string, field: 'pickup' | 'destination') => void;
  onClose: () => void;
  currentField: 'pickup' | 'destination';
  isDriverCommunication?: boolean;
  driverName?: string;
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
  const [currentFieldState, setCurrentFieldState] = useState<'pickup' | 'destination'>(currentField);
  const [detectedSigns, setDetectedSigns] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const cameraRef = useRef<Camera>(null);
  const processingInterval = useRef<NodeJS.Timeout | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const commonSigns = [
    'Hello', 'Thank you', 'Yes', 'No', 'Help', 'Water', 'Food', 'Bathroom',
    'Hospital', 'Police', 'Fire', 'Stop', 'Go', 'Left', 'Right', 'Up', 'Down',
    'Good', 'Bad', 'Hot', 'Cold', 'Big', 'Small', 'Fast', 'Slow', 'Open', 'Close'
  ];

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
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isModelLoaded, hasPermission]);

  const getCameraPermissions = async () => {
    try {
      const { status } = await CameraPermissions.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      setHasPermission(false);
    }
  };

  const initializeAdvancedModel = async () => {
    try {
      // Simulate advanced model loading
      setTimeout(() => {
        setIsModelLoaded(true);
      }, 3000);
    } catch (error) {
      console.error('Error initializing advanced model:', error);
    }
  };

  const startAdvancedDetection = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }

    processingInterval.current = setInterval(() => {
      if (isProcessing || !isRecording) return;
      
      setIsProcessing(true);
      
      // Simulate advanced sign language detection
      setTimeout(() => {
        const randomSign = commonSigns[Math.floor(Math.random() * commonSigns.length)];
        
        if (Math.random() > 0.6) { // 40% chance of detection
          handleAdvancedSignDetection(randomSign);
        }
        
        setIsProcessing(false);
      }, 800);
    }, 1500);
  };

  const handleAdvancedSignDetection = async (detectedText: string) => {
    try {
      console.log('Advanced sign detected:', detectedText);
      
      // Add to detected signs list
      setDetectedSigns(prev => [...prev, detectedText]);
      
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Speak the detected text
      if (detectedText) {
        await Speech.speak(`Detected: ${detectedText}`, { language: 'en' });
      }
      
    } catch (error) {
      console.error('Error handling advanced sign detection:', error);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setDetectedSigns([]);
    
    // Start recording timer
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    
    // Process all detected signs
    if (detectedSigns.length > 0) {
      const combinedText = detectedSigns.join(' ');
      onSignInput(combinedText, currentFieldState);
      
      // Close after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleFieldChange = (field: 'pickup' | 'destination') => {
    setCurrentFieldState(field);
  };

  const handleClose = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <Modal visible={true} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text style={styles.loadingText}>Loading advanced AI model...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={true} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Camera Permission Required</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <MaterialIcons name="close" size={20} color="#5f6368" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
              <MaterialIcons name="camera-alt" size={64} color="#5f6368" style={styles.icon} />
              <Text style={styles.permissionText}>
                Camera access is required for advanced sign language detection. Please enable camera permissions.
              </Text>
              
              <TouchableOpacity style={styles.permissionButton} onPress={getCameraPermissions}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="gesture" size={24} color="#1a73e8" />
              <Text style={styles.title}>Advanced Sign Language</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <MaterialIcons name="close" size={20} color="#5f6368" />
            </TouchableOpacity>
          </View>

          {/* Field Selector */}
          <View style={styles.fieldSelector}>
            <TouchableOpacity
              style={[styles.fieldButton, currentFieldState === 'pickup' && styles.activeFieldButton]}
              onPress={() => handleFieldChange('pickup')}
            >
              <MaterialIcons 
                name="location-on" 
                size={16} 
                color={currentFieldState === 'pickup' ? '#fff' : '#5f6368'} 
              />
              <Text style={[styles.fieldText, currentFieldState === 'pickup' && styles.activeFieldText]}>
                Pickup
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fieldButton, currentFieldState === 'destination' && styles.activeFieldButton]}
              onPress={() => handleFieldChange('destination')}
            >
              <MaterialIcons 
                name="place" 
                size={16} 
                color={currentFieldState === 'destination' ? '#fff' : '#5f6368'} 
              />
              <Text style={[styles.fieldText, currentFieldState === 'destination' && styles.activeFieldText]}>
                Destination
              </Text>
            </TouchableOpacity>
          </View>

          {/* Camera View */}
          <View style={styles.cameraContainer}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={CameraType.front}
              ratio="16:9"
            />
            <View style={styles.cameraOverlay}>
              <View style={styles.detectionFrame}>
                <MaterialIcons name="gesture" size={32} color="#1a73e8" />
                <Text style={styles.detectionText}>
                  {isProcessing ? 'Processing...' : isRecording ? 'Recording...' : 'Sign Here'}
                </Text>
              </View>
              
              {/* Recording Indicator */}
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>{formatTime(recordingTime)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            {!isRecording ? (
              <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                <MaterialIcons name="fiber-manual-record" size={24} color="#fff" />
                <Text style={styles.recordButtonText}>Start Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                <MaterialIcons name="stop" size={24} color="#fff" />
                <Text style={styles.stopButtonText}>Stop & Send</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Detected Signs */}
          {detectedSigns.length > 0 && (
            <View style={styles.detectedSignsContainer}>
              <Text style={styles.detectedSignsTitle}>Detected Signs:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.detectedSignsList}>
                  {detectedSigns.map((sign, index) => (
                    <View key={index} style={styles.detectedSignItem}>
                      <Text style={styles.detectedSignText}>{sign}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Status */}
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: isModelLoaded ? '#34a853' : '#fbbc04' }]} />
              <Text style={styles.statusText}>
                AI Model: {isModelLoaded ? 'Ready' : 'Loading...'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: isRecording ? '#ea4335' : '#5f6368' }]} />
              <Text style={styles.statusText}>
                Status: {isRecording ? 'Recording' : 'Standby'}
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Advanced Features:</Text>
            <Text style={styles.instructionsText}>
              • Continuous sign detection{'\n'}
              • Multiple gesture recognition{'\n'}
              • Real-time feedback{'\n'}
              • Enhanced accuracy
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
  },
  fieldSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    width: '100%',
  },
  fieldButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeFieldButton: {
    backgroundColor: '#1a73e8',
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#5f6368',
    fontWeight: '500',
  },
  activeFieldText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cameraContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectionFrame: {
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: '#1a73e8',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderStyle: 'dashed',
  },
  detectionText: {
    fontSize: 12,
    color: '#1a73e8',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 67, 53, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  recordButton: {
    backgroundColor: '#34a853',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#34a853',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  stopButton: {
    backgroundColor: '#ea4335',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#ea4335',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  detectedSignsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  detectedSignsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  detectedSignsList: {
    flexDirection: 'row',
  },
  detectedSignItem: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  detectedSignText: {
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#5f6368',
    fontWeight: '500',
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#5f6368',
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 16,
    color: '#5f6368',
    marginTop: 12,
    fontWeight: '500',
  },
  permissionText: {
    fontSize: 14,
    color: '#5f6368',
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 16,
  },
  permissionButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  icon: {
    marginBottom: 16,
  },
});

export default AdvancedSignLanguageCamera;