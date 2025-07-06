import '../global.css';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

export default function Layout() {
  return <Stack screenOptions={{
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
  }} />;
}
