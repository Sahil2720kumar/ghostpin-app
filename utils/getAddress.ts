import * as Location from 'expo-location';

export const getAddress = async (latitude: number, longitude: number) => {
  console.log("from getAddress", latitude, longitude);
  const location = await Location.reverseGeocodeAsync({
    latitude: latitude,
    longitude: longitude,
    
    
  });
  console.log("from getAddress", location[0].formattedAddress);
  return location[0].formattedAddress;
};
