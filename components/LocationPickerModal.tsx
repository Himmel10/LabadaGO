import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Keyboard } from 'react-native';
import { MapPin, X, ChevronDown } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { getProvinces, getMunicipalities, getBarangays } from '@/constants/philippinesData';
import { getCoordinates } from '@/constants/geocoordinates';

// ⚠️ IMPORTANT: Replace with your actual Google Maps API Key from console.cloud.google.com
const GOOGLE_MAPS_API_KEY = 'AIzaSyDT8LKY3wErBbZ2WOEELzYHh6XCypsbpbk';

const DropdownMenu = memo(({
  items,
  onSelect,
  onClose: closeDropdown,
  searchValue,
  onSearchChange,
}: {
  items: string[];
  onSelect: (item: string) => void;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (text: string) => void;
}) => {
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchValue.toLowerCase())
  );
  const searchInputRef = useRef<TextInput>(null);

  return (
    <View style={styles.dropdownMenu}>
      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={Colors.textTertiary}
          value={searchValue}
          onChangeText={onSearchChange}
          returnKeyType="done"
          blurOnSubmit={false}
          editable={true}
          selectTextOnFocus={false}
        />
      </View>

      {/* Items or No Results */}
      <ScrollView 
        style={styles.dropdownScroll} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEnabled={filteredItems.length > 4}
        keyboardShouldPersistTaps="always"
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.dropdownItem}
              onPress={() => {
                Keyboard.dismiss();
                setTimeout(() => {
                  onSelect(item);
                  closeDropdown();
                }, 100);
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.dropdownItemText}>{item}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
});

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
  const { user } = useAuth();

  // Address fields
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState(selectedLandmark || '');
  const [contactPerson, setContactPerson] = useState(selectedContactPerson || user?.name || '');
  const [contactNumber, setContactNumber] = useState(selectedContactNumber || user?.phone || '');

  // Dropdown states
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showMunicipalityDropdown, setShowMunicipalityDropdown] = useState(false);
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);

  // Search states
  const [provinceSearch, setProvinceSearch] = useState('');
  const [municipalitySearch, setMunicipalitySearch] = useState('');
  const [barangaySearch, setBarangaySearch] = useState('');

  // Map and location
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number }>(
    selectedCoords || DEFAULT_COORDS
  );
  const mapViewRef = useRef<MapView>(null);

  // Get dropdown data
  const provinces = getProvinces();
  const municipalities = province ? getMunicipalities(province) : [];
  const barangays = province && municipality ? getBarangays(province, municipality) : [];

  // Reset secondary dropdowns when province changes
  useEffect(() => {
    setMunicipality('');
    setBarangay('');
  }, [province]);

  // Reset barangay when municipality changes
  useEffect(() => {
    setBarangay('');
  }, [municipality]);

  // Auto-fill user contact info on mount
  useEffect(() => {
    if (visible && user && !contactPerson) {
      setContactPerson(user.name || '');
      setContactNumber(user.phone || '');
    }
  }, [visible, user]);

  // Geocode address and update map coordinates
  const geocodeAddress = useCallback(async () => {
    console.log('geocodeAddress called with:', { street, barangay, municipality, province });
    
    if (!barangay || !municipality || !province) {
      console.log('Address incomplete, skipping geocoding');
      return;
    }

    try {
      let foundCoords: { latitude: number; longitude: number } | null = null;

      // Try 1: Use local geocoordinates database first (instant, no API calls)
      console.log('Trying local geocoordinates database...');
      foundCoords = getCoordinates(municipality, province);
      if (foundCoords) {
        console.log('Found in local database:', foundCoords);
        setCurrentCoords(foundCoords);
        
        // Animate map immediately
        setTimeout(() => {
          if (mapViewRef.current && foundCoords) {
            mapViewRef.current.animateToRegion(
              {
                latitude: foundCoords.latitude,
                longitude: foundCoords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              },
              500
            );
          }
        }, 100);
        return;
      }

      console.log('Not in local database, trying Google Maps Geocoding API...');
      
      // Try 2: Use Google Maps Geocoding API
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('YOUR_API_KEY')) {
        console.warn('Google Maps API key not configured. Using OpenCage fallback.');
        // Continue to OpenCage fallback below
      } else {
        const addresses = [
          `${barangay}, ${municipality}, ${province}, Philippines`,
          `${municipality}, ${province}, Philippines`,
          `${province}, Philippines`
        ];

        for (const fullAddress of addresses) {
          console.log('Trying Google Maps with:', fullAddress);
          
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
          
          try {
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Google Maps response status:', data.status);
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const result = data.results[0];
              foundCoords = {
                latitude: result.geometry.location.lat,
                longitude: result.geometry.location.lng
              };
              console.log('Found via Google Maps:', foundCoords, 'Address:', result.formatted_address);
              setCurrentCoords(foundCoords);
              
              // Animate map
              setTimeout(() => {
                if (mapViewRef.current && foundCoords) {
                  mapViewRef.current.animateToRegion(
                    {
                      latitude: foundCoords.latitude,
                      longitude: foundCoords.longitude,
                      latitudeDelta: 0.02,
                      longitudeDelta: 0.02,
                    },
                    500
                  );
                }
              }, 100);
              return;
            } else if (data.status === 'ZERO_RESULTS') {
              console.log('No results for:', fullAddress);
            } else if (data.status === 'REQUEST_DENIED') {
              console.error('API key invalid or request denied:', data.error_message);
              break; // Stop trying with invalid key
            }
          } catch (error) {
            console.log('Google Maps fetch error:', error instanceof Error ? error.message : String(error));
            continue;
          }
        }
      }

      // Try 3: Fallback to OpenCage if Google Maps not configured or failed
      console.log('Google Maps unavailable, trying OpenCage API...');
      const addresses = [
        `${municipality}, ${province}, Philippines`,
        `${province}, Philippines`
      ];

      for (const fullAddress of addresses) {
        console.log('Trying OpenCage with:', fullAddress);
        
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(fullAddress)}&language=en&limit=1&countrycode=ph`;
        
        try {
          const response = await fetch(url);
          
          if (!response.ok) {
            console.log('OpenCage response not ok:', response.status);
            continue;
          }
          
          const data = await response.json();
          console.log('OpenCage response:', data);
          
          if (data && data.results && data.results.length > 0) {
            const result = data.results[0];
            foundCoords = {
              latitude: result.geometry.lat,
              longitude: result.geometry.lng
            };
            console.log('Found via OpenCage:', foundCoords);
            setCurrentCoords(foundCoords);
            
            // Animate map
            setTimeout(() => {
              if (mapViewRef.current && foundCoords) {
                mapViewRef.current.animateToRegion(
                  {
                    latitude: foundCoords.latitude,
                    longitude: foundCoords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  },
                  500
                );
              }
            }, 100);
            return;
          }
        } catch (error) {
          console.log('OpenCage error:', error instanceof Error ? error.message : String(error));
          continue;
        }
      }
      
      console.log('Could not find coordinates from any source');
    } catch (error) {
      console.error('Geocoding error:', error instanceof Error ? error.message : String(error));
    }
  }, [barangay, municipality, province]);

  // Trigger geocoding when address details change
  useEffect(() => {
    console.log('useEffect triggered, scheduling geocode');
    const timer = setTimeout(() => {
      console.log('Timeout fired, calling geocodeAddress');
      geocodeAddress();
    }, 500);
    return () => clearTimeout(timer);
  }, [geocodeAddress]);

  const handleConfirm = () => {
    if (!street.trim() || !barangay.trim() || !municipality.trim() || !province.trim()) {
      Alert.alert('Error', 'Please fill in all address fields');
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

  const DropdownButton = ({
    label,
    value,
    onPress,
    disabled = false,
  }: {
    label: string;
    value: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.dropdownButton, disabled && styles.dropdownButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownButtonContent}>
        <Text style={[styles.dropdownButtonLabel, !value && styles.placeholderText]}>
          {value || `Select ${label}`}
        </Text>
      </View>
      <ChevronDown size={20} color={disabled ? Colors.textTertiary : Colors.primary} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header with X button on right */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Edit Address</Text>
              <Text style={styles.headerSubtitle}>Complete all required fields</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollableContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Address Details</Text>

              {/* Province Dropdown */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Province *</Text>
                <DropdownButton
                  label="Province"
                  value={province}
                  onPress={() => {
                    setShowProvinceDropdown(!showProvinceDropdown);
                    setProvinceSearch(''); // Reset search when opening
                  }}
                />
                {showProvinceDropdown && (
                  <DropdownMenu
                    items={provinces}
                    onSelect={setProvince}
                    onClose={() => {
                      setShowProvinceDropdown(false);
                      setProvinceSearch('');
                    }}
                    searchValue={provinceSearch}
                    onSearchChange={setProvinceSearch}
                  />
                )}
              </View>

              {/* Municipality Dropdown */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Municipality / City *</Text>
                <DropdownButton
                  label="Municipality"
                  value={municipality}
                  onPress={() => {
                    setShowMunicipalityDropdown(!showMunicipalityDropdown);
                    setMunicipalitySearch(''); // Reset search when opening
                  }}
                  disabled={!province}
                />
                {showMunicipalityDropdown && (
                  <DropdownMenu
                    items={municipalities}
                    onSelect={setMunicipality}
                    onClose={() => {
                      setShowMunicipalityDropdown(false);
                      setMunicipalitySearch('');
                    }}
                    searchValue={municipalitySearch}
                    onSearchChange={setMunicipalitySearch}
                  />
                )}
              </View>

              {/* Barangay Dropdown */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Barangay *</Text>
                <DropdownButton
                  label="Barangay"
                  value={barangay}
                  onPress={() => {
                    setShowBarangayDropdown(!showBarangayDropdown);
                    setBarangaySearch(''); // Reset search when opening
                  }}
                  disabled={!municipality}
                />
                {showBarangayDropdown && (
                  <DropdownMenu
                    items={barangays}
                    onSelect={setBarangay}
                    onClose={() => {
                      setShowBarangayDropdown(false);
                      setBarangaySearch('');
                    }}
                    searchValue={barangaySearch}
                    onSearchChange={setBarangaySearch}
                  />
                )}
              </View>

              {/* Street Address */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Street Address *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Purok 3, House No. 45"
                  placeholderTextColor={Colors.textTertiary}
                  value={street}
                  onChangeText={setStreet}
                />
              </View>

              {/* Landmark */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Landmark (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Near ABC Elementary School"
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
                  placeholder="e.g., John Doe"
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

              {/* Map Section */}
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Pinpoint Location on Map</Text>
              <Text style={styles.mapHint}>Drag the map to adjust the exact location</Text>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
              <MapView
                ref={mapViewRef}
                provider={PROVIDER_GOOGLE}
                style={styles.mapView}
                initialRegion={{
                  latitude: currentCoords.latitude,
                  longitude: currentCoords.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
                onRegionChangeComplete={(region) => {
                  setCurrentCoords({
                    latitude: region.latitude,
                    longitude: region.longitude,
                  });
                }}
                scrollEnabled={true}
                zoomEnabled={true}
                rotateEnabled={false}
                pitchEnabled={false}
              >
              </MapView>

              {/* Needle-style center pinpoint */}
              <View style={styles.mapCenterMarker}>
                <View style={styles.needlePin}>
                  <View style={styles.needleBall} />
                  <View style={styles.needlePoint} />
                </View>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.infoText}>
                {province && municipality && barangay && street
                  ? `${street}, ${barangay}, ${municipality}, ${province}`
                  : 'Complete address details above'}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Confirm Address</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
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
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: {
    flex: 1,
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
  closeButton: {
    padding: 8,
  },
  scrollableContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  formSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  dropdownButtonDisabled: {
    opacity: 0.5,
  },
  dropdownButtonContent: {
    flex: 1,
  },
  dropdownButtonLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
    marginTop: 4,
    overflow: 'hidden',
  },
  searchInputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    padding: 8,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownScroll: {
    padding: 4,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  noResultsContainer: {
    paddingHorizontal: 14,
    paddingVertical: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  formInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
  },
  mapContainer: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
    position: 'relative',
  },
  mapView: {
    flex: 1,
  },
  mapCenterMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -28 }],
    zIndex: 10,
    alignItems: 'center',
  },
  needlePin: {
    alignItems: 'center',
  },
  needleBall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC143C',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 8,
  },
  needlePoint: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#DC143C',
    marginTop: -1,
  },
  mapHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic' as const,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryFaded,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginVertical: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primaryDark,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
