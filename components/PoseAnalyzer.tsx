import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PosePoint {
  x: number;
  y: number;
  confidence: number;
  name: string;
}

interface PoseAnalyzerProps {
  poseData: PosePoint[];
  onGestureDetected?: (gesture: string, confidence: number) => void;
  isActive?: boolean;
}

const PoseAnalyzer: React.FC<PoseAnalyzerProps> = ({
  poseData,
  onGestureDetected,
  isActive = true,
}) => {
  const [currentGesture, setCurrentGesture] = useState<string>('');
  const [gestureConfidence, setGestureConfidence] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [gestureHistory, setGestureHistory] = useState<string[]>([]);
  
  const animationValue = useRef(new Animated.Value(0)).current;
  const analysisTimeout = useRef<NodeJS.Timeout | null>(null);

  // Hand landmark connections for visualization
  const handConnections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17], // Palm connections
  ];

  useEffect(() => {
    if (isActive && poseData.length > 0) {
      analyzePose();
    }
  }, [poseData, isActive]);

  useEffect(() => {
    // Animate confidence indicator
    Animated.timing(animationValue, {
      toValue: gestureConfidence / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [gestureConfidence]);

  const analyzePose = async () => {
    if (analysisTimeout.current) {
      clearTimeout(analysisTimeout.current);
    }

    setIsAnalyzing(true);

    // Simulate pose analysis delay
    analysisTimeout.current = setTimeout(() => {
      const gesture = detectGesture(poseData);
      if (gesture) {
        setCurrentGesture(gesture.name);
        setGestureConfidence(gesture.confidence);
        
        // Add to history
        setGestureHistory(prev => [...prev.slice(-4), gesture.name]);
        
        // Notify parent component
        onGestureDetected?.(gesture.name, gesture.confidence);
      }
      setIsAnalyzing(false);
    }, 200);
  };

  const detectGesture = (points: PosePoint[]): { name: string; confidence: number } | null => {
    if (points.length < 21) return null;

    // Simulate gesture detection based on hand landmarks
    const thumbTip = points[4];
    const indexTip = points[8];
    const middleTip = points[12];
    const ringTip = points[16];
    const pinkyTip = points[20];
    const wrist = points[0];

    // Calculate distances and angles
    const thumbIndexDistance = calculateDistance(thumbTip, indexTip);
    const indexMiddleDistance = calculateDistance(indexTip, middleTip);
    const middleRingDistance = calculateDistance(middleTip, ringTip);
    const ringPinkyDistance = calculateDistance(ringTip, pinkyTip);

    // Gesture recognition logic
    const gestures = [
      {
        name: 'FIST',
        condition: () => thumbIndexDistance < 30 && indexMiddleDistance < 20,
        confidence: 0.9
      },
      {
        name: 'PEACE',
        condition: () => indexMiddleDistance > 40 && middleRingDistance < 20,
        confidence: 0.85
      },
      {
        name: 'THUMBS_UP',
        condition: () => thumbTip.y < wrist.y && indexTip.y > wrist.y,
        confidence: 0.8
      },
      {
        name: 'POINT',
        condition: () => indexTip.y < middleTip.y && middleTip.y < ringTip.y,
        confidence: 0.75
      },
      {
        name: 'OPEN_HAND',
        condition: () => thumbIndexDistance > 50 && indexMiddleDistance > 30,
        confidence: 0.7
      },
      {
        name: 'WAVE',
        condition: () => Math.abs(pinkyTip.x - wrist.x) > 40,
        confidence: 0.65
      }
    ];

    // Find matching gesture
    for (const gesture of gestures) {
      if (gesture.condition()) {
        return {
          name: gesture.name,
          confidence: gesture.confidence * (points.reduce((sum, p) => sum + p.confidence, 0) / points.length)
        };
      }
    }

    return null;
  };

  const calculateDistance = (point1: PosePoint, point2: PosePoint): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const renderPoseOverlay = () => {
    if (poseData.length === 0) return null;

    return (
      <View style={styles.poseOverlay}>
        {/* Render hand landmarks */}
        {poseData.map((point, index) => (
          <View
            key={index}
            style={[
              styles.landmark,
              {
                left: point.x - 5,
                top: point.y - 5,
                backgroundColor: point.confidence > 0.7 ? '#4CAF50' : '#FF5722',
              },
            ]}
          />
        ))}

        {/* Render connections */}
        {handConnections.map((connection, index) => {
          const point1 = poseData[connection[0]];
          const point2 = poseData[connection[1]];
          
          if (!point1 || !point2) return null;

          const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
          const distance = calculateDistance(point1, point2);

          return (
            <View
              key={index}
              style={[
                styles.connection,
                {
                  left: point1.x,
                  top: point1.y,
                  width: distance,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="gesture" size={20} color="#007AFF" />
        <Text style={styles.title}>Pose Analysis</Text>
        {isAnalyzing && (
          <View style={styles.analyzingIndicator}>
            <Animated.View
              style={[
                styles.analyzingDot,
                {
                  transform: [{
                    rotate: animationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.canvas}>
        {renderPoseOverlay()}
      </View>

      <View style={styles.statusPanel}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Gesture:</Text>
          <Text style={styles.statusValue}>{currentGesture || 'None'}</Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Confidence:</Text>
          <View style={styles.confidenceBar}>
            <Animated.View
              style={[
                styles.confidenceFill,
                {
                  width: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.statusValue}>{Math.round(gestureConfidence)}%</Text>
        </View>
      </View>

      {gestureHistory.length > 0 && (
        <View style={styles.historyPanel}>
          <Text style={styles.historyTitle}>Recent Gestures:</Text>
          <View style={styles.historyList}>
            {gestureHistory.slice(-3).map((gesture, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyText}>{gesture}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  analyzingIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  canvas: {
    width: '100%',
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
    overflow: 'hidden',
  },
  poseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  landmark: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  connection: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#007AFF',
    opacity: 0.6,
  },
  statusPanel: {
    marginTop: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  statusValue: {
    color: '#333',
    fontSize: 14,
    marginLeft: 10,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  historyPanel: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  historyTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyItem: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  historyText: {
    color: '#007AFF',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default PoseAnalyzer;
