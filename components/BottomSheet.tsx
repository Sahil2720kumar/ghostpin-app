import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useLocationStore } from "~/store/locationStore";
import LocationCard from "./LocationCard";

const { height } = Dimensions.get("window");

// Define interfaces
interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  ref: React.RefObject<BottomSheet>;
  openBottomSheet: () => void;
  title?: string;
  showDeleteOption?: boolean;
  onSelectLocation: (location: Location) => void;
  locations: Location[];
  removeLocation: (locationId: string) => void;
}

export default function BottomSheetComponent({
  visible,
  onClose,
  ref,
  openBottomSheet,
  title = "Select Location",
  showDeleteOption = false,
  onSelectLocation,
  removeLocation,
}: Props) {
  const selectedLocation = useLocationStore(state => state.selectedLocation);
  const setSelectedLocation = useLocationStore(state => state.setSelectedLocation);
  const locations = useLocationStore(state => state.locations);


  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      onClose();
    }
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.latitude.toString().includes(searchQuery) ||
      location.longitude.toString().includes(searchQuery)
  );

  
  const handleSelectLocation =  useCallback((location: Location) => {
    console.log("handleSelectLocation",location);
    
    setSelectedLocationId(location.id);
    setSelectedLocation(location);
    // onSelectLocation(location);
    console.log(selectedLocation)
    onClose();
  }, [selectedLocation,setSelectedLocation, onClose]);

  const handleDeleteLocation = (locationId: string) => {
    Alert.alert(
      "Delete Location",
      "Are you sure you want to delete this location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeLocation(locationId),
        },
      ]
    );
  };

  return (
    <BottomSheet
      ref={ref}
      index={visible ? 0 : -1}
      snapPoints={["80%"]}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      enableDynamicSizing={false}
      enableHandlePanningGesture={true}
      enableContentPanningGesture={true}
    // backgroundStyle={{ backgroundColor: "transparent" }}
    >
      <BottomSheetView style={{ flex: 1,backgroundColor: 'pink',height: '100%' }}>
      <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}

        >
          {/* Floating background elements */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
            <View
              style={{
                position: "absolute",
                width: 192,
                height: 192,
                borderRadius: 96,
                backgroundColor: "#FFFFFF",
                opacity: 0.1,
                top: -60,
                right: -60,
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 128,
                height: 128,
                borderRadius: 64,
                backgroundColor: "#FFFFFF",
                opacity: 0.1,
                bottom: 100,
                left: -40,
              }}
            />
          </View>

          <View style={{ flex: 1, paddingTop: 24 }}>
            {/* Header */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              paddingBottom: 16
            }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{
                  marginRight: 12,
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)"
                }}>
                  <MaterialCommunityIcons name="map-marker-multiple" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: "#FFFFFF",
                    letterSpacing: 0.8
                  }}>
                    {title}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: "#FFFFFF",
                    opacity: 0.8,
                    fontWeight: "500"
                  }}>
                    {locations.length} locations available
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={()=>ref.current?.close()}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)"
                }}
              >
                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
              <View style={{ position: "relative" }}>
                <View style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  zIndex: 10
                }}>
                  <Feather name="search" size={20} color="#667eea" />
                </View>
                <TextInput
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingLeft: 45,
                    paddingVertical: 12,
                    color: "#333",
                    fontSize: 16,
                    fontWeight: "500",
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.3)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                  placeholder="Search locations..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Locations List */}
            <View style={{ flex: 1, paddingHorizontal: 24 }}>
              <FlatList
                data={filteredLocations}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                className="w-full"
                renderItem={({ item, index }) => (
                  <LocationCard item={item} onSelectLocation={handleSelectLocation} />
                )}
                ListEmptyComponent={
                  <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 48
                  }}>
                    <MaterialCommunityIcons
                      name={searchQuery ? "map-search-outline" : "map-marker-plus"}
                      size={64}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={{
                      textAlign: "center",
                      marginTop: 16,
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#FFFFFF",
                      opacity: 0.8
                    }}>
                      {searchQuery ? "No locations found" : "No locations saved"}
                    </Text>
                    <Text style={{
                      textAlign: "center",
                      marginTop: 8,
                      fontSize: 14,
                      color: "#FFFFFF",
                      opacity: 0.6,
                      paddingHorizontal: 32
                    }}>
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Add your first location using the Add Location screen"}
                    </Text>
                  </View>
                }
              />
            </View>

            {/* Bottom Action */}
            {filteredLocations.length > 0 && (
              <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 16
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons name="gesture-tap" size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={{
                      color: "#FFFFFF",
                      opacity: 0.8,
                      marginLeft: 8,
                      fontWeight: "500"
                    }}>
                      Tap any location to select
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </BottomSheetView>
    </BottomSheet>
  );
}