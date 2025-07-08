import { memo, useEffect, useRef } from "react";
import { Animated, TouchableOpacity, View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const PhotoItem = ({ item, index, setSelectedPhoto, setShowFullScreen, width }: { item: any, index: number, setSelectedPhoto: (photo: any) => void, setShowFullScreen: (show: boolean) => void, width: number }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;
  useEffect(() =>   {
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);


  return (
    <Animated.View
      style={{
        opacity: itemAnim,
        transform: [
          {
            scale: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={() => {
          setSelectedPhoto(item);
          setShowFullScreen(true);
        }}
        className="m-1 rounded-2xl overflow-hidden"
        style={{
          width: (width - 80) / 2,
          height: (width - 80) / 2,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
        }}
      >
        <Image
          source={{ uri: item.uri }}
          style={{flex: 1}}
          resizeMode="stretch"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};


export default memo(PhotoItem);