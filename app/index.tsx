import { Stack, router } from 'expo-router';
import { View, Text, FlatList, Dimensions, TouchableOpacity, Pressable, Animated } from 'react-native';
import { Button } from '~/components/Button';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useLocationStore } from '~/store/locationStore';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

export default function Home() {
  const locations = useLocationStore((s) => s.locations);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'GPS Camera Hack', headerShown: false }} />
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        className="flex-1 items-center justify-start relative"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating background elements */}
        <View className="absolute inset-0 overflow-hidden">
          <View 
            className="absolute w-72 h-72 rounded-full opacity-10"
            style={{
              backgroundColor: '#FFFFFF',
              top: -100,
              right: -100,
            }}
          />
          <View 
            className="absolute w-48 h-48 rounded-full opacity-10"
            style={{
              backgroundColor: '#FFFFFF',
              bottom: -50,
              left: -50,
            }}
          />
        </View>

        {/* Animated watermark ghost */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 0,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.08],
            }),
            transform: [
              {
                rotate: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '5deg'],
                }),
              },
            ],
          }}
        >
          <MaterialCommunityIcons
            name="ghost"
            size={220}
            color="#FFFFFF"
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="w-[94vw] max-w-xl rounded-3xl px-6 pt-12 mt-16 mb-4 items-center z-10"
        >
          {/* Glassmorphism container */}
          <View className="w-full rounded-3xl px-7 pt-8 pb-6 items-center" 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 1,
                  height: '87%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                }}>
            
            {/* Header with logo and title */}
            <View className="flex-row items-center mb-4 mt-2">
              <View className="mr-3 p-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <MaterialCommunityIcons name="ghost" size={36} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-3xl font-black text-white" style={{ letterSpacing: 1.5 }}>GhostPin</Text>
                <Text className="text-sm text-white opacity-80 font-medium">Location Freedom</Text>
              </View>
            </View>

            <Text className="text-base text-center mb-8 mt-2 font-medium text-white opacity-90 leading-6">
              Pin any location to your photos. Add a spot, snap a pic, and let your memories float anywhere in the world.
            </Text>

            {/* Section header with gradient underline */}
            <View className="self-start mb-4 w-full">
              <Text className="text-xl font-bold mb-2 tracking-wide text-white">
                Your GhostPins
              </Text>
              <View className="w-20 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }} />
            </View>

            <FlatList
              data={locations}
              keyExtractor={(item) => item.id}
              className="mt-2 h-full w-full"
              contentContainerStyle={{ paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className="flex-row items-center rounded-2xl px-4 py-3 mb-3 mx-0.5 shadow-lg border" 
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.9)', 
                        borderColor: 'rgba(255,255,255,0.3)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 10,
                      }}>
                  <View className="rounded-xl overflow-hidden mr-4 shadow-md">
                    <MapView
                      style={{ width: 90, height: 90 }}
                      initialRegion={{
                        latitude: item.latitude,
                        longitude: item.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker coordinate={{ latitude: item.latitude, longitude: item.longitude }} title={item.address} />
                    </MapView>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-800 mb-1">
                      {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                    </Text>
                    <Text className="text-sm font-medium text-gray-600 leading-5" numberOfLines={2}>
                      {item.address}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <MaterialCommunityIcons name="map-marker-outline" size={64} color="rgba(255,255,255,0.6)" />
                  <Text className="text-center mt-4 text-base font-medium text-white opacity-80">
                    No locations added yet
                  </Text>
                  <Text className="text-center mt-1 text-sm text-white opacity-60">
                    Add your first GhostPin to get started!
                  </Text>
                </View>
              }
            />
          </View>
        </Animated.View>

        {/* Enhanced Bottom Action Bar */}
        <View className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-4 flex-row justify-around items-end z-20" 
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 25,
                shadowOffset: { width: 0, height: -4 },
              }}>
          
          {/* Add Location Button */}
          <TouchableOpacity className="flex-1 items-center justify-center">
            <View className="relative">
              <Button onPress={() => router.push('/add-location')} 
                      className="w-16 h-16 rounded-2xl items-center justify-center shadow-lg border-2" 
                      style={{ 
                        backgroundColor: '#00D4AA', 
                        borderColor: 'rgba(255,255,255,0.8)',
                        shadowColor: '#00D4AA',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                      }}>
                <Feather name="map-pin" size={24} color="#FFFFFF" />
              </Button>
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#FF6B6B' }}>
                <Text className="text-xs font-bold text-white">+</Text>
              </View>
            </View>
            <Text className="text-xs mt-2 font-semibold text-gray-700">Add Pin</Text>
          </TouchableOpacity>

          {/* Camera Button - Hero */}
          <TouchableOpacity className="flex-1 items-center relative -top-3 rounded-full">
            <View className="relative">
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                className="w-20 h-20 rounded-full items-center justify-center shadow-2xl border-4"
                style={{ 
                  borderColor: '#FFFFFF',
                  shadowColor: '#667eea',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                  borderRadius: 100,
                }}
              >
                <TouchableOpacity onPress={() => router.push('/camera')} className="w-full h-full rounded-full items-center justify-center">
                  <Feather name="camera" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>
              <View className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#FFD93D' }}>
                <MaterialCommunityIcons name="lightning-bolt" size={14} color="#000" />
              </View>
            </View>
            <Text className="text-xs mt-3 font-bold text-gray-700">Capture</Text>
          </TouchableOpacity>

          {/* Gallery Button */}
          <TouchableOpacity className="flex-1 items-center">
            <Button onPress={() => router.push('/gallery')} 
                    className="w-16 h-16 rounded-2xl items-center justify-center shadow-lg border-2" 
                    style={{ 
                      backgroundColor: '#FF6B6B', 
                      borderColor: 'rgba(255,255,255,0.8)',
                      shadowColor: '#FF6B6B',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                    }}>
              <Feather name="image" size={24} color="#FFFFFF" />
            </Button>
            <Text className="text-xs mt-2 font-semibold text-gray-700">Gallery</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
}