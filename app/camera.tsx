import { View, Text, Button, Pressable } from 'react-native'
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function Camera() {

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-bold text-black"  >We need your permission to show the camera</Text>
        <Pressable className="bg-blue-500 p-2 rounded-md" onPress={requestPermission} >
          <Text className="text-lg font-bold text-white">Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }


  return (
    <>
      {/* <Stack.Screen options={{ headerShown: false }} /> */}
      <View className="flex-1 items-center justify-center">
        <CameraView
          style={{ flex: 1, width: '100%', height: '100%' }}
          facing={facing}
          onCameraReady={() => console.log('Camera ready')}
        />
        <View className="flex-1 items-center justify-center absolute bottom-10 left-0 right-0">
          <Pressable className="w-[70px] h-[70px] rounded-full border-2 border-white items-center justify-center" >
            {({ pressed }) => (
              <View className="w-[70px] h-[70px] bg-white rounded-full items-center justify-center" style={{
                backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
                transform: [{ scale: pressed ? 0.86 : 1 }],
              }}>
                <Feather name="camera" size={32} color="#333" />
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </>
  )
}