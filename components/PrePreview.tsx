import { View, Text, TouchableOpacity, Animated, Image } from 'react-native'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/build/Feather';

const PrePreview = ({ photo, setPhoto, handleNext, isProcessing }: { photo: any, setPhoto: any, handleNext: () => void, isProcessing: boolean }) => {
  console.log("render PrePreview");

  const nextButtonAnim = useRef(new Animated.Value(0)).current;

  //next button animation
  useEffect(() => {
    // Entrance animation
    if (photo) {
      Animated.timing(nextButtonAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [photo]);

  const handleNextAdj = useCallback(async () => {
    
    Animated.sequence([
      Animated.timing(nextButtonAnim, { toValue: 0.8, duration: 10, useNativeDriver: true }),
      Animated.timing(nextButtonAnim, { toValue: 1, duration: 10, useNativeDriver: true }),
    ]).start();
  
      handleNext(); 
    
  }, [photo, handleNext]);
  


  return (
    <>
      <Image source={{ uri: `file://${photo.path}` }} className="w-full h-full"
        resizeMode="cover"
        style={{ flex: 1 }}
      />
      <View className="absolute top-0 left-0 right-0 z-10">
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
          className="pt-12 pb-5"
        >
          <View className="flex-row justify-between items-center px-5">
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-white/20 justify-center items-center"
              onPress={() => {
                setPhoto(null);
              }}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>


      {/* Bottom Controls */}
      <Animated.View
        style={{
          opacity: nextButtonAnim,
          transform: [{
            scale: nextButtonAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1]
            })
          }]
        }}

      >
        <TouchableOpacity
          className="mx-4 rounded-2xl overflow-hidden shadow-2xl mb-5 absolute bottom-0 left-0 right-0"
          onPress={handleNextAdj}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center py-4 px-8"
          >

            <>
              <Text className="text-white text-lg font-bold mr-3">{isProcessing ? 'Processing...' : 'Continue'}</Text>
              <View className="w-8 h-8 rounded-full bg-white/20 justify-center items-center">
                <Feather name="arrow-right" size={18} color="#fff" />
              </View>
            </>

          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </>
  )
}
 
export default memo(PrePreview) 