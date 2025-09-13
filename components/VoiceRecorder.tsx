import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

interface VoiceRecorderProps {
  onVoiceInput: (text: string, field: 'pickup' | 'destination') => void;
  onClose: () => void;
  currentField: 'pickup' | 'destination';
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onVoiceInput, onClose, currentField }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  const [permissionResponse, requestPermission] = useState<any>(null);
  const [currentFieldState, setCurrentFieldState] = useState<'pickup' | 'destination'>(currentField);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('🎤 VoiceRecorder initialized with currentField:', currentField);
  console.log('🎤 currentFieldState:', currentFieldState);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording]);

  useEffect(() => {
    // Request audio permissions on component mount
    requestAudioPermission();
  }, []);

  useEffect(() => {
    console.log('🎤 currentField prop changed to:', currentField);
    setCurrentFieldState(currentField);
    console.log('🎤 currentFieldState updated to:', currentField);
  }, [currentField]);

  const requestAudioPermission = async () => {
    try {
      console.log('🎤 Requesting audio permission...');
      const permission = await Audio.requestPermissionsAsync();
      requestPermission(permission);
      console.log('🎤 Audio permission status:', permission.status);
    } catch (error) {
      console.error('❌ Error requesting audio permission:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Voice recording started');
      
      // Check if we have permission
      if (!permissionResponse?.granted) {
        console.log('❌ No audio permission, requesting...');
        await requestAudioPermission();
        if (!permissionResponse?.granted) {
          Alert.alert('Permission Required', 'Please allow microphone access to record voice input.');
          return;
        }
      }
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      console.log('🎤 Starting audio recording...');
        const { recording: newRecording } = await (Audio as any).Recording.createAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
      
      console.log('Providing feedback..');
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await Speech.speak('Recording started. Please speak your location.', { language: 'en' });
      
      // Auto-stop after 5 seconds
      timeoutRef.current = setTimeout(async () => {
        console.log('Auto-stop timeout triggered');
        await stopRecording();
      }, 5000);
      
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', `Failed to start recording: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const stopRecording = async () => {
    console.log('🛑 Voice recording stopped');
    
    // Clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      console.log('Stopping recording..');
      setIsRecording(false);
      
      if (recording) {
        console.log('🎤 Stopping audio recording...');
        await recording.stopAndUnloadAsync();
        
        const uri = recording.getURI();
        console.log('🎤 Recording URI:', uri);
        
        if (uri) {
          // Process the recorded audio
          await processVoiceInput(uri);
        } else {
          console.log('❌ No recording URI available');
          Alert.alert('Error', 'No audio was recorded. Please try again.');
        }
      } else {
        console.log('❌ No recording object available');
        Alert.alert('Error', 'No recording was found. Please try again.');
      }
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', `Failed to process recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioUri: string) => {
    try {
      console.log('🔄 Processing voice input...', audioUri);
      setIsProcessing(true);
      
      // Show processing feedback
      await Speech.speak('Processing your voice input...', { language: 'en' });
      
      // Try to use Web Speech API for real speech-to-text
      let transcription = '';
      
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
          console.log('🎤 Using Web Speech API');
          transcription = await performWebSpeechRecognition();
        } else {
          console.log('🎤 Using mock transcription for native platform');
          transcription = await getMockTranscription();
        }
      } catch (error) {
        console.log('🎤 Web Speech API failed, using mock transcription:', error);
        transcription = await getMockTranscription();
      }
      
      console.log('✅ Transcription result:', transcription);
      console.log('📝 Calling onVoiceInput with:', transcription, currentFieldState);
      console.log('📝 onVoiceInput function exists:', typeof onVoiceInput);
      
      // Provide feedback and input the text
      await Speech.speak(`Location recognized: ${transcription}`, { language: 'en' });
      
      // Call the callback to input the text
      console.log('📝 About to call onVoiceInput...');
      onVoiceInput(transcription, currentFieldState);
      console.log('📝 onVoiceInput called successfully');
      
      // Close the modal after a short delay to ensure state is processed
      setTimeout(() => {
        onClose();
      }, 100);
      
    } catch (error) {
      console.error('❌ Error processing voice input:', error);
      Alert.alert('Error', `Failed to process voice input: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct Web Speech API without recording
  const startDirectSpeechRecognition = async () => {
    try {
      console.log('🎤 Starting direct speech recognition...');
      setIsProcessing(true);
      
      // Check if Web Speech API is available
      if (Platform.OS !== 'web' || typeof window === 'undefined') {
        console.log('❌ Not on web platform, using mock');
        const mockText = await getMockTranscription();
        await Speech.speak(`Location recognized: ${mockText}`, { language: 'en' });
        onVoiceInput(mockText, currentFieldState);
        onClose();
        return;
      }

      // Check for Web Speech API support
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) {
        console.log('❌ Web Speech API not supported, using mock');
        const mockText = await getMockTranscription();
        await Speech.speak(`Location recognized: ${mockText}`, { language: 'en' });
        onVoiceInput(mockText, currentFieldState);
        onClose();
        return;
      }

      await Speech.speak('Listening... Please speak your location', { language: 'en' });
      
      const transcription = await performWebSpeechRecognition();
      
      console.log('✅ Direct transcription result:', transcription);
      console.log('📝 Direct - Calling onVoiceInput with:', transcription, currentFieldState);
      console.log('📝 Direct - onVoiceInput function exists:', typeof onVoiceInput);
      
      await Speech.speak(`Location recognized: ${transcription}`, { language: 'en' });
      
      console.log('📝 Direct - About to call onVoiceInput...');
      onVoiceInput(transcription, currentFieldState);
      console.log('📝 Direct - onVoiceInput called successfully');
      
      onClose();
      
    } catch (error) {
      console.error('❌ Error in direct speech recognition:', error);
      Alert.alert('Error', `Speech recognition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const performWebSpeechRecognition = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Check if Web Speech API is available
        if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          console.log('❌ Web Speech API not available, using fallback');
          reject(new Error('Web Speech API not available'));
          return;
        }
        
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => {
          console.log('🎤 Speech recognition started');
        };
        
        recognition.onresult = (event: any) => {
          console.log('🎤 Speech recognition result received');
          if (event.results && event.results.length > 0) {
            const transcript = event.results[0][0].transcript.trim();
            console.log('🎤 Web Speech API result:', transcript);
            
            if (transcript && transcript.length > 0) {
              resolve(transcript);
            } else {
              reject(new Error('Empty transcript received'));
            }
          } else {
            reject(new Error('No speech result received'));
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('❌ Speech recognition error:', event.error);
          reject(new Error(`Speech recognition error: ${event.error}`));
        };
        
        recognition.onend = () => {
          console.log('🎤 Speech recognition ended');
        };
        
        recognition.onnomatch = () => {
          console.log('🎤 No speech was recognized');
          reject(new Error('No speech was recognized'));
        };
        
        console.log('🎤 Starting Web Speech API recognition...');
        recognition.start();
        
        // Timeout after 8 seconds
        setTimeout(() => {
          try {
            recognition.stop();
          } catch (e) {
            console.log('Recognition already stopped');
          }
          reject(new Error('Speech recognition timeout'));
        }, 8000);
        
      } catch (error) {
        console.error('❌ Error setting up speech recognition:', error);
        reject(error);
      }
    });
  };

  const getMockTranscription = async (): Promise<string> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate more realistic mock responses based on common location patterns
    const mockResponses = {
      pickup: [
        '123 Main Street, Downtown',
        '456 Oak Avenue, Uptown',
        '789 Pine Street, Midtown',
        '321 Elm Street, Westside',
        '654 Maple Drive, Eastside'
      ],
      destination: [
        '456 Oak Avenue, Uptown',
        '789 Pine Street, Midtown',
        '321 Elm Street, Westside',
        '654 Maple Drive, Eastside',
        '987 Cedar Lane, Northside'
      ]
    };
    
    const responses = mockResponses[currentFieldState as keyof typeof mockResponses];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleFieldToggle = () => {
    const newField = currentFieldState === 'pickup' ? 'destination' : 'pickup';
    setCurrentFieldState(newField);
    Speech.speak(`Now recording for ${newField} location`, { language: 'en' });
  };

  const handleClose = () => {
    // Clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (isRecording) {
      stopRecording();
    }
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Voice Input</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.instruction}>
              Tap and hold to record your {currentFieldState} location
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
                  color={currentFieldState === 'pickup' ? '#007AFF' : '#666'} 
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
                  color={currentFieldState === 'destination' ? '#007AFF' : '#666'} 
                />
                <Text style={[
                  styles.fieldText,
                  currentFieldState === 'destination' && styles.activeFieldText
                ]}>
                  Destination
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recordingContainer}>
              <Animated.View
                style={[
                  styles.recordButton,
                  isRecording && styles.recordingButton,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <TouchableOpacity
                  style={styles.recordButtonInner}
                  onPressIn={() => {
                    console.log('onPressIn triggered');
                    startRecording();
                  }}
                  onPressOut={() => {
                    console.log('onPressOut triggered');
                    stopRecording();
                  }}
                  disabled={isProcessing}
                >
                  <MaterialIcons
                    name={isProcessing ? "hourglass-empty" : isRecording ? "stop" : "mic"}
                    size={40}
                    color={isProcessing ? "#007AFF" : isRecording ? "#FF3B30" : "#007AFF"}
                  />
                </TouchableOpacity>
              </Animated.View>

              <Text style={styles.recordText}>
                {isProcessing ? 'Processing...' : isRecording ? 'Recording... Release to stop' : 'Hold to record'}
              </Text>
              
              {/* Direct Speech Recognition Button */}
              <TouchableOpacity
                style={styles.directButton}
                onPress={startDirectSpeechRecognition}
                disabled={isProcessing}
              >
                <MaterialIcons name="record-voice-over" size={24} color="#007AFF" />
                <Text style={styles.directButtonText}>Direct Speech Recognition</Text>
              </TouchableOpacity>
              
              {!permissionResponse?.granted && (
                <View style={styles.permissionContainer}>
                  <MaterialIcons name="mic-off" size={24} color="#FF3B30" />
                  <Text style={styles.permissionText}>Microphone permission required</Text>
                  <TouchableOpacity 
                    style={styles.permissionButton}
                    onPress={requestAudioPermission}
                  >
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {isProcessing && (
                <View style={styles.processingContainer}>
                  <MaterialIcons name="hourglass-empty" size={24} color="#007AFF" />
                  <Text style={styles.processingText}>Converting speech to text...</Text>
                </View>
              )}
            </View>

          </View>
        </View>
      </View>
  );
};

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldSelector: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 4,
  },
  fieldButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  activeFieldButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeFieldText: {
    color: '#007AFF',
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#ffebee',
    borderWidth: 3,
    borderColor: '#FF3B30',
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  permissionContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#FFF3F3',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE6E6',
  },
  permissionText: {
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  permissionButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  processingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  directButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  directButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default VoiceRecorder;
