import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Import our custom components
import VoiceRecorder from './components/VoiceRecorder';
import SignLanguageCamera from './components/SignLanguageCamera';
import AdvancedSignLanguageCamera from './components/AdvancedSignLanguageCamera';
import SignWritingViewer from './components/SignWritingViewer';
import PoseAnalyzer from './components/PoseAnalyzer';
import ChatInterface from './components/ChatInterface';
import DriverChatInterface from './components/DriverChatInterface';
import AISupport from './components/AISupport';
import AccessibilitySettingsComponent from './components/AccessibilitySettings';
import MapView from './components/MapView';

interface RideType {
  id: string;
  name: string;
  icon: string;
  count: number;
  isAccessRides?: boolean;
}

interface AccessibilitySettings {
  voiceGuidance: boolean;
  highContrast: boolean;
  largeText: boolean;
  hapticFeedback: boolean;
  screenReader: boolean;
  signLanguageSupport: boolean;
  reducedMotion: boolean;
  colorBlindSupport: boolean;
}

const App: React.FC = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [fare, setFare] = useState('$0.00');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAISupport, setShowAISupport] = useState(false);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [selectedDriverForChat, setSelectedDriverForChat] = useState<any>(null);
  const [currentRideType, setCurrentRideType] = useState('ride');
  const [currentField, setCurrentField] = useState<'pickup' | 'destination'>('pickup');
  const [showDrivers, setShowDrivers] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapType, setMapType] = useState<'pickup' | 'destination'>('pickup');
  const [showDriverCommunication, setShowDriverCommunication] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isVoiceOverMode, setIsVoiceOverMode] = useState(false);
  
  // Refs for direct text input manipulation
  const pickupInputRef = useRef<TextInput>(null);
  const destinationInputRef = useRef<TextInput>(null);

  // Monitor state changes
  useEffect(() => {
    console.log('📍 Pickup location changed to:', pickupLocation);
  }, [pickupLocation]);

  useEffect(() => {
    console.log('📍 Destination changed to:', destination);
  }, [destination]);
  
  const drivers = [
    {
      id: 'driver1',
      name: 'Ahmed Hassan',
      rating: 4.8,
      vehicle: 'Toyota Camry 2022',
      fare: '$12.50',
      eta: '5 min',
      accessibility: ['Wheelchair Accessible', 'Voice Guidance']
    },
    {
      id: 'driver2', 
      name: 'Sarah Johnson',
      rating: 4.9,
      vehicle: 'Honda Accord 2021',
      fare: '$15.00',
      eta: '3 min',
      accessibility: ['Sign Language Support', 'Voice Guidance']
    },
    {
      id: 'driver3',
      name: 'Mike Wilson',
      rating: 4.7,
      vehicle: 'Nissan Altima 2023',
      fare: '$18.75',
      eta: '7 min',
      accessibility: ['Wheelchair Accessible', 'Sign Language Support']
    }
  ];
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    voiceGuidance: true,
    highContrast: false,
    largeText: false,
    hapticFeedback: true,
    screenReader: false,
    signLanguageSupport: true,
    reducedMotion: false,
    colorBlindSupport: false,
  });

  const rideTypes: RideType[] = [
    { id: 'ride', name: 'Ride', icon: 'directions-car', count: 0 },
    { id: 'access-rides', name: 'Access Rides', icon: 'accessibility-new', count: 0, isAccessRides: true },
    { id: 'comfort', name: 'Comfort', icon: 'airline-seat-flat', count: 4 },
    { id: 'moto', name: 'Moto', icon: 'two-wheeler', count: 1 },
    { id: 'city', name: 'City to City', icon: 'location-city', count: 0 },
  ];

  useEffect(() => {
    requestPermissions();
  }, []);

  // Calculate fare when destination changes
  useEffect(() => {
    calculateFare();
  }, [pickupLocation, destination]);

  const calculateFare = () => {
    if (pickupLocation && destination) {
      // Simulate fare calculation based on distance
      const baseFare = 5.00;
      const perMileRate = 2.50;
      const estimatedDistance = Math.random() * 10 + 2; // 2-12 miles
      const calculatedFare = baseFare + (estimatedDistance * perMileRate);
      setFare(`$${calculatedFare.toFixed(2)}`);
    } else {
      setFare('$0.00');
    }
  };

  const requestPermissions = async () => {
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      
      if (locationStatus !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to find nearby drivers');
      }
      if (audioStatus !== 'granted') {
        Alert.alert('Permission required', 'Audio permission is needed for voice features');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const handleVoiceInput = async (text: string, field: 'pickup' | 'destination') => {
    try {
      console.log('🎤 ===== VOICE INPUT FUNCTION CALLED =====');
      console.log('🎤 Text received:', text);
      console.log('🎤 Field:', field);
      console.log('🎤 Current pickup before:', pickupLocation);
      console.log('🎤 Current destination before:', destination);
      
      if (accessibilitySettings.hapticFeedback && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Immediate state update
      if (field === 'pickup') {
        console.log('🎤 Setting pickup location to:', text);
        setPickupLocation(text);
        
        // Force immediate UI update using refs (only on native platforms)
        if (Platform.OS !== 'web' && pickupInputRef.current) {
          pickupInputRef.current.setNativeProps({ text: text });
          console.log('🎤 Direct TextInput update via ref');
        }
        
        // Multiple state updates to ensure it sticks
        setTimeout(() => {
          setPickupLocation(text);
          console.log('🎤 Pickup location force update 1:', text);
        }, 50);
        
        setTimeout(() => {
          setPickupLocation(text);
          console.log('🎤 Pickup location force update 2:', text);
        }, 150);
        
      } else if (field === 'destination') {
        console.log('🎤 Setting destination to:', text);
        setDestination(text);
        
        // Force immediate UI update using refs (only on native platforms)
        if (Platform.OS !== 'web' && destinationInputRef.current) {
          destinationInputRef.current.setNativeProps({ text: text });
          console.log('🎤 Direct TextInput update via ref');
        }
        
        // Multiple state updates to ensure it sticks
        setTimeout(() => {
          setDestination(text);
          console.log('🎤 Destination force update 1:', text);
        }, 50);
        
        setTimeout(() => {
          setDestination(text);
          console.log('🎤 Destination force update 2:', text);
        }, 150);
      }
      
      // Provide audio feedback
      if (accessibilitySettings.voiceGuidance) {
        await Speech.speak(`Location set to ${text}`, { language: 'en' });
      }
      
      // Close voice mode after a longer delay to ensure state is updated
      setTimeout(() => {
        setIsVoiceMode(false);
        console.log('🎤 Voice mode closed');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error handling voice input:', error);
    }
  };

  const handleTextToSpeech = async (text: string, field: 'pickup' | 'destination') => {
    try {
      console.log('🔊 TTS called for:', field, 'text:', text);
      console.log('🔊 TTS function started');
      
      if (!text || text.trim() === '') {
        console.log('🔊 Field is empty, speaking empty message');
        const fieldName = field === 'pickup' ? 'Pickup location' : 'Destination';
        await Speech.speak(`${fieldName} is empty. Please enter a location first.`, { language: 'en' });
        return;
      }
      
      if (accessibilitySettings.hapticFeedback && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Use different voices and speeds for different fields
      const voiceOptions = {
        language: 'en-US',
        pitch: field === 'pickup' ? 1.0 : 1.1,
        rate: 0.8,
      };
      
      const fieldName = field === 'pickup' ? 'Pickup location' : 'Destination';
      const fullText = `${fieldName} is ${text}`;
      
      console.log('🔊 Speaking:', fullText);
      await Speech.speak(fullText, voiceOptions);
      
    } catch (error) {
      console.error('❌ Error in Text-to-Speech:', error);
      Alert.alert('TTS Error', 'Failed to read text aloud. Please try again.');
    }
  };

  const handleDriverTTS = async (driverInfo: string) => {
    try {
      console.log('🔊 Driver TTS called for:', driverInfo);
      
      if (accessibilitySettings.hapticFeedback && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      const voiceOptions = {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.7,
      };
      
      console.log('🔊 Speaking driver info:', driverInfo);
      await Speech.speak(driverInfo, voiceOptions);
      
    } catch (error) {
      console.error('❌ Error in Driver TTS:', error);
      Alert.alert('TTS Error', 'Failed to read driver information aloud.');
    }
  };

  const handleGeneralTTS = async () => {
    try {
      console.log('🔊 General TTS called');
      
      if (accessibilitySettings.hapticFeedback && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      const voiceOptions = {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
      };
      
      let fullText = 'Access Rides - Your accessible transportation app. ';
      
      if (pickupLocation && pickupLocation.trim() !== '') {
        fullText += `Pickup location is ${pickupLocation}. `;
      } else {
        fullText += 'No pickup location entered yet. ';
      }
      
      if (destination && destination.trim() !== '') {
        fullText += `Destination is ${destination}. `;
      } else {
        fullText += 'No destination entered yet. ';
      }
      
      fullText += 'Press Find Driver to book your ride. ';
      fullText += 'Use voice input, sign language, or text input to enter locations. ';
      fullText += 'All features are designed for accessibility.';
      
      console.log('🔊 Speaking general info:', fullText);
      await Speech.speak(fullText, voiceOptions);
      
    } catch (error) {
      console.error('❌ Error in General TTS:', error);
      Alert.alert('TTS Error', 'Failed to read information aloud.');
    }
  };

  // VoiceOver function - speaks any text when VoiceOver mode is active
  const handleVoiceOver = async (text: string) => {
    if (isVoiceOverMode) {
      try {
        console.log('🔊 VoiceOver speaking:', text);
        await Speech.speak(text, { language: 'en' });
      } catch (error) {
        console.error('Error with VoiceOver:', error);
      }
    }
  };

  // Toggle VoiceOver mode
  const toggleVoiceOverMode = () => {
    setIsVoiceOverMode(!isVoiceOverMode);
    if (!isVoiceOverMode) {
      Speech.speak('VoiceOver mode activated. Tap any element to hear its description.', { language: 'en' });
    } else {
      Speech.speak('VoiceOver mode deactivated.', { language: 'en' });
    }
  };

  const handleSignLanguageInput = async (text: string, field: 'pickup' | 'destination') => {
    try {
      console.log('📍 Sign language input received:', text, 'for field:', field);
      
      if (accessibilitySettings.hapticFeedback) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      if (field === 'pickup') {
        console.log('✅ Setting pickup location to:', text);
        setPickupLocation(text);
      } else {
        console.log('✅ Setting destination to:', text);
        setDestination(text);
      }
      
      // Provide audio feedback
      if (accessibilitySettings.voiceGuidance) {
        await Speech.speak(`Location set to ${text}`, { language: 'en' });
      }
    } catch (error) {
      console.error('Error handling sign language input:', error);
    }
  };

  const handleMapLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    if (mapType === 'pickup') {
      setPickupLocation(location.address);
    } else {
      setDestination(location.address);
    }
    setShowMap(false);
  };

  const openMap = (type: 'pickup' | 'destination') => {
    setMapType(type);
    setShowMap(true);
  };

  const handleBookRide = async () => {
    try {
      // Check if both fields are filled
      if (!pickupLocation || pickupLocation.trim() === '' || !destination || destination.trim() === '') {
        Alert.alert(
          'Missing Information', 
          'Please enter both pickup location and destination before finding drivers.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Show drivers list immediately
      setShowDrivers(true);
      
      if (accessibilitySettings.hapticFeedback) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      if (accessibilitySettings.voiceGuidance) {
        await Speech.speak('Finding available drivers...', { language: 'en' });
      }
      
    } catch (error) {
      console.error('Error booking ride:', error);
      Alert.alert('Error', 'Failed to find drivers. Please try again.');
    }
  };

  const handleDriverSelect = (driver: any) => {
    console.log('🚗 Driver selected:', driver.name);
    setSelectedDriverForChat(driver);
    setShowDrivers(false);
    setShowDriverChat(true);
    
    if (accessibilitySettings.voiceGuidance) {
      Speech.speak(`Opening chat with ${driver.name}`, { language: 'en' });
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
  };


  const renderRideTypeButton = (rideType: RideType) => (
    <TouchableOpacity
      key={rideType.id}
      style={styles.rideTypeButton}
      onPress={() => {
        setCurrentRideType(rideType.id);
        handleVoiceOver(`${rideType.name} ride type selected`);
      }}
      accessibilityLabel={`Select ${rideType.name} ride type`}
      accessibilityRole="button"
    >
      <View style={[
        styles.rideTypeIcon,
        currentRideType === rideType.id && styles.selectedRideType
      ]}>
        <TouchableOpacity onPress={() => handleVoiceOver(`${rideType.name} icon`)}>
          <MaterialIcons 
            name={rideType.icon as any} 
            size={24} 
            color={currentRideType === rideType.id ? '#007AFF' : '#666'} 
          />
        </TouchableOpacity>
        {rideType.isAccessRides && (
          <TouchableOpacity onPress={() => handleVoiceOver('Accessibility badge - This ride type is accessible')}>
            <View style={styles.accessibilityBadge}>
              <MaterialIcons name="info" size={12} color="white" />
            </View>
          </TouchableOpacity>
        )}
      </View>
      <Text 
        style={[
          styles.rideTypeText,
          currentRideType === rideType.id && styles.selectedRideTypeText
        ]}
        onPress={() => handleVoiceOver(`${rideType.name} ride type with ${rideType.count} available`)}
      >
        {rideType.name}
        {rideType.count > 0 && (
          <Text style={styles.rideCount}> {rideType.count}</Text>
        )}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text 
            style={[
              styles.headerTitle,
              accessibilitySettings.largeText && styles.largeText
            ]}
            onPress={() => handleVoiceOver('Access Rides - Your accessible transportation app')}
          >
            Access Rides
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => {
                setShowAccessibilitySettings(true);
                handleVoiceOver('Accessibility Settings button');
              }}
              accessibilityLabel="Open Accessibility Settings"
            >
              <MaterialIcons name="accessibility-new" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => {
                setShowAISupport(true);
                handleVoiceOver('Menu button - Open AI Support');
              }}
              accessibilityLabel="Open AI Support"
            >
              <MaterialIcons name="menu" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.mapSection}>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => {
              setShowMap(true);
              handleVoiceOver('Open Map button');
            }}
            accessibilityLabel="Open map to select location"
          >
            <MaterialIcons name="map" size={24} color="#007AFF" />
            <Text style={styles.mapButtonText}>Open Map</Text>
          </TouchableOpacity>
        </View>

        {/* Ride Type Selection */}
        <View style={styles.rideTypesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {rideTypes.map(renderRideTypeButton)}
          </ScrollView>
        </View>

        {/* Location Input Fields */}
        <View style={styles.locationContainer}>
          {/* Pickup Location */}
          <View style={styles.locationField}>
            <TouchableOpacity onPress={() => handleVoiceOver('Pickup location icon')}>
              <MaterialIcons name="location-on" size={20} color="#4CAF50" style={styles.locationIcon} />
            </TouchableOpacity>
            <TextInput
              ref={pickupInputRef}
              style={styles.locationInput}
              value={pickupLocation}
              onChangeText={setPickupLocation}
              placeholder="Pickup location"
              accessibilityLabel="Pickup location input"
              onPressIn={() => handleVoiceOver('Pickup location input field')}
            />
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => {
                console.log('🎤 Voice button clicked for pickup');
                console.log('🎤 Setting currentField to pickup');
                setCurrentField('pickup');
                console.log('🎤 Opening voice mode');
                setIsVoiceMode(true);
                handleVoiceOver('Microphone button for pickup location');
              }}
              accessibilityLabel="Voice input for pickup location"
            >
              <MaterialIcons name="mic" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.inputButton}
              onPress={() => {
                console.log('🔊 TTS button clicked for pickup');
                console.log('🔊 Pickup location value:', pickupLocation);
                handleTextToSpeech(pickupLocation, 'pickup');
                handleVoiceOver('Text to Speech button for pickup location');
              }}
              accessibilityLabel="Read pickup location aloud"
            >
              <MaterialIcons name="volume-up" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Destination */}
          <View style={styles.locationField}>
            <TouchableOpacity onPress={() => handleVoiceOver('Destination search icon')}>
              <MaterialIcons name="search" size={20} color="#999" style={styles.locationIcon} />
            </TouchableOpacity>
            <TextInput
              ref={destinationInputRef}
              style={styles.locationInput}
              value={destination}
              onChangeText={setDestination}
              placeholder="Destination"
              accessibilityLabel="Destination input"
              onPressIn={() => handleVoiceOver('Destination input field')}
            />
            <TouchableOpacity 
              style={styles.inputButton}
              onPress={() => {
                console.log('🎤 Voice button clicked for destination');
                console.log('🎤 Setting currentField to destination');
                setCurrentField('destination');
                console.log('🎤 Opening voice mode');
                setIsVoiceMode(true);
                handleVoiceOver('Microphone button for destination');
              }}
              accessibilityLabel="Voice input for destination"
            >
              <MaterialIcons name="mic" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.inputButton}
              onPress={() => {
                console.log('🔊 TTS button clicked for destination');
                console.log('🔊 Destination value:', destination);
                handleTextToSpeech(destination, 'destination');
                handleVoiceOver('Text to Speech button for destination');
              }}
              accessibilityLabel="Read destination aloud"
            >
              <MaterialIcons name="volume-up" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Fare Input */}
        <TouchableOpacity style={styles.fareContainer} onPress={() => {
          // Handle fare input
          const currentFare = fare.replace('$', '');
          const newFare = prompt('Enter your desired fare amount:', currentFare);
          if (newFare && !isNaN(Number(newFare))) {
            setFare(`$${newFare}`);
          }
          handleVoiceOver(`Fare amount ${fare}`);
        }}>
          <View style={styles.fareInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.fareText}>{fare}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleVoiceOver('Edit fare amount button')}
          >
            <MaterialIcons name="edit" size={20} color="#999" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => {
              handleBookRide();
              handleVoiceOver('Find Driver button');
            }}
            accessibilityLabel="Book your ride"
            accessibilityRole="button"
          >
            <Text style={styles.bookButtonText}>Find Driver</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => {
              setShowAccessibilitySettings(true);
              handleVoiceOver('Settings button');
            }}
          >
            <MaterialIcons name="tune" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.voiceButton}
            onPress={() => {
              toggleVoiceMode();
              handleVoiceOver('Voice mode toggle button');
            }}
            accessibilityLabel="Toggle voice mode"
          >
            <MaterialIcons name="mic" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.voiceButton, isVoiceOverMode && { backgroundColor: '#4CAF50' }]}
            onPress={toggleVoiceOverMode}
            accessibilityLabel={isVoiceOverMode ? "VoiceOver mode active" : "Activate VoiceOver mode"}
          >
            <MaterialIcons name="volume-up" size={24} color={isVoiceOverMode ? "white" : "#666"} />
          </TouchableOpacity>
          
        </View>

        {/* Voice Mode Indicator */}
        {isVoiceMode && (
          <View style={styles.voiceModeIndicator}>
            <Text 
              style={styles.voiceModeText}
              onPress={() => handleVoiceOver('Voice Mode Active - Speak your commands')}
            >
              Voice Mode Active - Speak your commands
            </Text>
          </View>
        )}


        {/* Bottom Indicator */}
        <View style={styles.bottomIndicator} />
      </ScrollView>

      {/* Modals and Overlays */}
      {isVoiceMode && (
        <View style={styles.modalOverlay}>
          <VoiceRecorder
            onVoiceInput={handleVoiceInput}
            onClose={() => setIsVoiceMode(false)}
            currentField={currentField}
          />
        </View>
      )}


      {showChat && (
        <ChatInterface
          onClose={() => setShowChat(false)}
          isDriverCommunication={showDriverCommunication}
          driverName={selectedDriver?.name || ''}
        />
      )}

      {showAISupport && (
        <AISupport
          onClose={() => setShowAISupport(false)}
        />
      )}

      {showAccessibilitySettings && (
        <AccessibilitySettingsComponent
          onClose={() => setShowAccessibilitySettings(false)}
          onSettingsChange={setAccessibilitySettings}
        />
      )}

      {showDrivers && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDrivers(false)}
        >
          <View style={styles.driversModal}>
            <View style={styles.driversContainer}>
              <View style={styles.driversHeader}>
                <Text 
                  style={styles.driversTitle}
                  onPress={() => handleVoiceOver('Available Drivers list')}
                >
                  Available Drivers
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowDrivers(false);
                    handleVoiceOver('Close drivers list button');
                  }}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.driversList}>
                {drivers.map((driver) => (
                  <TouchableOpacity
                    key={driver.id}
                    style={styles.driverCard}
                    onPress={() => {
                      handleVoiceOver(`Driver ${driver.name} with rating ${driver.rating} and fare ${driver.fare}`);
                      handleDriverSelect(driver);
                    }}
                  >
                    <View style={styles.driverInfo}>
                      <View style={styles.driverHeader}>
                        <Text 
                          style={styles.driverName}
                          onPress={() => handleVoiceOver(`Driver name ${driver.name}`)}
                        >
                          {driver.name}
                        </Text>
                        <View style={styles.ratingContainer}>
                          <TouchableOpacity onPress={() => handleVoiceOver('Star rating')}>
                            <MaterialIcons name="star" size={16} color="#FFD700" />
                          </TouchableOpacity>
                          <Text 
                            style={styles.rating}
                            onPress={() => handleVoiceOver(`Rating ${driver.rating} stars`)}
                          >
                            {driver.rating}
                          </Text>
                        </View>
                      </View>
                      <Text 
                        style={styles.vehicle}
                        onPress={() => handleVoiceOver(`Vehicle ${driver.vehicle}`)}
                      >
                        {driver.vehicle}
                      </Text>
                      <View style={styles.driverDetails}>
                        <Text 
                          style={styles.fare}
                          onPress={() => handleVoiceOver(`Fare ${driver.fare}`)}
                        >
                          {driver.fare}
                        </Text>
                        <Text 
                          style={styles.eta}
                          onPress={() => handleVoiceOver(`Estimated time of arrival ${driver.eta}`)}
                        >
                          ETA: {driver.eta}
                        </Text>
                      </View>
                      <View style={styles.accessibilityTags}>
                        {driver.accessibility.map((feature, index) => (
                          <Text 
                            key={index} 
                            style={styles.accessibilityTag}
                            onPress={() => handleVoiceOver(`Accessibility feature ${feature}`)}
                          >
                            {feature}
                          </Text>
                        ))}
                      </View>
                      <View style={styles.driverActions}>
                        <TouchableOpacity 
                          style={styles.ttsButton}
                          onPress={() => {
                            const driverInfo = `${driver.name}, ${driver.vehicle}, ${driver.fare}, ETA ${driver.eta}`;
                            handleDriverTTS(driverInfo);
                          }}
                        >
                          <MaterialIcons name="volume-up" size={16} color="#007AFF" />
                          <Text style={styles.ttsButtonText}>Read Info</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Driver Communication Modal */}
      {showDriverCommunication && selectedDriver && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDriverCommunication(false)}
        >
          <View style={styles.communicationModal}>
            <View style={styles.communicationContainer}>
              <View style={styles.communicationHeader}>
                <Text style={styles.communicationTitle}>Communicate with {selectedDriver.name}</Text>
                <TouchableOpacity onPress={() => setShowDriverCommunication(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.communicationOptions}>
                <TouchableOpacity 
                  style={styles.communicationButton}
                  onPress={() => {
                    setShowDriverCommunication(false);
                    setShowDriverChat(true);
                    setSelectedDriverForChat(selectedDriver);
                  }}
                >
                  <MaterialIcons name="videocam" size={40} color="#007AFF" />
                  <Text style={styles.communicationButtonText}>Sign Language</Text>
                  <Text style={styles.communicationButtonSubtext}>Use camera for sign language</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.communicationButton}
                  onPress={() => {
                    setShowDriverCommunication(false);
                    setShowChat(true);
                  }}
                >
                  <MaterialIcons name="chat" size={40} color="#007AFF" />
                  <Text style={styles.communicationButtonText}>Voice Chat</Text>
                  <Text style={styles.communicationButtonSubtext}>Talk with your driver</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.communicationButton}
                  onPress={() => {
                    setShowDriverCommunication(false);
                    setIsVoiceMode(true);
                  }}
                >
                  <MaterialIcons name="mic" size={40} color="#007AFF" />
                  <Text style={styles.communicationButtonText}>Voice Message</Text>
                  <Text style={styles.communicationButtonSubtext}>Send voice message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Map View Modal */}
      <MapView
        visible={showMap}
        onClose={() => setShowMap(false)}
        onLocationSelect={handleMapLocationSelect}
        title={`Select ${mapType === 'pickup' ? 'Pickup' : 'Destination'} Location`}
      />


      {/* Driver Chat Interface */}
      {showDriverChat && selectedDriverForChat && (
        <DriverChatInterface
          visible={showDriverChat}
          onClose={() => {
            setShowDriverChat(false);
            setSelectedDriverForChat(null);
          }}
          driverName={selectedDriverForChat.name}
          driverInfo={{
            name: selectedDriverForChat.name,
            rating: selectedDriverForChat.rating,
            vehicle: selectedDriverForChat.vehicle,
            eta: selectedDriverForChat.eta,
            phone: '+1234567890',
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginLeft: 5,
  },
  largeText: {
    fontSize: 28,
  },
  driversModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  driversContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  driversHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  driversTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  driversList: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  driverCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  driverInfo: {
    flex: 1,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  vehicle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  driverDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  eta: {
    fontSize: 14,
    color: '#666',
  },
  accessibilityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accessibilityTag: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  rideTypesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rideTypeButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    minWidth: 80,
  },
  rideTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  selectedRideType: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  accessibilityBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  selectedRideTypeText: {
    color: '#007AFF',
  },
  rideCount: {
    color: '#999',
    fontWeight: 'normal',
  },
  locationContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  locationField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
  },
  locationIcon: {
    marginRight: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputButton: {
    padding: 8,
    marginLeft: 5,
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fareInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  fareText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  editButton: {
    padding: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  voiceButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  voiceModeIndicator: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  voiceModeText: {
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  signModeIndicator: {
    backgroundColor: '#f3e5f5',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  signModeText: {
    color: '#9C27B0',
    fontWeight: '600',
    textAlign: 'center',
  },
  advancedSignModeIndicator: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  advancedSignModeText: {
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomIndicator: {
    width: 120,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  mapSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  mapButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  communicationModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communicationContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  communicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  communicationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  communicationOptions: {
    gap: 15,
  },
  communicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  communicationButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
  },
  communicationButtonSubtext: {
    fontSize: 14,
    color: '#666',
    marginLeft: 15,
    marginTop: 2,
  },
  driverActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  ttsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  ttsButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default App;
