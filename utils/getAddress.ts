import * as Location from 'expo-location';

export const getAddress = async (latitude: number, longitude: number) => {
  const location = await Location.reverseGeocodeAsync({
    latitude: latitude,
    longitude: longitude,
    
    
  });
  return location[0].formattedAddress;
};
