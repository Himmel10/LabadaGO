import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const authContext = useAuth();
  const user = authContext?.user;
  const isLoading = authContext?.isLoading ?? true;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const bubbleAnim1 = useRef(new Animated.Value(0)).current;
  const bubbleAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading && user) {
      const route = user.role === 'customer' ? '/customer' :
        user.role === 'shop_owner' ? '/shop-owner' :
        user.role === 'rider' ? '/rider' : '/admin';
      router.replace(route as any);
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleAnim1, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(bubbleAnim1, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleAnim2, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(bubbleAnim2, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (user) return null;

  return (
    <LinearGradient colors={['#1F5B4F', '#2D7A68', '#4FB6A6', '#7ED1C2']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[styles.bubble1, {
        transform: [{ translateY: bubbleAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }],
        opacity: bubbleAnim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.6, 0.3] }),
      }]} />
      <Animated.View style={[styles.bubble2, {
        transform: [{ translateY: bubbleAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) }],
        opacity: bubbleAnim2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.5, 0.2] }),
      }]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>LabadaGO</Text>
        <Text style={styles.subtitle}>Laundry made simple.{'\n'}Pick up. Wash. Deliver.</Text>

        <View style={styles.features}>
          {['Schedule pickup & delivery', 'Track your laundry in real-time', 'Transparent pricing & weighing'].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/login' as any)}
          activeOpacity={0.85}
          testID="get-started-btn"
        >
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/register' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Create an Account</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 24,
  },
  title: {
    fontSize: 44,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 26,
    marginBottom: 32,
  },
  features: {
    marginBottom: 40,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500' as const,
  },
  primaryBtn: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primaryDark,
  },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  bubble1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(126,209,194,0.12)',
    top: 80,
    right: -40,
  },
  bubble2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(79,182,166,0.1)',
    bottom: 120,
    left: -30,
  },
});
