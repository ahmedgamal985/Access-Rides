import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import * as CameraPermissions from 'expo-camera';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
// TensorFlow imports removed for web compatibility
// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';
// import '@tensorflow/tfjs-platform-react-native';

interface SignLanguageCameraProps {
  onSignInput: (text: string, field: 'pickup' | 'destination') => void;
  onClose: () => void;
  currentField: 'pickup' | 'destination';
  isDriverCommunication?: boolean;
  driverName?: string;
}

const SignLanguageCamera: React.FC<SignLanguageCameraProps> = ({ onSignInput, onClose, currentField, isDriverCommunication = false, driverName = '' }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [model, setModel] = useState<any | null>(null);
  const [currentFieldState, setCurrentFieldState] = useState<'pickup' | 'destination'>(currentField);
  const cameraRef = useRef<Camera>(null);
  const processingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getCameraPermissions();
    initializeTensorFlow();
  }, []);

  useEffect(() => {
    if (isModelLoaded && hasPermission) {
      startSignLanguageDetection();
    }
    return () => {
      if (processingInterval.current) {
        clearInterval(processingInterval.current);
      }
    };
  }, [isModelLoaded, hasPermission]);

  const getCameraPermissions = async () => {
    try {
      const { status } = await CameraPermissions.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        await Speech.speak('Camera permission granted. Ready to detect signs!', { language: 'en' });
      } else {
        await Speech.speak('Camera permission denied. Please enable camera access.', { language: 'en' });
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      await Speech.speak('Error requesting camera permission', { language: 'en' });
    }
  };

  const initializeTensorFlow = async () => {
    try {
      // Simulate AI model initialization for web compatibility
      console.log('AI model initialization started');
      
      // Simulate model loading
      setTimeout(() => {
        setIsModelLoaded(true);
        console.log('Sign language model loaded (simulated)');
      }, 2000);
      
    } catch (error) {
      console.error('Error initializing AI model:', error);
      Alert.alert('Error', 'Failed to initialize AI model. Please try again.');
    }
  };

  const startSignLanguageDetection = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }

    // Start detection immediately for demo
    setTimeout(async () => {
      if (cameraRef.current && !isProcessing) {
        await captureAndProcessFrame();
      }
    }, 2000); // Process after 2 seconds for demo
  };

  const captureAndProcessFrame = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      console.log('🎥 Capturing frame for sign language detection...');
      setIsProcessing(true);
      
      // Simulate camera processing for demo
      await Speech.speak('Camera is detecting signs...', { language: 'en' });
      
      // Simulate the detection process
      await simulateSignLanguageDetection();
      
    } catch (error) {
      console.error('Error processing frame:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateSignLanguageDetection = async () => {
    let mockSigns;
    
    if (isDriverCommunication) {
      mockSigns = [
        'Hello, I am here',
        'Please wait 5 minutes',
        'I am at the main entrance',
        'Thank you for the ride',
        'I need help with my wheelchair',
        'Can you help me with my bags?',
        'I am ready to go',
        'Please drive slowly'
      ];
    } else {
      mockSigns = [
        '123 Main Street',
        '456 Oak Avenue',
        '789 Pine Road',
        '321 Elm Street',
        '654 Maple Drive',
        '987 Cedar Lane',
        '555 Birch Way',
        '888 Spruce Street'
      ];
    }
    
    const randomSign = mockSigns[Math.floor(Math.random() * mockSigns.length)];
    
    // Always detect for demo
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isDriverCommunication) {
      await Speech.speak(`Message sent to ${driverName}: ${randomSign}`, { language: 'en' });
      Alert.alert('Message Sent', `To ${driverName}: ${randomSign}`, [
        {
          text: 'Send Another',
          onPress: () => {
            // Keep camera open for another message
          }
        },
        {
          text: 'Close',
          onPress: onClose
        }
      ]);
    } else {
      console.log('🎥 Sign language detected for location input:', randomSign, 'field:', currentFieldState);
      await Speech.speak(`Sign detected: ${randomSign}`, { language: 'en' });
      onSignInput(randomSign, currentFieldState);
      onClose();
    }
  };

  const handleFieldToggle = () => {
    Speech.speak(`Now detecting signs for ${currentFieldState} location`, { language: 'en' });
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
            <Text style={styles.loadingText}>Requesting camera permission...</Text>
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
            <Text style={styles.errorText}>Camera permission is required for sign language recognition</Text>
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
        />
        <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {isDriverCommunication ? `Sign Language Chat with ${driverName}` : 'Sign Language Input'}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.instruction}>
                Use sign language to input your {currentFieldState} location
              </Text>
              

              <View style={styles.fieldSelector}>
                <TouchableOpacity
                  style={[
                    styles.fieldButton,
                    currentFieldState === 'pickup' && styles.activeFieldButton
                  ]}
                  onPress={() => setCurrentFieldState('pickup')}
                >
                <MaterialIcons 
                  name="location-on" 
                  size={20} 
                  color={currentFieldState === 'pickup' ? '#007AFF' : '#fff'} 
                />
                  <Text style={[
                    styles.fieldText,
                    currentFieldState === 'pickup' && styles.activeFieldText
                  ]}>
                    Pickup
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.fieldButton,
                    currentFieldState === 'destination' && styles.activeFieldButton
                  ]}
                  onPress={() => setCurrentFieldState('destination')}
                >
                  <MaterialIcons 
                    name="search" 
                    size={20} 
                    color={currentFieldState === 'destination' ? '#007AFF' : '#fff'} 
                  />
                  <Text style={[
                    styles.fieldText,
                    currentFieldState === 'destination' && styles.activeFieldText
                  ]}>
                    Destination
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detectionArea}>
                <View style={styles.detectionFrame}>
                  <Text style={styles.detectionText}>
                    {isProcessing ? 'Processing...' : 'Sign here'}
                  </Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  AI Model: {isModelLoaded ? 'Ready' : 'Loading...'}
                </Text>
                <Text style={styles.statusText}>
                  Detection: {isProcessing ? 'Active' : 'Standby'}
                </Text>
              </View>
            </View>
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instruction: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  fieldSelector: {
    flexDirection: 'row',
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 4,
  },
  fieldButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  activeFieldButton: {
    backgroundColor: '#fff',
  },
  fieldText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  activeFieldText: {
    color: '#007AFF',
  },
  detectionArea: {
    alignItems: 'center',
    marginBottom: 30,
  },
  detectionFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  detectionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
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

export default SignLanguageCamera;
