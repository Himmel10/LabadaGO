import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Animated, ScrollView } from 'react-native';
import { MapPin, X, Navigation, Search, ChevronDown, Maximize2, Minimize2 } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { Colors } from '@/constants/colors';

interface LocationPickerModalProps {
  visible: boolean;
  selectedAddress: string;
  selectedCoords?: { latitude: number; longitude: number };
  selectedLandmark?: string;
  selectedContactPerson?: string;
  selectedContactNumber?: string;
  onLocationSelected: (data: {
    address: string;
    street: string;
    barangay: string;
    municipality: string;
    province: string;
    landmark: string;
    contactPerson: string;
    contactNumber: string;
    coords: { latitude: number; longitude: number };
  }) => void;
  onClose: () => void;
}

const DEFAULT_COORDS = { latitude: 14.5994, longitude: 120.9842 }; // Manila, Philippines

export default function LocationPickerModal({
  visible,
  selectedAddress,
  selectedCoords,
  selectedLandmark,
  selectedContactPerson,
  selectedContactNumber,
  onLocationSelected,
  onClose,
}: LocationPickerModalProps) {
  // Address fields
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [province, setProvince] = useState('');
  
  // Optional fields
  const [landmark, setLandmark] = useState(selectedLandmark || '');
  const [contactPerson, setContactPerson] = useState(selectedContactPerson || '');
  const [contactNumber, setContactNumber] = useState(selectedContactNumber || '');
  
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number }>(
    selectedCoords || DEFAULT_COORDS
  );
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapMode, setMapMode] = useState<'address' | 'map'>('map'); // Toggle between modes
  const [isExpanded, setIsExpanded] = useState(false); // Track expansion state
  const mapViewRef = useRef<MapView>(null);

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

      // Only update coordinates for pinpointing - do not auto-fill form fields
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
    // Only update coordinates for pinpointing - do not auto-fill form fields
  };

  const handleConfirm = () => {
    // Validate required fields
    if (!street.trim() || !barangay.trim() || !municipality.trim() || !province.trim()) {
      Alert.alert('Error', 'Please fill in all address fields (Street, Barangay, Municipality, Province)');
      return;
    }

    if (!contactPerson.trim() || !contactNumber.trim()) {
      Alert.alert('Error', 'Please fill in Contact Person and Contact Number');
      return;
    }

    const fullAddress = `${street}, ${barangay}, ${municipality}, ${province}`;

    onLocationSelected({
      address: fullAddress,
      street: street.trim(),
      barangay: barangay.trim(),
      municipality: municipality.trim(),
      province: province.trim(),
      landmark: landmark.trim(),
      contactPerson: contactPerson.trim(),
      contactNumber: contactNumber.trim(),
      coords: currentCoords,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={[styles.content, isExpanded && styles.contentExpanded]}>
          {/* Shopee-style Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <View>
                <Text style={styles.title}>Edit Delivery Address</Text>
                <Text style={styles.headerSubtitle}>Complete all required fields</Text>
              </View>
            </View>
          </View>

          {mapMode === 'map' ? (
            <>
              {/* Form Fields - Always visible above map */}
              <ScrollView 
                style={styles.scrollableContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Address Details</Text>
                  
                  {/* Street Address */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Street Address *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., Purok 3"
                      placeholderTextColor={Colors.textTertiary}
                      value={street}
                      onChangeText={setStreet}
                    />
                  </View>

                  {/* Barangay */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Barangay *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., Barangay Ipil"
                      placeholderTextColor={Colors.textTertiary}
                      value={barangay}
                      onChangeText={setBarangay}
                    />
                  </View>

                  {/* Municipality - Province Row */}
                  <View style={styles.twoColumnRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Municipality / City *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="e.g., Cantilan"
                        placeholderTextColor={Colors.textTertiary}
                        value={municipality}
                        onChangeText={setMunicipality}
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Province *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="e.g., Surigao del Sur"
                        placeholderTextColor={Colors.textTertiary}
                        value={province}
                        onChangeText={setProvince}
                      />
                    </View>
                  </View>

                  {/* Landmark */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Landmark (Optional)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., Near Ipil Elementary School"
                      placeholderTextColor={Colors.textTertiary}
                      value={landmark}
                      onChangeText={setLandmark}
                    />
                  </View>

                  {/* Contact Person */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Contact Person *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., Charlie"
                      placeholderTextColor={Colors.textTertiary}
                      value={contactPerson}
                      onChangeText={setContactPerson}
                    />
                  </View>

                  {/* Contact Number */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Contact Number *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="+63 9xx xxx xxxx"
                      placeholderTextColor={Colors.textTertiary}
                      value={contactNumber}
                      onChangeText={setContactNumber}
                      keyboardType="phone-pad"
                    />
                  </View>

                  {/* Map View using Google Maps */}
                  <View style={styles.mapSectionHeader}>
                    <Text style={styles.sectionTitle}>Pinpoint Location on Map</Text>
                  </View>
                </View>

                <View style={styles.mapContainer}>
                  <MapView
                    ref={mapViewRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.webview}
                    initialRegion={{
                      latitude: currentCoords.latitude,
                      longitude: currentCoords.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                    onRegionChangeComplete={(region) => {
                      setCurrentCoords({
                        latitude: region.latitude,
                        longitude: region.longitude,
                      });
                      handleMapDrag({
                        latitude: region.latitude,
                        longitude: region.longitude,
                      });
                    }}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    rotateEnabled={false}
                    pitchEnabled={false}
                  >
                    {/* Central marker with Shopee-style pin */}
                    <Marker
                      coordinate={{
                        latitude: currentCoords.latitude,
                        longitude: currentCoords.longitude,
                      }}
                      title="Pinpointed Location"
                      description={`${currentCoords.latitude.toFixed(6)}, ${currentCoords.longitude.toFixed(6)}`}
                    />
                  </MapView>
                  
                  {/* Shopee-style center marker overlay */}
                  <View style={styles.mapCenterMarker}>
                    <View style={styles.mapPin} />
                  </View>
                </View>

                {/* Location Info Card */}
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <MapPin size={18} color="#2563EB" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoTitle}>Pinpointed Location</Text>
                      <Text style={styles.coordsText}>
                        📍 {currentCoords.latitude.toFixed(6)}, {currentCoords.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </>
          ) : (
            <>
              {/* Address Form Mode - Scrollable */}
              <ScrollView 
                style={styles.addressFormContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Delivery Address Details</Text>
                  
                  {/* Street Address */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Street Address *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., Purok 3"
                      placeholderTextColor={Colors.textTertiary}
                      value={street}
                      onChangeText={setStreet}
                    />
                  </View>

                  {/* Barangay */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Barangay *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., Barangay Ipil"
                      placeholderTextColor={Colors.textTertiary}
                      value={barangay}
                      onChangeText={setBarangay}
                    />
                  </View>
                  {/* Municipality - Province Row */}
                  <View style={[styles.twoColumnRow, { marginTop: 20 }]}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Municipality / City *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="e.g., Cantilan"
                        placeholderTextColor={Colors.textTertiary}
                        value={municipality}
                        onChangeText={setMunicipality}
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Province *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="e.g., Surigao del Sur"
                        placeholderTextColor={Colors.textTertiary}
                        value={province}
                        onChangeText={setProvince}
                      />
                    </View>
                  </View>

                  {/* Landmark */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Landmark (Optional)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., Near Ipil Elementary School"
                      placeholderTextColor={Colors.textTertiary}
                      value={landmark}
                      onChangeText={setLandmark}
                    />
                  </View>

                  {/* Contact Person - Contact Number Row */}
                  <View style={styles.twoColumnRow}>
                    <View style={[styles.formGroup, { flex: 1.5 }]}>
                      <Text style={styles.label}>Contact Person *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="e.g., Charlie"
                        placeholderTextColor={Colors.textTertiary}
                        value={contactPerson}
                        onChangeText={setContactPerson}
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Contact Number *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="+63 9xx xxx xxxx"
                        placeholderTextColor={Colors.textTertiary}
                        value={contactNumber}
                        onChangeText={setContactNumber}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  {/* Use Current Location Button */}
                  <TouchableOpacity
                    style={[styles.locationBtn, isLoading && styles.locationBtnDisabled]}
                    onPress={() => {
                      if (!isLoading) {
                        setUseCurrentLocation(!useCurrentLocation);
                      }
                    }}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    <Navigation size={18} color={Colors.primary} />
                    <Text style={styles.locationBtnText}>
                      {isLoading ? 'Getting location...' : 'Use My Current Location'}
                    </Text>
                  </TouchableOpacity>

                  {/* Tip Box */}
                  <View style={styles.tipBox}>
                    <Text style={styles.tipText}>
                      💡 Tip: Switch to map view to pinpoint your exact location.
                    </Text>
                  </View>

                  {/* Switch to Map Button */}
                  <TouchableOpacity
                    style={styles.modeSwitchButton}
                    onPress={() => setMapMode('map')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modeSwitchText}>Use Map to Pinpoint Location</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '95%',
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  contentExpanded: {
    maxHeight: '95%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    height: 320,
    position: 'relative',
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  mapContainerExpanded: {
    minHeight: '100%',
  },
  mapCenterMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  mapPin: {
    width: 36,
    height: 36,
    backgroundColor: '#2563EB',
    borderRadius: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
  mapSectionHeader: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 8,
  },
  quickInfoCard: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    zIndex: 10,
  },
  quickInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickInfoText: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.white,
    opacity: 0.9,
  },
  quickInfoAddress: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 20,
  },
  coordsDisplayCompact: {
    backgroundColor: Colors.primaryFaded,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
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
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  formSection: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  modeSwitchButton: {
    marginHorizontal: 12,
    marginVertical: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
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
    fontWeight: '700' as const,
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
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
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  addressFormContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 10,
    marginBottom: 12,
  },
  locationBtnDisabled: {
    opacity: 0.6,
  },
  locationBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  tipBox: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  tipText: {
    fontSize: 12,
    color: '#F57C00',
    lineHeight: 17,
  },
});
