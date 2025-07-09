import { Stack, router } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Animated,
  Image,
  Alert,
  Modal,
  Share,
  ScrollView
} from 'react-native';
import { Button } from '~/components/Button';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { BlurView } from 'expo-blur';
import getAllAppPhotos from '~/utils/getAllPhotos';
import PermissionView from '~/components/PermissionView';
import * as MediaLibrary from 'expo-media-library';
import PhotoItem from '~/components/PhotoItem';
import LoadingView from '~/components/LoadingView';
import ToastManager, { Toast } from 'toastify-react-native'
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');



export default function Gallery() {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<MediaLibrary.Asset | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);


  useEffect(() => {
    (async () => {
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (mediaPermission.status === 'granted') {
        setHasPermission(true);
        setPermissionChecked(true);
      } else {
        setHasPermission(false);
        setPermissionChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const photos = await getAllAppPhotos();
      setPhotos(photos);
      // console.log(photos);
    })();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = async (photo: MediaLibrary.Asset) => {
    try {
      await Sharing.shareAsync(photo.uri, {
        dialogTitle: 'Share this Amazing Photo From GhostPin',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share photo');
    }
  };

  const handleDelete = (photoId: string) => {
    console.log(photoId);
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await MediaLibrary.deleteAssetsAsync([photoId]);
              if (result) {
                setShowFullScreen(false);
                setPhotos(photos.filter(p => p.id !== photoId));
                Toast.show({
                  text1: 'Photo deleted',
                  type: 'success',
                });
              } else {
                Toast.show({
                  text1: 'Photo could not be deleted',
                  type: 'error',
                });
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              Toast.show({
                text1: 'Error deleting photo',
                type: 'error',
              });
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  if (!permissionChecked) {
    return (
      <LoadingView message="Loading Gallery..." iconName="image" />
    )
  }



  if (!hasPermission) {
    return (
      <PermissionView message="Gallery Access Required"
        description="We need gallery permission to access your GhostPin photos with custom locations"
        requestPermission={MediaLibrary.requestPermissionsAsync}
        permissionChecked={true}
        iconName="image-off"
      />
    )
  }



  return (
    <>
      <Stack.Screen options={{ title: 'Gallery', headerShown: false }} />
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating background elements */}
        <View className="absolute inset-0 overflow-hidden">
          <View
            className="absolute w-72 h-72 rounded-full opacity-10"
            style={{
              backgroundColor: '#FFFFFF',
              top: -100,
              right: -100,
            }}
          />
          <View
            className="absolute w-48 h-48 rounded-full opacity-10"
            style={{
              backgroundColor: '#FFFFFF',
              bottom: -50,
              left: -50,
            }}
          />
        </View>

        {/* Animated watermark ghost */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 0,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.08],
            }),
            transform: [
              {
                rotate: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-5deg'],
                }),
              },
            ],
          }}
        >
          <MaterialCommunityIcons
            name="ghost"
            size={220}
            color="#FFFFFF"
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="flex-1 px-4 pt-16"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6 px-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
            >
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="flex-row items-center">
              <View className="mr-3 p-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Feather name="image" size={24} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-black text-white" style={{ letterSpacing: 1 }}>
                Gallery
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/camera')}
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
            >
              <Feather name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Glassmorphism container */}
          <Animated.View
            className="flex-1 rounded-3xl px-4 py-6"
            style={{
              transform: [{ scale: scaleAnim }],
              backgroundColor: 'rgba(255,255,255,0.25)',
              borderColor: 'rgba(255,255,255,0.3)',
              borderWidth: 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            {/* Stats Header */}
            <View className="flex-row justify-between items-center mb-6 px-2">
              <View className="items-center">
                <Text className="text-2xl font-black text-white">{photos.length}</Text>
                <Text className="text-sm text-white opacity-80">Photos</Text>
              </View>

              <View className="items-center">
                <Text className="text-2xl font-black text-white">
                  {Math.ceil((Date.now() - new Date(photos[photos.length - 1]?.modificationTime).getTime()) / (1000 * 60 * 60 * 24))}
                </Text>
                <Text className="text-sm text-white opacity-80">Days</Text>
              </View>
            </View>

            <View className="w-full h-px mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />

            {/* Photo Grid */}
            <FlatList
              data={photos}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item, index }) => (
                <PhotoItem item={item} index={index} setSelectedPhoto={setSelectedPhoto} setShowFullScreen={setShowFullScreen} width={width} />
              )}
              ListEmptyComponent={
                <View className="items-center justify-center py-16">
                  <MaterialCommunityIcons name="image-off" size={64} color="rgba(255,255,255,0.6)" />
                  <Text className="text-center mt-4 text-lg font-medium text-white opacity-80">
                    No photos yet
                  </Text>
                  <Text className="text-center mt-2 text-sm text-white opacity-60">
                    Start capturing memories with GhostPin
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/camera')}
                    className="mt-6 px-6 py-3 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <Text className="text-white font-semibold">Take Photo</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </Animated.View>
        </Animated.View>

        {/* Full Screen Photo Modal */}
        <Modal
          visible={showFullScreen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFullScreen(false)}
        >
          <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}>
            {selectedPhoto && (
              <>
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
                  <TouchableOpacity
                    onPress={() => setShowFullScreen(false)}
                    className="p-2"
                  >
                    <Feather name="x" size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View className="flex-row">
                    <TouchableOpacity
                      onPress={() => handleShare(selectedPhoto)}
                      className="p-2 mr-4"
                    >
                      <Feather name="share" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(selectedPhoto.id)}
                      className="p-2"
                    >
                      <Feather name="trash-2" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Photo */}
                <View className="flex-1 justify-center items-center px-4">
                  <Image
                    source={{ uri: selectedPhoto.uri }}
                    style={{
                      width: width - 32,
                      height: width - 32,
                      flex: 1,
                      borderRadius: 16,
                    }}
                    resizeMode="cover"
                  />
                </View>
              </>
            )}
          </View>
        </Modal>
      </LinearGradient>
    </>
  );
}