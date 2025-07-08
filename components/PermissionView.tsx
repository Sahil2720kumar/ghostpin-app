import { View, Text, Animated, TouchableOpacity } from 'react-native'
import React, { memo, useEffect, useRef } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import MaterialCommunityIcons from '@expo/vector-icons/build/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/build/Feather';

const PermissionView = ({ message, description, requestPermission, permissionChecked, iconName }: { message: string, description: string, requestPermission: () => void, permissionChecked: boolean, iconName?: string }) => {
  const permissionAnim = useRef(new Animated.Value(0)).current;
  console.log("render PermissionView");
  useEffect(() => {
    if (permissionChecked) {
      Animated.timing(permissionAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } 
  }, [permissionChecked]);


 


  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="flex-1 justify-center items-center px-5"
      >
        <Animated.View
          style={{
            opacity: permissionAnim,
            transform: [{ translateY: Animated.multiply(permissionAnim, -20) }]
          }}
          className="items-center max-w-xs"
        >
          <View className="relative mb-8">
            <MaterialCommunityIcons name={iconName || "camera-outline"} size={80} color="#fff" />
            <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg">
              <Feather name="lock" size={20} color="#667eea" />
            </View>
          </View>

          <Text className="text-2xl font-bold text-white text-center mb-3">
            {message}
          </Text>
          <Text className="text-base text-white/80 text-center leading-6 mb-10">
            {description}
          </Text>

          <TouchableOpacity
            onPress={requestPermission}
            activeOpacity={0.8}
            className="rounded-full overflow-hidden shadow-lg"
          >
            <LinearGradient
              colors={['#fff', '#f8f9fa']}
              className="flex-row items-center justify-center px-8 py-4"
            >
              <Text className="text-base font-semibold text-blue-600 mr-2">
                Grant Permission
              </Text>
              <Feather name="arrow-right" size={20} color="#667eea" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </View>
  )
}

export default memo(PermissionView)