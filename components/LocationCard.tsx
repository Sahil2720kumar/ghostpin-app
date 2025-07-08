import { Image,   StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { memo } from 'react'
import { WebView } from 'react-native-webview';
import { useLocationStore } from '~/store/locationStore';

const LocationCard =({item, onSelectLocation,handleAddLocation,showWatermark=false}: {item: any, onSelectLocation?: (location: any) => void,handleAddLocation?: (location: any) => void,showWatermark?: boolean}) => {
  
  return (
    <TouchableOpacity onPress={() => onSelectLocation?.(item) || handleAddLocation?.(item)} className="flex-row items-center rounded-2xl px-4 py-3 mb-3 shadow-lg"
    style={{
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: 'rgba(255,255,255,0.3)',
      borderWidth: 1, 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    }}>
    <View className="rounded-xl overflow-hidden mr-4 shadow-md">
      <Image 
      source={{ uri: `https://maps.locationiq.com/v2/staticmap?key=pk.14eefc98375ccdecae2fb7c940cee81e&center=${item.latitude},${item.longitude}&zoom=15&size=200x200&markers=icon:small-red-cutout|${item.latitude},${item.longitude}` }} 
      style={{ width: 80, height: 80 }}
      resizeMode="cover"
      />
    </View>
    <View className="flex-1">
      <Text className="text-sm font-bold text-gray-800 mb-1">
        latitude: {item.latitude}, 
      </Text>
      <Text className="text-sm font-bold text-gray-800 mb-1">
        longitude: {item.longitude}
      </Text>
      
      {item.address && (
        <Text className="text-sm font-medium text-gray-600 leading-5" numberOfLines={2}>
          {item.address}
        </Text>
      )}
      {showWatermark && <Text className="text-sm font-medium text-gray-600 leading-5">
        Captured By GhostPin
      </Text>}
    </View>
  </TouchableOpacity>
  )
}

// 🧠 Custom comparison to avoid re-render if `item` doesn't change
export default memo(LocationCard, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.latitude === nextProps.item.latitude &&
         prevProps.item.longitude === nextProps.item.longitude &&
         prevProps.item.address === nextProps.item.address;
});

const styles = StyleSheet.create({})