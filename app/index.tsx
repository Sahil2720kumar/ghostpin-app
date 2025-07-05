import { Stack, router } from 'expo-router';
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Button } from '~/components/Button';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useLocationStore } from '~/store/locationStore';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function Home() {
  const locations = useLocationStore((s) => s.locations);

  return (
    <>
      <Stack.Screen options={{ title: 'GPS Camera Hack' }} />
      <LinearGradient
        colors={["#FFFFFF", "#F7F7F7"]}
        className="flex-1 items-center justify-start relative"
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Watermark ghost */}
        <MaterialCommunityIcons
          name="ghost"
          size={180}
          color="#5E17EB"
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 0, opacity: 0.04 }}
        />
        <View className="w-[92vw] max-w-xl rounded-3xl px-7 pt-10 mt-8 mb-4 items-center shadow-2xl z-10" style={{ backgroundColor: '#FFFFFF', borderColor: '#5E17EB', borderWidth: 1, height: '80%' }}>
          <View className="flex-row items-center mb-3 mt-1">
            <MaterialCommunityIcons name="ghost" size={44} color="#5E17EB" style={{ marginRight: 10 }} />
            <Text className="text-3xl font-extrabold text-black" style={{ letterSpacing: 2 }}>GhostPin</Text>
          </View>
          <Text className="text-base text-center mb-7 mt-1 font-medium text-gray-700">
            Pin any location to your photos. Add a spot, snap a pic, and let your memories float anywhere.
          </Text>
          <Text className="text-lg font-bold mb-2 mt-3 self-start tracking-wide text-black">
            Your GhostPins on the map
          </Text>

          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            className="mt-1 h-full w-full"
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
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
                  <Text className="text-base font-semibold text-black">Long: {item.longitude.toFixed(5)}</Text>
                  <Text className="text-base font-semibold text-black">{item.address}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text className="text-center mt-4 text-base italic text-gray-500">No locations added yet. Add your first GhostPin!</Text>}
          />
        </View>

        {/* Bottom Action Bar */}
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-3 flex-row justify-around items-end z-20" style={{
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          shadowColor: '#888',
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -2 },
        }}>
          <TouchableOpacity className="flex-1 items-center justify-center">
            <Button onPress={() => router.push('/add-location')} className="w-18 h-18 rounded-full items-center justify-center shadow-lg border-4" style={{ backgroundColor: '#00FFC6', borderColor: '#FFFFFF', elevation: 6 }}>
              <Feather name="map-pin" size={28} color="#0D0D0D" />
            </Button>
            <Text className="text-xs mt-2 font-semibold text-gray-700">Add</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center relative bottom-2">
            <Button onPress={() => router.push('/camera')} className="w-20 h-20 rounded-full items-center justify-center shadow-lg border-4" style={{ backgroundColor: '#5E17EB', borderColor: '#FFFFFF', elevation: 6 }}>
              <Feather name="camera" size={28} color="#FFFFFF" />
            </Button>
            <Text className="text-xs mt-2 font-semibold text-gray-700">Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center">
            <Button onPress={() => router.push('/gallery')} className="w-18 h-18 rounded-full items-center justify-center shadow-lg border-4" style={{ backgroundColor: '#FF3C38', borderColor: '#FFFFFF', elevation: 6 }}>
              <Feather name="image" size={28} color="#FFFFFF" />
            </Button>
            <Text className="text-xs mt-2 font-semibold text-gray-700">Gallery</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
}
