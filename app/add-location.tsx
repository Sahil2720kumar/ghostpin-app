import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view'
import { Button } from '~/components/Button';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useLocationStore } from '~/store/locationStore';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { getAddress } from '~/utils/getAddress';  

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
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLatitude(location?.coords.latitude.toString() || '');
      setLongitude(location?.coords.longitude.toString() || '');

      const address = await getAddress(location?.coords.latitude, location?.coords.longitude);
      setAddress(address || '');
    }

    getCurrentLocation();
  }, []);

  const handleGetLocation = async () => {
    setIsLoading(true);
    let location = await Location.getCurrentPositionAsync({});
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
    
    const address = await getAddress(Number(latitude), Number(longitude));

    addLocation({
      id: Date.now().toString(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address?.trim() || address || undefined,
    });
    setLatitude('');
    setLongitude('');
    setAddress('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1  pt-8 w-full" contentContainerStyle={{ paddingBottom: isKeyboardVisible ? 100 : 0, alignItems: 'center' }}>
        <View
          className="w-[92vw] max-w-xl rounded-3xl px-7 py-8 mb-4 items-center shadow-2xl z-10 mb-8"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#5E17EB', borderWidth: 1 }}
        >
          <View className="flex-row items-center mb-3 mt-1">
            <MaterialCommunityIcons name="ghost" size={40} color="#5E17EB" style={{ marginRight: 10 }} />
            <Text className="text-3xl font-extrabold text-black" style={{ letterSpacing: 2 }}>GhostPin</Text>
          </View>
          <Text className="text-base text-center mb-7 mt-1 font-medium text-gray-700">
            Add a custom location to pin anywhere in the world!
          </Text>

          <View className="w-full mb-3">
            <View className="flex-col w-full gap-3">
              <View className="flex-row items-center mb-3 w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 shadow border" style={{ borderColor: '#5E17EB' }}>
                <Feather name="map-pin" size={24} color="#5E17EB" style={{ marginRight: 8 }} />
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginRight: 6,
                    color: '#000000',
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#CCCCCC',
                  }}
                  placeholder="Latitude"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={latitude}
                  onChangeText={setLatitude}
                />
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginLeft: 6,
                    color: '#000000',
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#CCCCCC',
                  }}
                  placeholder="Longitude"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={longitude}
                  onChangeText={setLongitude}
                />
              </View>

              <View className="w-full mt-3">
                <TextInput
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                    color: '#000000',
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#CCCCCC',
                  }}
                  placeholder="Custom Address (Optional)"
                  placeholderTextColor="#888"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View className="flex-row justify-end gap-3 mt-4">
              <Button
                onPress={handleGetLocation}
                className="px-4 py-3 rounded-xl shadow flex-row items-center"
                style={{ backgroundColor: '#5E17EB' }}
              >
                <Feather name="crosshair" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text className="font-bold text-white" style={{ fontSize: 16 }}>{isLoading ? `Getting...` : "Get"}</Text>
              </Button>
              <Button
                onPress={handleAdd}
                className="px-5 py-3 rounded-xl shadow"
                style={{ backgroundColor: '#00FFC6' }}
              >
                <Text className="font-bold text-black" style={{ fontSize: 16 }}>Add</Text>
              </Button>
            </View>
          </View>

          <Text className="text-lg font-bold mb-2 mt-3 self-start tracking-wide text-black">
            Added Locations
          </Text>

          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            className="mt-1 h-full w-full"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => (
              <View className="flex-row items-center rounded-lg px-3 py-2 mb-2 mx-0.5 shadow-sm border" style={{ backgroundColor: '#F5F5F5', borderColor: '#CCCCCC' }}>
                <MapView
                  style={{ width: 100, height: 100, marginRight: 12, borderRadius: 10 }}
                  initialRegion={{
                    latitude: item.latitude,
                    longitude: item.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker coordinate={{ latitude: item.latitude, longitude: item.longitude }} title={item.address} />
                </MapView>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-black">Lat: {item.latitude.toFixed(5)}</Text>
                  <Text className="text-base font-semibold text-black">Lng: {item.longitude.toFixed(5)}</Text>
                  {item.address && (
                    <Text className="text-sm italic mt-1" style={{ color: '#5E17EB' }}>{item.address}</Text>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={<Text className="text-center mt-4 text-base italic text-gray-500">No locations added yet.</Text>}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
