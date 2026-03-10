import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '@/constants/colors';
import { MapPin, Navigation, Navigation2 } from 'lucide-react-native';

interface TrackingMapProps {
  riderLocation?: { latitude: number; longitude: number };
  customerLocation?: { latitude: number; longitude: number };
  shopLocation?: { latitude: number; longitude: number };
  showUserLocation?: boolean;
  height?: number;
  markerLabel?: string;
}

export default function TrackingMap({
  riderLocation,
  customerLocation,
  shopLocation,
  showUserLocation = true,
  height = 400,
  markerLabel = 'Location',
}: TrackingMapProps) {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [mapAvailable] = useState(false); // For future: try to load MapView

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted' && showUserLocation) {
        setIsLoading(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.log('Location permission error:', error);
      setLocationPermission(false);
    }
  };

  // Calculate distance between two coordinates (simplified)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  if (!locationPermission && showUserLocation) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.permissionContainer}>
          <MapPin size={32} color={Colors.textTertiary} />
          <Text style={styles.permissionText}>Location permission required</Text>
          <Text style={styles.permissionSubtext}>Enable location access to view the map</Text>
        </View>
      </View>
    );
  }

  // Fallback UI showing tracking information when map is not available
  const distance = riderLocation && customerLocation
    ? calculateDistance(riderLocation.latitude, riderLocation.longitude, customerLocation.latitude, customerLocation.longitude)
    : 0;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.mapPlaceholder}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>📍 Live Location Tracking</Text>
            <Text style={styles.headerSubtitle}>Rider location data is being tracked in real-time</Text>
          </View>
        </View>

        {/* Tracking Info Section */}
        <ScrollView style={styles.infoScroll} showsVerticalScrollIndicator={false}>
          {riderLocation && (
            <View style={styles.locationCard}>
              <View style={styles.cardIcon}>
                <Navigation2 size={24} color={Colors.error} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Rider Current Location</Text>
                <Text style={styles.cardCoord}>
                  {riderLocation.latitude.toFixed(4)}°, {riderLocation.longitude.toFixed(4)}°
                </Text>
              </View>
            </View>
          )}

          {customerLocation && (
            <View style={styles.locationCard}>
              <View style={[styles.cardIcon, { backgroundColor: Colors.info + '20' }]}>
                <MapPin size={24} color={Colors.info} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Your Location (Pickup)</Text>
                <Text style={styles.cardCoord}>
                  {customerLocation.latitude.toFixed(4)}°, {customerLocation.longitude.toFixed(4)}°
                </Text>
              </View>
            </View>
          )}

          {shopLocation && (
            <View style={styles.locationCard}>
              <View style={[styles.cardIcon, { backgroundColor: Colors.success + '20' }]}>
                <MapPin size={24} color={Colors.success} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Laundry Shop Location</Text>
                <Text style={styles.cardCoord}>
                  {shopLocation.latitude.toFixed(4)}°, {shopLocation.longitude.toFixed(4)}°
                </Text>
              </View>
            </View>
          )}

          {riderLocation && customerLocation && (
            <View style={styles.distanceCard}>
              <View style={styles.distanceIcon}>
                <Navigation size={20} color={Colors.primary} />
              </View>
              <View style={styles.distanceInfo}>
                <Text style={styles.distanceLabel}>Distance to Pickup</Text>
                <Text style={styles.distanceValue}>{distance.toFixed(2)} km</Text>
              </View>
            </View>
          )}

          {userLocation && showUserLocation && (
            <View style={styles.deviceLocationCard}>
              <View style={[styles.cardIcon, { backgroundColor: Colors.accent + '20' }]}>
                <MapPin size={24} color={Colors.accent} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Your Device Location</Text>
                <Text style={styles.cardCoord}>
                  {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📡 Map Features Coming Soon</Text>
            <Text style={styles.infoText}>
              Real-time map visualization will display when location data is available. The system is currently tracking and displaying location coordinates for optimal route planning.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  infoScroll: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cardCoord: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  distanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primaryFaded,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  distanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceInfo: {
    flex: 1,
    gap: 4,
  },
  distanceLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primaryDark,
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  deviceLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBox: {
    backgroundColor: Colors.info + '15',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.info + '30',
    gap: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.info,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    gap: 12,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  permissionSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

