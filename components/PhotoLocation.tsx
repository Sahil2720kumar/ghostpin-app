import { Image, Text, TouchableOpacity, View } from 'react-native'
import React, { memo } from 'react'
import { WebView } from 'react-native-webview'
import { useLocationStore } from '~/store/locationStore'
import { LinearGradient } from 'expo-linear-gradient' // Install: expo install expo-linear-gradient

const PhotoLocation = ({
  item,
  onSelectLocation,
  handleAddLocation,
  showWatermark = false
}: {
  item: any
  onSelectLocation?: (location: any) => void
  handleAddLocation?: (location: any) => void
  showWatermark?: boolean
}) => {
  return (
    <TouchableOpacity onPress={() => onSelectLocation?.(item) || handleAddLocation?.(item)} className="flex-row items-center rounded-2xl px-1 py-3 mb-3 shadow-lg"
      style={{
        backgroundColor: 'transparent',
        // borderColor: 'rgba(255,255,255,0.3)',
        // borderWidth: 1, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,

      }}>
      <View className="rounded-xl overflow-hidden mr-4 shadow-md">
        <Image
          source={{ uri: `https://maps.locationiq.com/v2/staticmap?key=pk.14eefc98375ccdecae2fb7c940cee81e&center=${item.latitude},${item.longitude}&zoom=15&size=200x200&markers=icon:small-red-cutout|${item.latitude},${item.longitude}` }}
          style={{ width: 100, height: 100 }}
          resizeMode="cover"
        />
      </View>
      <View className="flex-1 bg-black/50 p-2 rounded-2xl h-[100px]">
        <View className="flex-row gap-2">
          <Text className="text-sm font-bold text-white mb-1">
            Lat: {item.latitude}°
          </Text>
          <Text className="text-sm font-bold text-white mb-1">
            Long: {item.longitude}°
          </Text>
        </View>
        {item.address && (
          <Text className="text-sm font-medium text-white leading-5" numberOfLines={2}>
            {item.address}
          </Text>
        )}
        <View className="flex-row justify-between">
          <Text className="text-sm font-medium text-white leading-5">
            {new Date().toLocaleString()}
          </Text>
        </View>
        {showWatermark && <Text className="text-sm font-medium text-white leading-5">
          Captured By GhostPin
        </Text>}
      </View>
    </TouchableOpacity>
  )
}

// 🧠 Custom comparison to avoid re-render if `item` doesn't change
export default memo(PhotoLocation, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.latitude === nextProps.item.latitude &&
    prevProps.item.longitude === nextProps.item.longitude &&
    prevProps.item.address === nextProps.item.address &&
    prevProps.showWatermark === nextProps.showWatermark
  )
})