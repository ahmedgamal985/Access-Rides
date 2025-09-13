declare module 'expo-speech' {
  export interface SpeechOptions {
    language?: string;
    pitch?: number;
    rate?: number;
    quality?: 'Enhanced' | 'Default';
    voice?: string;
    volume?: number;
  }

  export function speak(text: string, options?: SpeechOptions): Promise<void>;
  export function stop(): Promise<void>;
  export function pause(): Promise<void>;
  export function resume(): Promise<void>;
  export function isSpeakingAsync(): Promise<boolean>;
  export function getAvailableVoicesAsync(): Promise<any[]>;
}

declare module 'expo-location' {
  export interface LocationData {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number | null;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  export interface LocationOptions {
    accuracy?: LocationAccuracy;
    timeInterval?: number;
    distanceInterval?: number;
    mayShowUserSettingsDialog?: boolean;
  }

  export enum LocationAccuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6,
  }

  export function getCurrentPositionAsync(options?: LocationOptions): Promise<LocationData>;
  export function watchPositionAsync(options: LocationOptions, callback: (location: LocationData) => void): Promise<string>;
  export function requestForegroundPermissionsAsync(): Promise<{ status: string }>;
  export function requestBackgroundPermissionsAsync(): Promise<{ status: string }>;
  export function getForegroundPermissionsAsync(): Promise<{ status: string }>;
  export function getBackgroundPermissionsAsync(): Promise<{ status: string }>;
}

declare module 'expo-haptics' {
  export enum ImpactFeedbackStyle {
    Light = 'light',
    Medium = 'medium',
    Heavy = 'heavy',
  }

  export enum NotificationFeedbackType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
  }

  export function impactAsync(style?: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(type?: NotificationFeedbackType): Promise<void>;
  export function selectionAsync(): Promise<void>;
}

declare module 'expo-av' {
  export interface AudioStatus {
    isLoaded: boolean;
    isPlaying: boolean;
    positionMillis: number;
    durationMillis: number;
    playableDurationMillis: number;
    shouldPlay: boolean;
    isLooping: boolean;
    volume: number;
    rate: number;
    shouldCorrectPitch: boolean;
    isMuted: boolean;
  }

  export class Audio {
    static setAudioModeAsync(mode: any): Promise<void>;
    static requestPermissionsAsync(): Promise<{ status: string }>;
    static getPermissionsAsync(): Promise<{ status: string }>;
  }

  export class Sound {
    static createAsync(source: any, status?: any, onPlaybackStatusUpdate?: (status: AudioStatus) => void): Promise<Sound>;
    playAsync(): Promise<AudioStatus>;
    pauseAsync(): Promise<AudioStatus>;
    stopAsync(): Promise<AudioStatus>;
    setPositionAsync(positionMillis: number): Promise<AudioStatus>;
    setVolumeAsync(volume: number): Promise<AudioStatus>;
    setRateAsync(rate: number, shouldCorrectPitch?: boolean): Promise<AudioStatus>;
    setIsMutedAsync(isMuted: boolean): Promise<AudioStatus>;
    setIsLoopingAsync(isLooping: boolean): Promise<AudioStatus>;
    getStatusAsync(): Promise<AudioStatus>;
    unloadAsync(): Promise<void>;
  }

  export class Recording {
    static createAsync(options?: any): Promise<{ recording: Recording }>;
    startAsync(): Promise<void>;
    stopAndUnloadAsync(): Promise<AudioStatus>;
    getURI(): string;
  }
}

declare module 'expo-camera' {
  export interface CameraProps {
    style?: any;
    type?: CameraType;
    ref?: any;
    onCameraReady?: () => void;
    onMountError?: (error: any) => void;
  }

  export enum CameraType {
    back = 'back',
    front = 'front',
  }

  export class Camera extends React.Component<CameraProps> {
    takePictureAsync(options?: any): Promise<any>;
    recordAsync(options?: any): Promise<any>;
    stopRecording(): void;
  }

  export function requestCameraPermissionsAsync(): Promise<{ status: string }>;
  export function getCameraPermissionsAsync(): Promise<{ status: string }>;
}
