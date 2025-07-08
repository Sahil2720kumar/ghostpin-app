import { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert, Keyboard, ScrollView, Animated, Dimensions, ActivityIndicator, Image  } from 'react-native';
import { Button } from '~/components/Button';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useLocationStore } from '~/store/locationStore';
import * as Location from 'expo-location';
import { getAddress } from '~/utils/getAddress';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import LocationCard from '~/components/LocationCard';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AddLocation() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addLocation } = useLocationStore();
  const locations = useLocationStore((s) => s.locations);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
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
    ]).start();

    // Pulse animation for loading
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoading]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    async function getCurrentLocation() {
      setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setLocation(location);
      setLatitude(location?.coords.latitude.toString() || '');
      setLongitude(location?.coords.longitude.toString() || '');
      const address = await getAddress(location?.coords.latitude, location?.coords.longitude);
      setAddress(address || '');
      setIsLoading(false);
    }

    getCurrentLocation();
  }, []);

  const handleGetLocation = async () => {
    setIsLoading(true);
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const address = await getAddress(location?.coords.latitude, location?.coords.longitude);
    setLocation(location);
    setLatitude(location?.coords.latitude.toString() || '');
    setLongitude(location?.coords.longitude.toString() || '');
    setAddress(address || '');
    setIsLoading(false);
  };

  const handleAdd = async () => {
    if (!latitude || !longitude) return;
    if (Number(latitude) < -90 || Number(latitude) > 90 || Number(longitude) < -180 || Number(longitude) > 180) {
      Alert.alert('Invalid coordinates', 'Latitude must be between -90 and 90, and longitude must be between -180 and 180.');
      return;
    }

    if (Number(latitude) === 0 && Number(longitude) === 0) {
      Alert.alert('Invalid coordinates', 'Latitude and longitude cannot be 0.');
      return;
    }
 
    console.log("new latitude",latitude);
    console.log("new longitude",longitude);
    const current_address = await getAddress(Number(latitude), Number(longitude));

    addLocation({
      id: Date.now().toString(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: current_address?.trim() || current_address || undefined,
    });

    setLatitude('');
    setLongitude('');
    setAddress('');

    console.log("current_address",current_address);
    
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isLoading && (
          <View className=" flex items-center justify-center bg-green-400 flex-row gap-2">
            <Text className="text-white text-base font-bold">Fatching current location...</Text>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        )}

        {/* Top controls */}
        <View className="absolute top-0 left-0 right-0 z-10">
          <View
            className="px-5 py-3"
          >
            <View className="flex-row justify-between items-center px-5">
              <TouchableOpacity
                className="w-11 h-11 rounded-full bg-white/20 justify-center items-center"
                onPress={() => { router.back() }}
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>


        {/* Floating background elements */}
        <View className="absolute inset-0 overflow-hidden">
          <View
            className="absolute w-64 h-64 rounded-full opacity-10"
            style={{
              backgroundColor: '#FFFFFF',
              top: -80,
              left: -80,
            }}
          />
          <View
            className="absolute w-40 h-40 rounded-full opacity-10"
            style={{
              backgroundColor: '#FFFFFF',
              bottom: -20,
              right: -20,
            }}
          />
        </View>

        <ScrollView
          className="flex-1 pt-12 w-full"
          contentContainerStyle={{
            paddingBottom: isKeyboardVisible ? 100 : 20,
            alignItems: 'center'
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="w-[94vw] max-w-xl rounded-3xl px-6 py-8 mb-4 items-center z-10"
          >
            {/* Glassmorphism container */}
            <View className="w-full rounded-3xl px-7 py-8 mb-6 items-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
              }}>

              {/* Header */}
              <View className="flex-row items-center mb-6 mt-2">
                <View className="mr-3 p-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <MaterialCommunityIcons name="ghost" size={32} color="#FFFFFF" />
                </View>
                <View>
                  <Text className="text-2xl font-black text-white" style={{ letterSpacing: 1.2 }}>Add GhostPin</Text>
                  <Text className="text-sm text-white opacity-80 font-medium">Pin any location worldwide</Text>
                </View>
              </View>

              {/* Input Section */}
              <View className="w-full mb-6">
                {/* Coordinates Input */}
                <View className="mb-4">
                  <Text className="text-white font-semibold mb-3 text-base opacity-90">Coordinates</Text>
                  <View className="flex-row gap-3">
                    <View className="flex-1 relative">
                      <View className="absolute left-3 top-4 z-10">
                        <MaterialCommunityIcons name="latitude" size={20} color="#667eea" />
                      </View>
                      <TextInput
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: 16,
                          paddingHorizontal: 16,
                          paddingLeft: 35,
                          paddingVertical: 10,
                          color: '#333',
                          fontSize: 16,
                          fontWeight: '600',
                          borderWidth: 2,
                          borderColor: 'rgba(255,255,255,0.3)',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                        }}
                        placeholder="Latitude"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={latitude}
                        onChangeText={setLatitude}
                      />
                    </View>
                    <View className="flex-1 relative">
                      <View className="absolute left-3 top-4 z-10">
                        <MaterialCommunityIcons name="longitude" size={20} color="#667eea" />
                      </View>
                      <TextInput
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: 16,
                          paddingHorizontal: 16,
                          paddingLeft: 35,
                          paddingVertical: 10,
                          color: '#333',
                          fontSize: 16,
                          fontWeight: '600',
                          borderWidth: 2,
                          borderColor: 'rgba(255,255,255,0.3)',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                        }}
                        placeholder="Longitud"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={longitude}
                        onChangeText={setLongitude}
                        numberOfLines={1}
                        multiline={false}
                      />
                    </View>
                  </View>
                </View>

                {/* Address Input */}
                <View className="mb-6">
                  <Text className="text-white font-semibold mb-3 text-base opacity-90">Address (Optional)</Text>
                  <View className="relative">
                    <View className="absolute left-3 top-4 z-10">
                      <Feather name="map-pin" size={20} color="#667eea" />
                    </View>
                    <TextInput

                      style={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingLeft: 35,
                        paddingVertical: 10,
                        color: '#333',
                        fontSize: 16,
                        fontWeight: '500',
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.3)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                      }}
                      placeholder="Enter custom address..."
                      placeholderTextColor="#999"
                      value={address}
                      onChangeText={setAddress}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="w-full flex-row gap-4 justify-center px-4">
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                      onPress={handleGetLocation}
                      disabled={isLoading}
                      className="flex-row items-center px-3.5 py-2 rounded-2xl shadow-lg"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.3)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                      }}
                      
                    >
                      <MaterialCommunityIcons
                        name={isLoading ? "loading" : "crosshairs-gps"}
                        size={20}
                        color="#667eea"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="font-bold text-gray-700 text-base">
                        {isLoading ? 'Getting...' : 'Get Location'}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>

                  <LinearGradient
                    colors={['#00D4AA', '#00B894']}
                    className="shadow-lg rounded-xl overflow-hidden"
                    style={{
                      shadowColor: '#00D4AA',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleAdd}
                      className="flex-row items-center px-3.5 py-2 rounded-xl "
                    >
                      <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text className="font-bold text-white text-base">Add Pin</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Added Locations Section */}
            <View className="w-full rounded-3xl px-7 py-6 items-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
              }}>

              <View className="flex-row items-center justify-between w-full mb-4">
                <View>
                  <Text className="text-xl font-bold text-white mb-1">Your Pins</Text>
                  <View className="w-16 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }} />
                </View>
                <View className=" bg-opacity-20 rounded-full px-3 py-1">
                  <Text className="text-white font-bold text-md">{locations.length}</Text>
                </View>
              </View>

              <FlatList
                data={locations}
                keyExtractor={(item) => item.id}
                className="w-full"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
                renderItem={({ item }) => (
                  <LocationCard item={item} />
                )}
                ListEmptyComponent={
                  <View className="items-center justify-center py-8">
                    <MaterialCommunityIcons name="map-marker-plus" size={48} color="rgba(255,255,255,0.6)" />
                    <Text className="text-center mt-3 text-base font-medium text-white opacity-80">
                      No pins added yet
                    </Text>
                    <Text className="text-center mt-1 text-sm text-white opacity-60">
                      Add your first location above
                    </Text>
                  </View>
                }
              />
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}