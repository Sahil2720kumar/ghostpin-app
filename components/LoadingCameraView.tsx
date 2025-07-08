import { View, Text, StatusBar } from 'react-native'
import React, { memo } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/build/MaterialCommunityIcons';

const LoadingCameraView = () => {
  console.log("LoadingCameraView");
  return (
    <View className="flex-1 bg-black justify-center items-center">
    <View className="items-center">
      <MaterialCommunityIcons name="camera-outline" size={60} color="#fff" />
      <Text className="text-lg text-white mt-5 font-medium">
        Loading camera...
      </Text>
    </View>
  </View>
  )
}

export default memo(LoadingCameraView)