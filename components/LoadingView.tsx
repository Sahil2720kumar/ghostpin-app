import { View, Text, StatusBar } from 'react-native'
import React, { memo } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/build/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingView = ({message, iconName}: {message: string, iconName: string}) => {
  console.log("LoadingCameraView");
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} className="flex-1 justify-center items-center px-5">
    <View className="items-center">
      <MaterialCommunityIcons name={iconName || "camera-outline"} size={60} color="#fff" />
      <Text className="text-lg text-white mt-5 font-medium">
        {message || "Loading Camera..."}
      </Text>
    </View>
  </LinearGradient>
  )
}

export default memo(LoadingView)