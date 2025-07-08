import * as Location from 'expo-location';

export const getAddress = async (latitude: number, longitude: number) => {
  try {
    const location = await Location.reverseGeocodeAsync({
      latitude: latitude,
      longitude: longitude,
    });
    // console.log("location", location);
    return location[0].formattedAddress;
  } catch (error) {
    console.log("error", error);
    throw error;
  }

};
