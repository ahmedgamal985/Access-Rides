import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

interface AccessibilitySettingsProps {
  onClose: () => void;
  onSettingsChange: (settings: AccessibilitySettings) => void;
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

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ 
  onClose, 
  onSettingsChange 
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    voiceGuidance: true,
    highContrast: false,
    largeText: false,
    hapticFeedback: true,
    screenReader: false,
    signLanguageSupport: true,
    reducedMotion: false,
    colorBlindSupport: false,
  });

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Provide audio feedback
    Speech.speak(`${key} ${value ? 'enabled' : 'disabled'}`, { language: 'en' });
  };

  const SettingItem = ({ 
    title, 
    description, 
    settingKey, 
    icon 
  }: {
    title: string;
    description: string;
    settingKey: keyof AccessibilitySettings;
    icon: string;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <MaterialIcons name={icon as any} size={24} color="#007AFF" />
        <View style={styles.settingText}>
          <Text style={[
            styles.settingTitle,
            settings.largeText && styles.largeText
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.settingDescription,
            settings.largeText && styles.largeTextDescription
          ]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={(value) => updateSetting(settingKey, value)}
        trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
        thumbColor={settings[settingKey] ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[
        styles.container,
        settings.highContrast && styles.highContrastContainer
      ]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="accessibility-new" size={24} color="#007AFF" />
            <Text style={[
              styles.headerTitle,
              settings.largeText && styles.largeText
            ]}>
              Accessibility Settings
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              settings.largeText && styles.largeText
            ]}>
              Visual Accessibility
            </Text>
            
            <SettingItem
              title="High Contrast"
              description="Increase contrast for better visibility"
              settingKey="highContrast"
              icon="contrast"
            />
            
            <SettingItem
              title="Large Text"
              description="Increase text size throughout the app"
              settingKey="largeText"
              icon="text_fields"
            />
            
            <SettingItem
              title="Color Blind Support"
              description="Use patterns and shapes instead of colors"
              settingKey="colorBlindSupport"
              icon="palette"
            />
          </View>

          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              settings.largeText && styles.largeText
            ]}>
              Audio Accessibility
            </Text>
            
            <SettingItem
              title="Voice Guidance"
              description="Audio instructions and feedback"
              settingKey="voiceGuidance"
              icon="record_voice_over"
            />
            
            <SettingItem
              title="Screen Reader"
              description="Optimize for screen readers"
              settingKey="screenReader"
              icon="hearing"
            />
          </View>

          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              settings.largeText && styles.largeText
            ]}>
              Physical Accessibility
            </Text>
            
            <SettingItem
              title="Haptic Feedback"
              description="Vibrations for touch feedback"
              settingKey="hapticFeedback"
              icon="vibration"
            />
            
            <SettingItem
              title="Reduced Motion"
              description="Minimize animations and transitions"
              settingKey="reducedMotion"
              icon="motion_photos_off"
            />
          </View>

          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              settings.largeText && styles.largeText
            ]}>
              Communication
            </Text>
            
            <SettingItem
              title="Sign Language Support"
              description="Enable sign language recognition"
              settingKey="signLanguageSupport"
              icon="gesture"
            />
          </View>

          <View style={styles.presetSection}>
            <Text style={[
              styles.sectionTitle,
              settings.largeText && styles.largeText
            ]}>
              Quick Presets
            </Text>
            
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => {
                const visualPreset = {
                  voiceGuidance: true,
                  highContrast: true,
                  largeText: true,
                  hapticFeedback: true,
                  screenReader: true,
                  signLanguageSupport: false,
                  reducedMotion: false,
                  colorBlindSupport: true,
                };
                setSettings(visualPreset);
                onSettingsChange(visualPreset);
                Speech.speak('Visual accessibility preset applied', { language: 'en' });
              }}
            >
              <MaterialIcons name="visibility" size={20} color="#007AFF" />
              <Text style={styles.presetText}>Visual Impairment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => {
                const hearingPreset = {
                  voiceGuidance: false,
                  highContrast: true,
                  largeText: true,
                  hapticFeedback: true,
                  screenReader: false,
                  signLanguageSupport: true,
                  reducedMotion: false,
                  colorBlindSupport: false,
                };
                setSettings(hearingPreset);
                onSettingsChange(hearingPreset);
                Speech.speak('Hearing accessibility preset applied', { language: 'en' });
              }}
            >
              <MaterialIcons name="hearing" size={20} color="#007AFF" />
              <Text style={styles.presetText}>Hearing Impairment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => {
                const motorPreset = {
                  voiceGuidance: true,
                  highContrast: false,
                  largeText: true,
                  hapticFeedback: true,
                  screenReader: false,
                  signLanguageSupport: false,
                  reducedMotion: true,
                  colorBlindSupport: false,
                };
                setSettings(motorPreset);
                onSettingsChange(motorPreset);
                Speech.speak('Motor accessibility preset applied', { language: 'en' });
              }}
            >
              <MaterialIcons name="accessibility_new" size={20} color="#007AFF" />
              <Text style={styles.presetText}>Motor Impairment</Text>
            </TouchableOpacity>
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
  highContrastContainer: {
    backgroundColor: '#000000',
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
    fontSize: 20,
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
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  largeText: {
    fontSize: 20,
  },
  largeTextDescription: {
    fontSize: 16,
  },
  presetSection: {
    marginTop: 30,
    marginBottom: 30,
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  presetText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
    fontWeight: '500',
  },
});

export default AccessibilitySettings;
