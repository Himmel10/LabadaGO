import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, PanResponder, Animated, WebView } from 'react-native';
import { MapPin, X, Navigation, Search, ChevronDown } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { Colors } from '@/constants/colors';

interface LocationPickerModalProps {
  visible: boolean;
  selectedAddress: string;
  selectedCoords?: { latitude: number; longitude: number };
  onLocationSelected: (address: string, coords: { latitude: number; longitude: number }) => void;
  onClose: () => void;
}

const DEFAULT_COORDS = { latitude: 14.5994, longitude: 120.9842 }; // Manila, Philippines

export default function LocationPickerModal({
  visible,
  selectedAddress,
  selectedCoords,
  onLocationSelected,
  onClose,
}: LocationPickerModalProps) {
  const [searchAddress, setSearchAddress] = useState(selectedAddress);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number }>(
    selectedCoords || DEFAULT_COORDS
  );
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapMode, setMapMode] = useState<'address' | 'map'>('map'); // Toggle between modes
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (visible && useCurrentLocation) {
      getCurrentLocation();
    }
  }, [visible, useCurrentLocation]);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        setUseCurrentLocation(false);
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Try to get address from coordinates
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (addresses.length > 0) {
          const addr = addresses[0];
          const fullAddress = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''}`.trim();
          setSearchAddress(fullAddress);
        }
      } catch (error) {
        console.log('Reverse geocode error:', error);
      }

      // Animate map to current location
      setCurrentCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
      setUseCurrentLocation(false);
      setIsLoading(false);
    }
  };

  const handleMapDrag = async (region: any) => {
    const newCoords = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    setCurrentCoords(newCoords);

    // Reverse geocode the new coordinates
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        const fullAddress = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''}`.trim();
        setSearchAddress(fullAddress || `${newCoords.latitude.toFixed(4)}, ${newCoords.longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.log('Reverse geocode error:', error);
    }
  };

  const handleSearchAddressChange = (text: string) => {
    setSearchAddress(text);
  };

  const handleConfirm = () => {
    if (!searchAddress.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    onLocationSelected(searchAddress.trim(), currentCoords);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Pickup Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {mapMode === 'map' ? (
            <>
              {/* Map View using Leaflet */}
              <View style={styles.mapContainer}>
                <WebView
                  ref={webViewRef}
                  source={{
                    html: `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta charset="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                        <style>
                          body { margin: 0; padding: 0; }
                          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
                          .center-marker {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 50px;
                            height: 50px;
                            border: 3px solid #FF6B35;
                            border-radius: 50%;
                            pointer-events: none;
                            z-index: 1000;
                          }
                        </style>
                      </head>
                      <body>
                        <div id="map"></div>
                        <div class="center-marker"></div>
                        <script>
                          const map = L.map('map').setView([${currentCoords.latitude}, ${currentCoords.longitude}], 15);
                          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors',
                            maxZoom: 19
                          }).addTo(map);
                          
                          map.on('dragend', function() {
                            const center = map.getCenter();
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                              lat: center.lat,
                              lng: center.lng
                            }));
                          });
                        </script>
                      </body>
                      </html>
                    `,
                  }}
                  style={styles.webview}
                  originWhitelist={['*']}
                  onMessage={(e) => {
                    try {
                      const data = JSON.parse(e.nativeEvent.data);
                      const newCoords = {
                        latitude: data.lat,
                        longitude: data.lng,
                      };
                      setCurrentCoords(newCoords);
                      handleMapDrag(newCoords);
                    } catch (error) {
                      console.log('Map message error:', error);
                    }
                  }}
                  scrollEnabled={true}
                  z={10}
                />
              </View>

              {/* Location Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <MapPin size={18} color={Colors.primary} />
                  <Text style={styles.infoTitle}>Pinpointed Location</Text>
                </View>
                <Text style={styles.addressText} numberOfLines={2}>
                  {searchAddress}
                </Text>
                <Text style={styles.coordsText}>
                  {currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)}
                </Text>
              </View>

              {/* Mode Switcher */}
              <TouchableOpacity
                style={styles.modeSwitch}
                onPress={() => setMapMode('address')}
                activeOpacity={0.7}
              >
                <Text style={styles.modeSwitchText}>Enter Address Manually</Text>
                <ChevronDown size={18} color={Colors.primary} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Address Input Mode */}
              <View style={styles.addressModeContainer}>
                <View style={styles.searchSection}>
                  <View style={styles.searchInputGroup}>
                    <Search size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Enter your address"
                      placeholderTextColor={Colors.textTertiary}
                      value={searchAddress}
                      onChangeText={handleSearchAddressChange}
                    />
                  </View>

                  {/* Current Location Button */}
                  <TouchableOpacity
                    style={[styles.currentLocationBtn, isLoading && styles.currentLocationBtnDisabled]}
                    onPress={() => {
                      if (!isLoading) {
                        setUseCurrentLocation(!useCurrentLocation);
                      }
                    }}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <Navigation size={18} color={Colors.primary} />
                    <Text style={styles.currentLocationLabel}>
                      {isLoading ? 'Getting location...' : 'Use Current Location'}
                    </Text>
                  </TouchableOpacity>

                  {currentCoords && (
                    <View style={styles.coordsDisplay}>
                      <MapPin size={16} color={Colors.textSecondary} />
                      <Text style={styles.coordsText} numberOfLines={1}>
                        {currentCoords.latitude.toFixed(6)}, {currentCoords.longitude.toFixed(6)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    💡 Tip: You can switch to map view to pinpoint your exact location by dragging the map.
                  </Text>
                </View>

                {/* Mode Switcher */}
                <TouchableOpacity
                  style={styles.modeSwitch}
                  onPress={() => setMapMode('map')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modeSwitchText}>Use Map to Pinpoint</Text>
                  <ChevronDown size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
    paddingBottom: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    minHeight: 400,
  },
  webview: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 20,
  },
  addressModeContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  searchSection: {
    gap: 12,
    flex: 1,
  },
  searchInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  currentLocationBtnDisabled: {
    opacity: 0.6,
  },
  currentLocationLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  coordsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryFaded,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  coordsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primaryDark,
  },
  infoBox: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  modeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginHorizontal: -20,
    marginBottom: -16,
    marginTop: 8,
  },
  modeSwitchText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
