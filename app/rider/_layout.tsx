import React from 'react';
import { Tabs } from 'expo-router';
import { House, ClockArrowUp, CircleUser, Wallet } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function RiderLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.borderLight,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Tasks', tabBarIcon: ({ color, size }) => <House size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color, size }) => <ClockArrowUp size={size} color={color} /> }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet', tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <CircleUser size={size} color={color} /> }} />
      <Tabs.Screen name="tracking" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
