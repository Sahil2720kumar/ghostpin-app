import { View, Text, Pressable, Animated, Dimensions, StatusBar, Image, StyleSheet, Alert } from 'react-native';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { router, Stack } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { useCameraPermission, Camera, useCameraDevice, CameraDevice, PhotoFile, useCameraFormat, CameraProps } from 'react-native-vision-camera';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useAppState } from '@react-native-community/hooks';
const { width, height } = Dimensions.get('window');
import Reanimated, { Extrapolation, interpolate, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import LoadingView from '../components/LoadingView'
import PermissionView from '~/components/PermissionView';
import PrePreview from '~/components/PrePreview';


Reanimated.addWhitelistedNativeProps({
  zoom: true,
})



export default function CameraScreen() {
  // const ReanimatedCamera = useMemo(() => Reanimated.createAnimatedComponent(Camera), [])
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
  const device = useCameraDevice(facing);
  const zoom = useSharedValue(device?.neutralZoom || 0)

  const [isProcessing, setIsProcessing] = useState(false);


  if (!device) {
    return (
      <LoadingView message="Loading Camera..." iconName="camera-outline" />
    )
  }

  // Animation refs
  const captureAnim = useRef(new Animated.Value(0)).current;
  const recordingAnim = useRef(new Animated.Value(0)).current;

  //zoom gesture
  const zoomOffset = useSharedValue(0);
  const gesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value
    })
    .onUpdate(event => {
      const z = zoomOffset.value * event.scale
      zoom.value = interpolate(
        z,
        [1, 10],
        [device?.minZoom || 0, device?.maxZoom || 0],
        Extrapolation.CLAMP,
      )
    })

  const animatedProps = useAnimatedProps<CameraProps>(
    () => ({ zoom: zoom.value }),
    [zoom]
  )




  const handleNext = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    setIsProcessing(false);
    router.push(`/preview?uri=file://${encodeURIComponent(photo?.path || '')}`);

  }, [photo]);



  //camera config
  const format = useCameraFormat(device, [
    { photoResolution: 'max', photoHdr: true }
  ])


  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        const status = await requestPermission();
        setPermissionChecked(true);
      } else {
        setPermissionChecked(true);
        console.log('hasPermission', hasPermission);
      }
    })();
  }, []);



  // useEffect(() => {
  //   if (isRecording) {
  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.timing(recordingAnim, {
  //           toValue: 1,
  //           duration: 1000,
  //           useNativeDriver: true,
  //         }),
  //         Animated.timing(recordingAnim, {
  //           toValue: 0,
  //           duration: 1000,
  //           useNativeDriver: true,
  //         }),
  //       ])
  //     ).start();
  //   } else {
  //     recordingAnim.setValue(0);
  //   }
  // }, [isRecording]);

  useFocusEffect(
    useCallback(() => {
      setPermissionChecked(true);
      return () => setPermissionChecked(false);
    }, [])
  );




  const handleCapture = useCallback(async () => {
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

    // Add your capture logic here
    console.log('Capture photo');

    try {
      const photo = await camera.current?.takePhoto({
        enableShutterSound: true,
        flash: flashMode,
           
      })
      if (!photo) {
        Alert.alert('Error', 'Failed to capture photo');
        return;
      };


      console.log('photo', photo);
      setPhoto(photo);
    } catch (error) {
      console.log('error', error);
    }
  }, [photo, flashMode, camera]);

  const toggleCamera = useCallback(() => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  }, []);

  const toggleFlash = useCallback(() => {
    setFlashMode(current => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  }, [flashMode]);

  const getFlashIcon = useCallback(() => {
    switch (flashMode) {
      case 'on': return 'flash';
      case 'auto': return 'flash-auto';
      default: return 'flash-off';
    }
  }, [flashMode]);

  if (!hasPermission) {
    return (
      <PermissionView message="Camera Access Required"
        description="We need camera permission to capture your GhostPin photos with custom locations"
        requestPermission={requestPermission}
        permissionChecked={permissionChecked}
      />
    );
  }


  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* <GestureDetector gesture={gesture}> */}
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          photo={true}
          format={format}
          photoHdr={true}
          photoQualityBalance={'quality'}
          // torch={'on'}
          // animatedProps={animatedProps}
          outputOrientation={"preview"}
        />
      {/* </GestureDetector> */}


      {photo ? (
        <PrePreview photo={photo} setPhoto={setPhoto} handleNext={handleNext} isProcessing={isProcessing} />
      ) :
        (<>

          {/* Top Controls */}
          <View className="absolute top-0 left-0 right-0 z-10">
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
              className="pt-12 pb-5"
            >
              <View className="flex-row justify-between items-center px-5">
                <TouchableOpacity
                  className="w-11 h-11 rounded-full bg-white/20 justify-center items-center"
                  onPress={() => { router.replace('/') }}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>

                <View className="flex-row">
                  <TouchableOpacity
                    className={`w-11 h-11 rounded-full justify-center items-center ${flashMode !== 'off' ? 'bg-white/30' : 'bg-white/20'
                      }`}
                    onPress={toggleFlash}
                    activeOpacity={0.7}
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
                      className="w-15 h-15 rounded-full bg-white justify-center items-center shadow-lg"
                      onPress={handleCapture}
                      activeOpacity={0.8}
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
                >
                  <View className="flex-1 bg-white/20 justify-center items-center rounded-full border-2 border-white/30">
                    <MaterialCommunityIcons name="camera-flip-outline" size={24} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Recording Indicator */}
          {/* {isRecording && (
            <View className="absolute top-24 left-5 flex-row items-center bg-red-500/90 px-3 py-1.5 rounded-full z-10">
              <Animated.View
                style={{
                  opacity: recordingAnim
                }}
                className="w-2 h-2 rounded-full bg-white mr-1.5"
              />
              <Text className="text-white text-xs font-semibold">REC</Text>
            </View>
          )} */}
        </>
        )}
    </View>
  );
}