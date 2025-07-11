import { View, Text, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import BottomSheetComponent from '~/components/BottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { useLocationStore } from '~/store/locationStore';
import LocationCard from '~/components/LocationCard';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import PhotoLocation from '~/components/PhotoLocation';

const { width, height } = Dimensions.get('window');

export default function PhotoPreview() {
  const { uri } = useLocalSearchParams();
  const router = useRouter();
  const selectedLocation = useLocationStore(state => state.selectedLocation);
  const setSelectedLocation = useLocationStore(state => state.setSelectedLocation);
  const locations = useLocationStore(state => state.locations);

  const [cleanForCapture, setCleanForCapture] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showLocationBottomSheet, setShowLocationBottomSheet] = useState(false);
  const [showSuccessPrompt, setShowSuccessPrompt] = useState(false);
  const successPromptAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const locationPromptAnim = useRef(new Animated.Value(0)).current;
  const viewRef = useRef<View>(null);

  useEffect(() => {
    (async () => {
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (mediaPermission.status === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
      }
    })();
  }, []);



  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAddLocation = () => {
    if (isProcessing) return;

    setIsProcessing(true);

    // Add processing animation
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      // Navigate to location selection
      setShowLocationBottomSheet(true);
    }, 500);

    handleOpen();
  };

  const handleSaveToGallery = async () => {
    if (isSaving) return;

    setIsSaving(true);

    // Add saving animation
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide UI components for clean capture
    setCleanForCapture(true);

    // Wait for the state to update and UI to re-render
    setTimeout(async () => {
      try {
        const capturedUri = await captureRef(viewRef, {
          format: 'jpg',
          quality: 1,
        });

        // 2. Save photo to Media Library
        const asset = await MediaLibrary.createAssetAsync(capturedUri);
        const albumName = "GhostPin";
        let album = await MediaLibrary.getAlbumAsync(albumName);
        if (!album) {
          album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        // Show success prompt
        setShowSuccessPrompt(true);
        showSuccessPromptAnimation();
      } catch (error) {
        console.error('Error saving photo:', error);
      } finally {
        // Reset states
        setCleanForCapture(false);
        setIsSaving(false);
      }
    }, 200); // Increased delay to ensure UI update
  };

  const showLocationPromptAnimation = () => {
    Animated.timing(locationPromptAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      Animated.timing(locationPromptAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowLocationPrompt(false);
      });
    }, 3000);
  };

  const showSuccessPromptAnimation = () => {
    Animated.timing(successPromptAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Auto hide success prompt after 3 seconds
    setTimeout(() => {
      Animated.timing(successPromptAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessPrompt(false);
      });
    }, 3000);
  };

  const handleRetake = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace('/camera');
    });
  };

  // Open bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOpen = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const chooseLocation = () => {
    setShowLocationBottomSheet(true);
    handleOpen();
  };

  // Check if UI should be hidden
  const shouldHideUI = cleanForCapture || isSaving;

  const handleShare = async () => {

    // Hide UI components for clean capture
    setCleanForCapture(true);

    // Wait for the state to update and UI to re-render
    setTimeout(async () => {
      try {
        const capturedUri = await captureRef(viewRef, {
          format: 'jpg',
          quality: 1,
        });

        console.log("sharing", capturedUri);
        await Sharing.shareAsync(capturedUri);
      } catch (error) {
        console.error('Error sharing photo:', error);
      } finally {
        // Reset states
        setCleanForCapture(false);
      }
    }, 200); // Increased delay to ensure UI update
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View
        ref={viewRef}
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        className="bg-black"
      >
        <Image
          source={{ uri: uri as string }}
          className="w-full h-full"
          resizeMode="cover"
          style={{ flex: 1 }}
        />

        {/* Top Controls */}
        {!shouldHideUI && (
          <View className="absolute top-0 left-0 right-0 z-10">
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
              className="pt-12 pb-8"
            >
              <View className="flex-row justify-between items-center px-5">
                <TouchableOpacity
                  className="w-12 h-12 rounded-full bg-white/20 justify-center items-center backdrop-blur-sm border border-white/30"
                  onPress={handleRetake}
                  activeOpacity={0.7}
                >
                  <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>

                <View className="flex-row items-center bg-black/40 px-4 py-2 rounded-full border border-white/20">
                  <MaterialCommunityIcons name="camera-outline" size={16} color="#fff" />
                  <Text className="text-white text-sm font-medium ml-2">Photo Captured</Text>
                </View>

                <TouchableOpacity
                  className="w-12 h-12 rounded-full bg-white/20 justify-center items-center backdrop-blur-sm border border-white/30"
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  <Feather name="share-2" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Bottom Controls */}

        <View className="absolute bottom-0 left-0 right-0 z-10">
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
            className="pt-16 pb-12"
          >
            <View className="px-5">
              {/* Action Buttons Row */}
              {!shouldHideUI && <View className="flex-row justify-center items-center mb-8">
                <TouchableOpacity
                  className="w-20 h-20 rounded-2xl bg-white/10 justify-center items-center mx-3 border-2 border-white/20"
                  onPress={handleRetake}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="camera-retake" size={32} color="#fff" />
                  <Text className="text-white text-xs font-medium mt-1">Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-20 h-20 rounded-2xl bg-white/10 justify-center items-center mx-3 border-2 border-white/20"
                  onPress={handleSaveToGallery}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <View className="items-center">
                      <View className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-1" />
                      <Text className="text-white text-xs font-medium">Saving</Text>
                    </View>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="download" size={32} color="#fff" />
                      <Text className="text-white text-xs font-medium mt-1">Save</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-20 h-20 rounded-2xl bg-white/10 justify-center items-center mx-3 border-2 border-white/20"
                  onPress={chooseLocation}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  <MaterialCommunityIcons name="map-marker-multiple" size={30} color="#fff" />
                  <Text className="text-white text-xs font-medium mt-1 text-center">Locations</Text>
                </TouchableOpacity>
              </View>}

              {/* Primary Action Button */}
              <Animated.View
                style={{
                  opacity: buttonAnim,
                  alignItems:'center',
                  justifyContent:'center',
                  transform: [{
                    scale: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1]
                    })
                  }]
                  
                }}
              >
                <TouchableOpacity
                  className="mx-4 rounded-2xl overflow-hidden shadow-2xl items-center justify-center max-w-[600px]"
                  onPress={handleAddLocation}
                  activeOpacity={0.9}
                  disabled={isProcessing}
                >
                  <LinearGradient
                    colors={selectedLocation ? ["transparent","transparent"] : ['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    className={`flex-row items-center justify-center  rounded-3xl ${selectedLocation ? 'py-0 px-0' : 'py-5 px-8'}`}
                  >
                    {selectedLocation && !isProcessing ? (
                      <>
                        <View className="flex-row items-center justify-center">
                          <PhotoLocation item={selectedLocation} handleAddLocation={handleAddLocation} showWatermark={true} />
                        </View>
                      </>
                    ) : (
                      <View className="flex-row items-center justify-center h-[50px]">
                        <MaterialCommunityIcons name="map-marker-plus" size={24} color="#fff" />
                        <Text className="text-white text-lg font-bold mx-3">Add Location</Text>
                        <View className="w-8 h-8 rounded-full bg-white/20 justify-center items-center">
                          <Feather name="arrow-right" size={18} color="#fff" />
                        </View>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Helper Text */}
              {!shouldHideUI && <View className="items-center mt-4">
                <Text className="text-white/60 text-sm text-center">
                  Add a location to create your GhostPin or save directly to gallery
                </Text>
              </View>}
            </View>
          </LinearGradient>
        </View>


        {/* Floating Quality Badge */}
        {!shouldHideUI && (
          <View className="absolute top-24 right-5 z-20">
            <View className="bg-green-500/90 px-3 py-1.5 rounded-full flex-row items-center">
              <MaterialCommunityIcons name="check-circle" size={14} color="#fff" />
              <Text className="text-white text-xs font-semibold ml-1">HD Quality</Text>
            </View>
          </View>
        )}

        {/* Success Prompt */}
        {showSuccessPrompt && (
          <Animated.View
            style={{
              opacity: successPromptAnim,
              transform: [{
                translateY: successPromptAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }}
            className="absolute top-32 left-5 right-5 z-30"
          >
            <View className="bg-green-500/95 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                <View className="flex-1 ml-3">
                  <Text className="text-white font-bold text-base">Saved to Gallery!</Text>
                  <Text className="text-white/90 text-sm mt-1">
                    Photo saved successfully. Want to add location next?
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.View>

      <BottomSheetComponent
        visible={showLocationBottomSheet}
        onClose={() => bottomSheetRef.current?.close()}
        ref={bottomSheetRef}
        openBottomSheet={handleOpen}
      />
    </>
  );
}