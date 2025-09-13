import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SignWritingSymbol {
  symbol: string;
  position: { x: number; y: number };
  rotation: number;
  size: number;
  color: string;
}

interface SignWritingViewerProps {
  symbols: SignWritingSymbol[];
  onSymbolSelect?: (symbol: SignWritingSymbol) => void;
  isVisible?: boolean;
}

const SignWritingViewer: React.FC<SignWritingViewerProps> = ({
  symbols,
  onSymbolSelect,
  isVisible = true,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<SignWritingSymbol | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (symbols.length > 0) {
      // Animate symbols appearance
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 4);
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [symbols]);

  const handleSymbolPress = (symbol: SignWritingSymbol) => {
    setSelectedSymbol(symbol);
    onSymbolSelect?.(symbol);
  };

  const renderSymbol = (symbol: SignWritingSymbol, index: number) => {
    const isAnimated = animationPhase >= index;
    const scale = isAnimated ? 1 : 0.5;
    const opacity = isAnimated ? 1 : 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.symbolContainer,
          {
            left: symbol.position.x,
            top: symbol.position.y,
            transform: [
              { rotate: `${symbol.rotation}deg` },
              { scale },
            ],
            opacity,
          },
        ]}
        onPress={() => handleSymbolPress(symbol)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.symbol,
            {
              backgroundColor: symbol.color,
              width: symbol.size,
              height: symbol.size,
            },
          ]}
        >
          <Text style={styles.symbolText}>{symbol.symbol}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isVisible || symbols.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="gesture" size={24} color="#007AFF" />
        <Text style={styles.title}>SignWriting Visualization</Text>
      </View>
      
      <View style={styles.canvas}>
        {symbols.map((symbol, index) => renderSymbol(symbol, index))}
      </View>
      
      {selectedSymbol && (
        <View style={styles.symbolInfo}>
          <Text style={styles.symbolInfoText}>
            Symbol: {selectedSymbol.symbol}
          </Text>
          <Text style={styles.symbolInfoText}>
            Position: ({Math.round(selectedSymbol.position.x)}, {Math.round(selectedSymbol.position.y)})
          </Text>
          <Text style={styles.symbolInfoText}>
            Rotation: {Math.round(selectedSymbol.rotation)}°
          </Text>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  canvas: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
    overflow: 'hidden',
  },
  symbolContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  symbolText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  symbolInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  symbolInfoText: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
});

export default SignWritingViewer;
