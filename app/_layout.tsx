import '../global.css';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ToastManager from 'toastify-react-native'


export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastManager />
      <Stack screenOptions={{
        headerShown: true,
        headerTitle: () => (
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="ghost" size={28} color="#7c3aed" />
            <Text className="font-bold text-black text-2xl">GhostPin</Text>
          </View>
        ),
        headerTitleStyle: {
          fontFamily: 'Poppins-Bold',
          fontWeight: 'bold',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#000000',
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: 'Poppins-Regular',
        },
      }} >
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="preview" options={{ headerShown: false }} />
        <Stack.Screen name="add-location" options={{ headerShown: false }} />
        <Stack.Screen name="model"  options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="gallery" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
  
