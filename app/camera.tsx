import { View, Text, Pressable, Animated, Dimensions, StatusBar, Image, StyleSheet, Alert } from 'react-native';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { router, Stack } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { useCameraPermission, useCameraDevice, CameraDevice, PhotoFile, useCameraFormat, CameraProps, Camera } from 'react-native-vision-camera';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useAppState } from '@react-native-community/hooks';
const { width, height } = Dimensions.get('window');
import Reanimated, { Extrapolation, interpolate, useAnimatedProps, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import LoadingView from '../components/LoadingView'
import PermissionView from '~/components/PermissionView';
import PrePreview from '~/components/PrePreview';

// Create the animated camera component outside the main component
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

Reanimated.addWhitelistedNativeProps({
  zoom: true,
})

export default function CameraScreen() {
  const isFocused = useIsFocused()
  const appState = useAppState()
  const isActive = isFocused && appState === "active"
  const camera = useRef<Camera>(null)
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const device = useCameraDevice(facing);
  const zoom = useSharedValue(device?.neutralZoom || 1)
  const [isProcessing, setIsProcessing] = useState(false);

  // Animation refs
  const captureAnim = useRef(new Animated.Value(0)).current;
  const recordingAnim = useRef(new Animated.Value(0)).current;

  // Enhanced device check with error handling
  const isDeviceReady = useMemo(() => {
    if (!device) {
      console.log('No camera device found for facing:', facing);
      return false;
    }
    return true;
  }, [device, facing]);

  // Camera format with error handling
  const format = useCameraFormat(device, [
    { photoResolution: 'max' }
  ]);

  // Zoom gesture with better error handling
  const zoomOffset = useSharedValue(0);
  const gesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value
    })
    .onUpdate(event => {
      if (!device) return;
      
      const z = zoomOffset.value * event.scale
      const minZoom = device.minZoom || 1;
      const maxZoom = device.maxZoom || 10;
      
      zoom.value = interpolate(
        z,
        [minZoom, maxZoom],
        [minZoom, maxZoom],
        Extrapolation.CLAMP,
      )
    })
    // .onError((error) => {
    //   console.error('Zoom gesture error:', error);
    // });

  const animatedProps = useAnimatedProps<CameraProps>(
    () => ({ zoom: zoom.value }),
    [zoom]
  );

  // Enhanced permission handling
  const checkAndRequestPermissions = useCallback(async () => {
    try {
      console.log('Checking camera permissions...');
      
      if (!hasPermission) {
        console.log('No permission, requesting...');
        const granted = await requestPermission();
        
        if (!granted) {
          console.log('Camera permission denied');
          setCameraError('Camera permission denied');
          setPermissionChecked(true);
          return false;
        }
        
        console.log('Permission granted');
      }
      
      setPermissionChecked(true);
      setCameraError(null);
      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      setCameraError('Failed to check camera permissions');
      setPermissionChecked(true);
      return false;
    }
  }, [hasPermission, requestPermission]);

  // Initialize camera with proper error handling
  const initializeCamera = useCallback(async () => {
    try {
      console.log('Initializing camera...');
      
      if (!isDeviceReady) {
        console.log('Device not ready');
        setCameraError('Camera device not available');
        return;
      }

      const hasPerms = await checkAndRequestPermissions();
      if (!hasPerms) {
        return;
      }

      // Reset zoom to device default
      if (device) {
        zoom.value = device.neutralZoom || 1;
      }

      setIsInitialized(true);
      setCameraError(null);
      console.log('Camera initialized successfully');
      
    } catch (error) {
      console.error('Camera initialization error:', error);
      setCameraError('Failed to initialize camera');
      setIsInitialized(false);
    }
  }, [isDeviceReady, checkAndRequestPermissions, device, zoom]);

  // Camera error handler
  const handleCameraError = useCallback((error: any) => {
    console.error('Camera runtime error:', error);
    setCameraError('Camera error occurred');
    setIsInitialized(false);
  }, []);

  // Enhanced capture with better error handling
  const handleCapture = useCallback(async () => {
    if (!camera.current || !isInitialized || isProcessing) {
      console.log('Camera not ready for capture');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Animation feedback
      Animated.sequence([
        Animated.timing(captureAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(captureAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      console.log('Taking photo...');
      
      const photoResult = await camera.current.takePhoto({
        enableShutterSound: true,
        flash: flashMode,
        // qualityPrioritization: 'quality',
      });

      if (!photoResult) {
        Alert.alert('Error', 'Failed to capture photo');
        return;
      }

      console.log('Photo captured successfully:', photoResult.path);
      setPhoto(photoResult);
      
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [camera, isInitialized, isProcessing, flashMode, captureAnim]);

  const handleNext = useCallback(async () => {
    if (isProcessing || !photo) return;
    
    try {
      setIsProcessing(true);
      router.push(`/preview?uri=file://${encodeURIComponent(photo.path)}`);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [photo, isProcessing]);

  const toggleCamera = useCallback(() => {
    try {
      setFacing(current => current === 'back' ? 'front' : 'back');
      // Reset zoom when switching cameras
      zoom.value = 1;
    } catch (error) {
      console.error('Toggle camera error:', error);
    }
  }, [zoom]);

  const toggleFlash = useCallback(() => {
    setFlashMode(current => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  }, []);

  const getFlashIcon = useCallback(() => {
    switch (flashMode) {
      case 'on': return 'flash';
      case 'auto': return 'flash-auto';
      default: return 'flash-off';
    }
  }, [flashMode]);

  // Initialize camera on mount and focus
  useEffect(() => {
    if (isFocused && appState === 'active') {
      initializeCamera();
    }
  }, [isFocused, appState, initializeCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (camera.current) {
          camera.current = null;
        }
        setIsInitialized(false);
        setCameraError(null);
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };
  }, []);

  // Focus effect for proper lifecycle management
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused');
      return () => {
        console.log('Screen unfocused');
        setIsInitialized(false);
      };
    }, [])
  );

  // Handle device changes
  useEffect(() => {
    if (device) {
      zoom.value = device.neutralZoom || 1;
    }
  }, [device, zoom]);

  // Error state
  if (cameraError) {
    return (
      <LoadingView 
        message={cameraError} 
        iconName="camera-off-outline" 
      />
    );
  }

  // Permission check
  if (!hasPermission || !permissionChecked) {
    return (
      <PermissionView 
        message="Camera Access Required"
        description="We need camera permission to capture your photos"
        requestPermission={checkAndRequestPermissions}
        permissionChecked={permissionChecked}
      />
    );
  }

  // Device check
  if (!isDeviceReady) {
    return (
      <LoadingView 
        message="Loading Camera..." 
        iconName="camera-outline" 
      />
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Stack.Screen options={{ headerShown: false }} />

      <GestureDetector gesture={gesture}>
        <ReanimatedCamera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive && isInitialized}
          photo={true}
          format={format}
          photoHdr={false}
          photoQualityBalance={'quality'}
          animatedProps={animatedProps as any}
          outputOrientation={"preview"}
          onError={handleCameraError}
          onInitialized={() => {
            console.log('Camera initialized');
            setIsInitialized(true);
          }}
          
        />
      </GestureDetector>

      {photo ? (
        <PrePreview 
          photo={photo} 
          setPhoto={setPhoto} 
          handleNext={handleNext} 
          isProcessing={isProcessing} 
        />
      ) : (
        <>
          {/* Top Controls */}
          <View className="absolute top-0 left-0 right-0 z-10">
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
              className="pt-12 pb-5"
            >
              <View className="flex-row justify-between items-center px-5">
                <TouchableOpacity
                  className="w-11 h-11 rounded-full bg-white/20 justify-center items-center"
                  onPress={() => { 
                    try {
                      router.replace('/');
                    } catch (error) {
                      console.error('Navigation error:', error);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>

                <View className="flex-row">
                  <TouchableOpacity
                    className={`w-11 h-11 rounded-full justify-center items-center ${
                      flashMode !== 'off' ? 'bg-white/30' : 'bg-white/20'
                    }`}
                    onPress={toggleFlash}
                    activeOpacity={0.7}
                    disabled={!isInitialized}
                  >
                    <MaterialCommunityIcons name={getFlashIcon()} size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="w-11 h-11 rounded-full bg-white/20 justify-center items-center"
                  onPress={() => {/* Handle settings */ }}
                  activeOpacity={0.7}
                >
                  <Feather name="settings" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Bottom Controls */}
          <View className="absolute bottom-0 left-0 right-0 z-10">
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
              className="pt-10 pb-12"
            >
              <View className="flex-row justify-around items-center px-5">
                {/* Gallery Button */}
                <TouchableOpacity
                  className="w-12 h-12 rounded-xl overflow-hidden"
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push('/gallery');
                  }}
                >
                  <View className="flex-1 bg-white/20 justify-center items-center rounded-xl border-2 border-white/30">
                    <MaterialCommunityIcons name="image-outline" size={24} color="#fff" />
                  </View>
                </TouchableOpacity>

                {/* Capture Button */}
                <View className="relative items-center justify-center">
                  <Animated.View
                    style={{
                      transform: [{
                        scale: captureAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.95]
                        })
                      }]
                    }}
                    className="w-20 h-20 rounded-full bg-white/30 justify-center items-center border-4 border-white"
                  >
                    <TouchableOpacity
                      className={`w-15 h-15 rounded-full justify-center items-center shadow-lg ${
                        isInitialized && !isProcessing ? 'bg-white' : 'bg-white/50'
                      }`}
                      onPress={handleCapture}
                      activeOpacity={0.8}
                      disabled={!isInitialized || isProcessing}
                    >
                      <View className="w-12 h-12 rounded-full bg-white" />
                    </TouchableOpacity>
                  </Animated.View>

                  {isRecording && (
                    <Animated.View
                      style={{
                        opacity: recordingAnim
                      }}
                      className="absolute w-24 h-24 rounded-full border-4 border-red-500"
                    />
                  )}
                </View>

                {/* Flip Camera Button */}
                <TouchableOpacity
                  className="w-12 h-12 rounded-full overflow-hidden"
                  onPress={toggleCamera}
                  activeOpacity={0.8}
                  disabled={!isInitialized}
                >
                  <View className={`flex-1 justify-center items-center rounded-full border-2 border-white/30 ${
                    isInitialized ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    <MaterialCommunityIcons name="camera-flip-outline" size={24} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Loading/Status Indicator */}
          {!isInitialized && (
            <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 px-4 py-2 rounded-full">
              <Text className="text-white text-sm">Initializing camera...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}